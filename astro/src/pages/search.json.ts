import { getCollection } from 'astro:content';
import type { APIRoute } from 'astro';
import { postUrl } from '../utils/columns.ts';

// 与 Hugo layouts/search.json 同构的搜索索引（构建期生成）
export const GET: APIRoute = async () => {
  const posts = await getCollection('post');
  const items = posts
    .sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
    .map((p) => ({
      title: p.data.title,
      permalink: postUrl(p),
      description: p.data.description,
      date: p.data.date.toISOString().slice(0, 10),
      tags: p.data.tags,
      categories: p.data.categories,
      content: (p.body ?? '')
        .replace(/```[\s\S]*?```/g, ' ') // 去代码块
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 去图片
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 链接保留文字
        .replace(/[#>*`|-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 4000),
    }));
  return new Response(JSON.stringify(items), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
