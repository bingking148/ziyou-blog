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
      categories: [...p.data.categories, ...p.data.tags],
    })),
    customData: '<language>zh-CN</language>',
  });
};
