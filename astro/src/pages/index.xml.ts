import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { SITE_TITLE, SITE_DESCRIPTION, RSS_LIMIT } from '../consts.ts';
import { postUrl } from '../utils/columns.ts';

// 保持 Hugo 时代的 /index.xml 路径，RSS 订阅者不受影响
export const GET: APIRoute = async (context) => {
  const posts = (await getCollection('post'))
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .slice(0, RSS_LIMIT);
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site!,
    items: posts.map((p) => ({
      title: p.data.title,
      description: p.data.description,
      pubDate: p.data.date,
      link: postUrl(p),
      categories: [...new Set([...p.data.categories, ...p.data.tags])],
      // 真实更新时间（有 updatedDate 才输出），让 RSS 阅读器能识别「老文章有新修订」
      customData: p.data.updatedDate && p.data.updatedDate.getTime() !== p.data.date.getTime()
        ? `<atom:updated>${p.data.updatedDate.toISOString()}</atom:updated>`
        : undefined,
    })),
    customData:
      '<language>zh-CN</language>' +
      `<atom:link href="${new URL('/index.xml', context.site!).href}" rel="self" type="application/rss+xml"/>` +
      (posts[0]
        ? `<atom:updated>${(posts[0].data.updatedDate ?? posts[0].data.date).toISOString()}</atom:updated>`
        : ''),
    xmlns: { atom: 'http://www.w3.org/2005/Atom' },
  });
};
