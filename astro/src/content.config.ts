import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 与 Hugo frontmatter 一一对应；lastmod 迁移时改名为 updatedDate
const post = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/post' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    updatedDate: z.date().optional(),
    weight: z.number().optional(), // 专栏内篇号（仅在所属专栏内有意义）
    cover: z.string().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    description: z.string().default(''),
    math: z.boolean().default(false),
    mermaid: z.boolean().default(false),
    comments: z.boolean().default(true),
    toc: z.boolean().default(true),
  }),
});

// 专栏元数据，替代 Hugo 的 content/categories/<name>/_index.md
const columns = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/columns' }),
  schema: z.object({
    title: z.string(),
    category: z.string(), // 与文章的 categories 项精确匹配，如「人工智能学习」
    order: z.number(),
    cover: z.string(),
    description: z.string(),
  }),
});

export const collections = { post, columns };
