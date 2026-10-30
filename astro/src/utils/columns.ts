import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'post'>;
type Column = CollectionEntry<'columns'>;

/** 文章所属专栏（按 categories 精确匹配专栏的 category 字段） */
export function columnOf(post: Post, columns: Column[]): Column | undefined {
  return columns.find((c) => post.data.categories.includes(c.data.category));
}

/** 专栏内文章按 weight（篇号）升序 */
export function columnPosts(column: Column, posts: Post[]): Post[] {
  return posts
    .filter((p) => p.data.categories.includes(column.data.category))
    .sort((a, b) => (a.data.weight ?? 0) - (b.data.weight ?? 0));
}

/** 与 Hugo 的 URLize 对齐：ASCII 小写化、空白转连字符，CJK 保留 */
export function slugifyTaxonomy(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function postUrl(post: Post): string {
  return `/post/${post.id}/`;
}
