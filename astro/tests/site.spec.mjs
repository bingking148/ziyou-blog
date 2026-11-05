import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // 不蒜子与第三方统计不可控，站点本就允许其失败隐藏；测试不等待这些外部请求。
  await page.route(/^https?:\/\/(?!127\.0\.0\.1)/, (route) => route.abort());
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
});

test('桌面首页无横向溢出，移动菜单键盘可用', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await expect(page.locator('.scene-title')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '打开导航菜单' }).click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await expect(page.locator('#mobile-menu a', { hasText: '首页' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#mobile-menu')).toBeHidden();
  await expect(page.getByRole('button', { name: '打开导航菜单' })).toBeFocused();
});

test('跳正文、明暗主题与无 JS 内容回退', async ({ page }) => {
  await page.goto('/archives/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: '跳到正文' })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  // nav-pill 装饰层在动画中会拦截 pointer；用键盘激活按钮，避免测试依赖动画帧。
  await page.getByRole('button', { name: '切换到深色模式' }).press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#14181f');
});

test('禁用 JavaScript 时正文与导航仍可见', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('/post/fraction-splitting-telescoping/');
  await expect(page.locator('.prose h2').first()).toBeVisible();
  await expect(page.locator('.mobile-toc summary')).toBeVisible();
  await page.locator('.mobile-toc summary').click();
  await expect(page.locator('.mobile-toc')).toHaveAttribute('open', '');
  await page.goto('/search/');
  await expect(page.locator('.search-noscript')).toBeVisible();
  await context.close();
});

test('搜索索引懒加载、URL 同步与失败重试', async ({ page }) => {
  var failSearch = true;
  await page.route('**/search.json', async (route) => {
    if (failSearch) await route.abort();
    else await route.continue();
  });
  await page.goto('/search/');
  expect(await page.evaluate(() => performance.getEntriesByType('resource').some((r) => r.name.endsWith('/search.json')))).toBe(false);
  await page.locator('#search-input').fill('裂项');
  await expect(page.locator('#search-retry')).toBeVisible();
  failSearch = false;
  await page.locator('#search-retry').click();
  await expect(page.locator('.result-row').first()).toBeVisible();
  await expect(page).toHaveURL(/\?q=%E8%A3%82%E9%A1%B9/);
  // 新加载页面（带 ?q=）：脚本应当读取 URL 并直接触发搜索
  await page.goto('/search/?q=Python');
  await expect(page.locator('#search-input')).toHaveValue('Python');
  await expect(page.locator('.result-row').first()).toBeVisible({ timeout: 10000 });
});

test('文章目录、顶部进度、表格与代码复制按钮', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/post/blog-launch-from-zero/');
  await expect(page.locator('.mobile-progress')).toBeVisible();
  await expect(page.locator('.mobile-toc')).toBeVisible();
  await page.locator('.mobile-toc summary').click();
  await expect(page.locator('.mobile-toc')).toHaveAttribute('open', '');
  await page.evaluate(() => scrollTo(0, document.querySelector('.post-main').offsetHeight));
  await expect.poll(() => page.locator('.mobile-progress').getAttribute('aria-valuenow')).not.toBe('0');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.reload();
  await expect(page.locator('.reading-ruler')).toBeVisible();
  // 目录脚本依赖 .prose 里实际存在的 h2 id；等任意一个 toc 链接进入激活态即可
  await expect(page.locator('.toc-link[aria-current="true"]')).toHaveCount(1, { timeout: 10000 });
});

test('Waline 延迟请求且保留原评论 path', async ({ page }) => {
  await page.goto('/post/blog-launch-from-zero/');
  await expect(page.locator('#waline')).toHaveAttribute('data-waline-path', '/post/blog-launch-from-zero/');
  expect(await page.evaluate(() => performance.getEntriesByType('resource').some((r) => r.name.includes('/resources/waline/waline.mjs')))).toBe(false);
  await page.route('**/resources/waline/waline.mjs', (route) => route.abort());
  await page.locator('#waline-load-btn').click();
  await expect(page.locator('#waline-load-btn')).toHaveText('加载失败，点击重试');
});

test('数学公式 CSS 按实际内容加载', async ({ page }) => {
  await page.goto('/post/natural-selection-vs-use-and-disuse/');
  await expect(page.locator('link[href="/resources/katex/katex.min.css"]')).toHaveCount(1);
  await expect(page.locator('.katex')).not.toHaveCount(0);
});

test('320/640/768 与横屏不产生横向溢出', async ({ page }) => {
  for (const size of [{ width: 320, height: 568 }, { width: 640, height: 900 }, { width: 768, height: 1024 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size);
    await page.goto('/post/fraction-splitting-telescoping/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${size.width} 宽溢出`).toBe(true);
  }
});

test('宽屏页面多栏完整、无横向溢出且导航胶囊不错位', async ({ page }) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const paths = [
    '/', '/archives/', '/categories/', '/categories/建站/', '/tags/', '/tags/python/',
    '/columns/', '/about/', '/friend/', '/search/?q=Python',
    '/categories/python基础/', '/post/blog-launch-from-zero/', '/404.html',
  ];
  for (const width of [1440, 1920, 2000]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const path of paths) {
      await page.goto(encodeURI(path));
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width} ${path} 横向溢出`).toBe(true);
      const pill = await page.locator('.nav-pill').evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { position: getComputedStyle(el).position, left: r.left, right: r.right, width: r.width };
      });
      expect(pill.position).toBe('absolute');
      expect(pill.width).toBeGreaterThan(0);
      expect(pill.left).toBeGreaterThanOrEqual(0);
      expect(pill.right).toBeLessThanOrEqual(width + 1);
    }
  }
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/search/?q=Python');
  await expect(page.locator('.result-row').first()).toBeVisible();
  await expect(page.locator('.search-results')).toHaveCSS('grid-template-columns', /.+ .+/);
  await page.goto('/columns/');
  await expect(page.locator('.column-block')).toHaveCount(4);
  await expect(page.locator('.column-grid')).toHaveCSS('grid-template-columns', /.+ .+/);
  const covers = await page.locator('.column-cover').evaluateAll((els) => els.map((el) => el.getBoundingClientRect().width));
  expect(covers.every((width) => width <= 160), '专栏封面应保持小画幅').toBe(true);
});

test('宽屏文章正文与两侧栏、阅读标尺互不重叠', async ({ page }) => {
  for (const width of [1440, 1920, 2000, 2560]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/post/blog-launch-from-zero/');
    await expect(page.locator('.post-side-meta')).toBeVisible();
    const boxes = await page.evaluate(() => Object.fromEntries(
      ['.post-toc-aside', '.post-main', '.post-mood-aside', '.reading-ruler'].map((selector) => {
        const r = document.querySelector(selector).getBoundingClientRect();
        return [selector, { left: r.left, right: r.right, width: r.width }];
      }),
    ));
    expect(boxes['.post-toc-aside'].right, `${width} 目录侵入正文`).toBeLessThan(boxes['.post-main'].left);
    expect(boxes['.post-main'].right, `${width} 正文侵入右侧栏`).toBeLessThan(boxes['.post-mood-aside'].left);
    expect(boxes['.post-mood-aside'].right, `${width} 标尺侵入右侧栏`).toBeLessThan(boxes['.reading-ruler'].left);
    expect(boxes['.post-main'].width, `${width} 正文应保持舒适阅读宽度`).toBeLessThanOrEqual(861);
  }
});


test('专栏合集卡片在桌面双列、手机单列且保持小封面', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [1920, 1440, 1080, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/columns/');
    await expect(page.locator('.column-block')).toHaveCount(4);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width} 宽横向溢出`).toBe(true);
    const columns = await page.locator('.column-grid').evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);
    expect(columns, `${width} 宽栏数`).toBe(width > 1080 ? 2 : 1);
    const boxes = await page.locator('.column-block').evaluateAll((els) => els.map((el) => {
      const r = el.getBoundingClientRect();
      return { left: r.left, right: r.right };
    }));
    expect(boxes.every((r) => r.left >= 0 && r.right <= width + 1), `${width} 宽卡片越界`).toBe(true);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.locator('.column-cover').first().evaluate((el) => el.getBoundingClientRect().width)).toBeLessThanOrEqual(96);
});

test('专栏序章紧凑无重复目录，归档封面支持鼠标与键盘预览', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.goto('/categories/python基础/');
  await expect(page.locator('.column-masthead h1')).toHaveCount(1);
  await expect(page.locator('.column-intro table')).toHaveCount(0);
  await expect(page.locator('.column-visual')).toBeVisible();
  const boxes = await page.evaluate(() => Object.fromEntries(['.column-masthead', '.column-intro', '.journey'].map((selector) => {
    const r = document.querySelector(selector).getBoundingClientRect();
    return [selector, { top: r.top, bottom: r.bottom }];
  })));
  expect(boxes['.column-masthead'].bottom).toBeLessThanOrEqual(boxes['.column-intro'].top);
  expect(boxes['.column-intro'].bottom).toBeLessThanOrEqual(boxes['.journey'].top);
  expect(boxes['.column-masthead'].bottom - boxes['.column-masthead'].top).toBeLessThan(760);
  await page.goto('/archives/');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  const first = page.locator('.archive-year .ed-row').first();
  const preview = first.locator('.archive-preview');
  await expect(preview).toBeHidden();
  await first.hover();
  await expect(preview).toBeVisible();
  await expect.poll(() => preview.locator('img').evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  await expect(preview.locator('img')).toHaveAttribute('alt', '');
  await expect(preview).toHaveCSS('pointer-events', 'none');
  const previewBox = await preview.boundingBox();
  expect(previewBox.x).toBeGreaterThanOrEqual(0);
  expect(previewBox.x + previewBox.width).toBeLessThanOrEqual(1920);
  await page.mouse.move(10, 100);
  await expect(preview).toBeHidden();
  await first.focus();
  await expect(preview).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(preview).toBeHidden();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(preview).toBeHidden();
  await page.setViewportSize({ width: 1920, height: 1080 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await first.hover();
  await expect(preview).toBeHidden();
});
test('专栏按篇号排列，曲线随滚动绘制且响应窗口变化', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/categories/python基础/');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-journey]')).toHaveClass(/is-enhanced/);
  const items = page.locator('[data-journey-item]');
  // 数量从页面动态推导，内容增删不再需要改测试
  const n = await items.count();
  expect(n).toBeGreaterThan(0);
  await expect(page.locator('.journey-number')).toHaveCount(n);
  await expect(page.locator('.journey-number')).toHaveText(Array.from({ length: n }, (_, i) => String(i + 1).padStart(2, '0')));
  await expect(page.locator('[data-journey-line]')).toHaveCount(n - 1);
  await expect(items.first().locator('a')).toHaveAttribute('href', '/post/python-zero-setup/');
  await items.first().scrollIntoViewIfNeeded();
  await expect(items.first()).toHaveClass(/is-reached/);
  await expect(items.nth(1)).not.toHaveClass(/is-reached/);
  const desktopPath = await page.locator('[data-journey-line]').first().getAttribute('d');
  // 第 1 张底部发出端口 → 第 2 张顶部接收端口，滚动到两端口正中应画到一半。
  const midpoint = await page.evaluate(() => {
    const out = document.querySelectorAll('[data-journey-out]')[0];
    const into = document.querySelectorAll('[data-journey-in]')[1];
    const y = (el) => el.getBoundingClientRect().top + el.getBoundingClientRect().height / 2 + scrollY;
    const target = (y(out) + y(into)) / 2 - innerHeight * 0.68;
    scrollTo(0, target);
    return target;
  });
  await expect.poll(() => page.locator('[data-journey-line]').first().evaluate((el) => Number.parseFloat(getComputedStyle(el).strokeDashoffset))).toBeCloseTo(0.5, 1);
  await expect(items.nth(1)).not.toHaveClass(/is-reached/);
  // 卡片按顶部接收端口激活：滚过 in[1] 后第 2 张出现，第一段也应画完。
  await page.evaluate(() => {
    const port = document.querySelectorAll('[data-journey-in]')[1];
    const target = port.getBoundingClientRect().top + port.getBoundingClientRect().height / 2 + scrollY;
    scrollTo(0, target - innerHeight * 0.68 + 50);
  });
  await expect(items.nth(1)).toHaveClass(/is-reached/);
  await expect.poll(() => page.locator('[data-journey-line]').first().evaluate((el) => getComputedStyle(el).strokeDashoffset)).toBe('0px');
  await page.evaluate((y) => scrollTo(0, y), midpoint - 300);
  await expect.poll(() => page.locator('[data-journey-line]').first().evaluate((el) => getComputedStyle(el).strokeDashoffset)).toBe('1px');
  await page.setViewportSize({ width: 390, height: 844 });
  await expect.poll(() => page.locator('[data-journey-line]').first().getAttribute('d')).not.toBe(desktopPath);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const positions = await items.evaluateAll((els) => els.map((el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right };
  }));
  expect(positions.every((p) => p.left === positions[0].left && p.right === positions[0].right)).toBe(true);
  await expect(page.locator('[data-journey-preview]').first()).toBeHidden();
  await page.goto('/categories/数学笔记/');
  await expect(page.locator('.ed-list')).toBeVisible();
  await expect(page.locator('[data-journey]')).toHaveCount(0);
});

test('专栏手绘散落保持稳定，封面预览支持指针与键盘且不越界', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/categories/python基础/');
  const first = page.locator('.journey-card').first();
  await first.scrollIntoViewIfNeeded();
  await expect(first).toHaveCSS('opacity', '1');
  const desktop = await page.locator('[data-journey-item]').evaluateAll((els) => els.map((el) => {
    const r = el.getBoundingClientRect();
    return { left: r.left, right: r.right, top: r.top + scrollY };
  }));
  expect(new Set(desktop.map((r) => Math.round(r.left))).size).toBeGreaterThan(2);
  expect(desktop.every((r, i) => i === 0 || r.top > desktop[i - 1].top)).toBe(true);
  expect(desktop.every((r) => r.left >= 0 && r.right <= 1440)).toBe(true);
  await expect(page.locator('.journey-board')).toHaveCount(1);
  const n = await page.locator('[data-journey-item]').count();
  await expect(page.locator('.journey-card-outline')).toHaveCount(n);
  await expect(page.locator('.journey-card-pencil')).toHaveCount(n);
  await expect(page.locator('[data-journey-pin]')).toHaveCount(n);
  await expect(page.locator('[data-journey-in]')).toHaveCount(n);
  await expect(page.locator('[data-journey-out]')).toHaveCount(n);
  await expect(page.locator('.journey-paper-back')).toHaveCount(n);
  await expect(page.locator('[data-journey-line]')).toHaveCount(n - 1);
  await expect(page.locator('[data-journey-echo]')).toHaveCount(n - 1);
  await expect(page.locator('[data-journey-grain]')).toHaveCount(n - 1);
  const preview = page.locator('[data-journey-preview="0"]');
  await first.hover({ position: { x: 120, y: 100 } });
  await expect(preview).toBeVisible();
  await expect(preview.locator('img')).toHaveAttribute('alt', '');
  await expect.poll(() => preview.locator('img').evaluate((img) => img.complete && img.naturalWidth > 0)).toBe(true);
  let box = await preview.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(1440);
  expect(box.y + box.height).toBeLessThanOrEqual(900);
  await page.mouse.move(5, 5);
  await expect(preview).toBeHidden();
  // 键盘事件由鼠标之后产生，依然必须匹配 :focus-visible 才显示封面。
  await page.keyboard.press('Tab');
  await first.focus();
  await expect(first).toBeFocused();
  await expect(preview).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(preview).toBeHidden();

  // 靠近视口右下角时仍完整显示，浮层不能截断。
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
  const last = page.locator('.journey-card').last();
  await last.hover({ position: { x: 300, y: 100 } });
  const lastPreview = page.locator('[data-journey-preview]').last();
  await expect(lastPreview).toBeVisible();
  box = await lastPreview.boundingBox();
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(1440);
  expect(box.y + box.height).toBeLessThanOrEqual(900);
  await page.mouse.move(5, 5);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await last.hover();
  await expect(lastPreview).toBeHidden();

  for (const width of [761, 1000, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width} 宽散落卡片溢出`).toBe(true);
  }
});

test('专栏触屏点击直接打开文章，不经过封面预览', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/categories/python基础/');
  await expect(page.locator('[data-journey-preview]').first()).toBeHidden();
  await page.locator('.journey-card').first().tap();
  await expect(page).toHaveURL(/\/post\/python-zero-setup\/$/);
  await context.close();
});


test('专栏在减少动态效果与无 JavaScript 时完整可读', async ({ page, browser }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/categories/python基础/');
  await expect(page.locator('[data-journey-item]').first()).toBeVisible();
  expect(await page.locator('[data-journey-item]').evaluateAll((els) => els.every((el) => getComputedStyle(el).opacity === '1'))).toBe(true);
  expect(await page.locator('[data-journey-line]').evaluateAll((els) => els.every((el) => getComputedStyle(el).strokeDashoffset === '0px'))).toBe(true);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('[data-journey-item]').nth(1)).not.toHaveClass(/is-reached/);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('[data-journey-item]').nth(14)).toHaveClass(/is-reached/);
  await expect(page.locator('[data-journey-line]').first()).toHaveCSS('stroke-dashoffset', '0px');

  const context = await browser.newContext({ javaScriptEnabled: false });
  const staticPage = await context.newPage();
  await staticPage.goto('/categories/python基础/');
  await expect(staticPage.locator('.journey-card').first()).toBeVisible();
  await expect(staticPage.locator('.journey-card').last()).toBeVisible();
  await expect(staticPage.locator('.chapter-rule .cr-title')).toBeVisible();
  // 无 JS 时相邻卡片之间画静态短箭头；脚本接管后换逐段曲线。
  expect(await staticPage.evaluate(() => {
    const li = document.querySelector('[data-journey-item]');
    return Number.parseFloat(getComputedStyle(li, '::after').height) > 20;
  })).toBe(true);
  await context.close();
});

test('移动端正文列完整落在视口内，不被裁切到左侧外', async ({ page }) => {
  // 回归：单栏 @media 覆盖若写在 .post-body-grid 基础规则之前，会被同特异性的
  // 三栏基础规则覆盖；两侧 aside 隐藏后正文落进 200px 轨道，再被
  // justify-content:center 推到视口左侧外——scrollWidth 不增长，只能查元素位置。
  await page.setViewportSize({ width: 390, height: 844 });
  for (const slug of ['python-closures-decorators', 'fraction-splitting-telescoping']) {
    await page.goto(`/post/${slug}/`);
    const box = await page.evaluate(() => {
      const r = document.querySelector('.post-main').getBoundingClientRect();
      return { left: r.left, right: r.right, vw: innerWidth };
    });
    expect(box.left, `${slug} 正文左缘被裁`).toBeGreaterThanOrEqual(0);
    expect(box.right, `${slug} 正文右缘溢出`).toBeLessThanOrEqual(box.vw + 1);
  }
});

test('内页三装置：目录卡、档案卷宗与名片灯', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  // 搜索 · 目录卡与键盘流
  await page.goto('/search/');
  await expect(page.locator('.cat-tab')).toBeVisible();
  await expect(page.locator('.cat-stamp')).toHaveText('查');
  await page.locator('#search-input').fill('工具调用');
  await expect(page.locator('.result-row h3 em').first()).toHaveText('工具调用');
  await expect(page.locator('.result-row .hit-meter i.on').first()).toBeVisible();
  await page.keyboard.press('ArrowDown');
  await expect(page.locator('.result-row.is-active')).toHaveCount(1);
  await page.keyboard.press('Escape');
  await expect(page.locator('.result-row')).toHaveCount(0);
  // 无结果状态给出热词出口
  await page.locator('#search-input').fill('不存在的关键词xyzq');
  await expect(page.locator('#search-status .suggest-btn').first()).toBeVisible();

  // 关于 · 卷宗指标与索引对账（数量随内容增长仍然成立）
  await page.goto('/about/');
  await expect(page.locator('.dos-tab')).toHaveText('FILE NO. 001 · OPEN');
  await expect(page.locator('.dos-seal')).toHaveText('自由');
  const total = (await (await page.request.get('/search.json')).json()).length;
  const nums = await page.locator('.dos-metrics .metric dd').allTextContents();
  expect(nums[0].trim()).toBe(String(total));

  // 友链 · 名片与灯的数量关系（朋友数变化不破坏断言）
  await page.goto('/friend/');
  await expect(page.locator('.lamp-lede h1')).toContainText('一盏灯');
  await expect(page.locator('.bc-copy')).toBeVisible();
  const friends = await page.locator('.bizcard.fr').count();
  expect(friends).toBeGreaterThan(0);
  await expect(page.locator('.bizcard')).toHaveCount(friends + 2);
  await expect(page.locator('.lamp.on')).toHaveCount(friends + 1);
  await expect(page.locator('.lamp.off')).toHaveCount(1);
});
