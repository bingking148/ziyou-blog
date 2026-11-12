import type { CollectionEntry } from 'astro:content';

type Post = CollectionEntry<'post'>;
type Column = CollectionEntry<'columns'>;

/** 文章所属专栏（按 categories 精确匹配专栏的 category 字段） */
export function columnOf(post: Post, columns: Column[]): Column | undefined {
  return columns.find((c) => post.data.categories.includes(c.data.category));
}

export type ColumnSection = {
  title: string;
  category: string;
  description?: string;
  posts: Post[];
};

function byWeight(a: Post, b: Post): number {
  return (a.data.weight ?? 0) - (b.data.weight ?? 0);
}

/** 专栏内部分段。没有 sections 的专栏返回 null，仍走整栏一篇列表。 */
export function columnSectionGroups(column: Column, posts: Post[]): ColumnSection[] | null {
  const sections = column.data.sections;
  if (!sections?.length) return null;
  return sections.map((section) => ({
    title: section.title,
    category: section.category,
    description: section.description,
    posts: posts
      .filter(
        (p) =>
          p.data.categories.includes(column.data.category) &&
          p.data.categories.includes(section.category),
      )
      .sort(byWeight),
  }));
}

/** 专栏内文章。有分段时按段序、段内按 weight；否则整栏按 weight。 */
export function columnPosts(column: Column, posts: Post[]): Post[] {
  const groups = columnSectionGroups(column, posts);
  if (groups) return groups.flatMap((group) => group.posts);
  return posts.filter((p) => p.data.categories.includes(column.data.category)).sort(byWeight);
}

/** 与 Hugo 的 URLize 对齐：ASCII 小写化、空白转连字符，CJK 保留 */
export function slugifyTaxonomy(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-');
}

export function postUrl(post: Post): string {
  return `/post/${post.id}/`;
}
