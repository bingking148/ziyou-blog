import manifest from '../generated/images.json';

interface ImageVariant { src: string; width: number }
interface ImageInfo { width: number; height: number; variants: ImageVariant[] }
const images = manifest as Record<string, ImageInfo>;

/** 构建期静态资源映射；未知外链/动图不经过转换。 */
export function responsive(src: string, sizes = '100vw') {
  const info = images[src];
  if (!info) return { src };
  return {
    src,
    srcset: info.variants.map((v) => `${v.src} ${v.width}w`).join(', '),
    sizes,
    width: info.width,
    height: info.height,
    decoding: 'async' as const,
  };
}
