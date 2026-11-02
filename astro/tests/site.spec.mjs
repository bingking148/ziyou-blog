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
