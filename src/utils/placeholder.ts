const PLACEHOLDERS = [
  { src: '/placeholder/ph-1.jpg', caption: 'Foto di Steve Johnson su Unsplash' },
  { src: '/placeholder/ph-2.jpg', caption: 'Foto di Steve Johnson su Unsplash' },
  { src: '/placeholder/ph-3.jpg', caption: 'Foto di Steve Johnson su Unsplash' },
  { src: '/placeholder/ph-4.jpg', caption: 'Foto di vackground.com su Unsplash' },
];

export function getPlaceholder(slug: string): { src: string; caption: string } {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  return PLACEHOLDERS[hash % PLACEHOLDERS.length];
}
