// utils/extractImage.js
export default function extractImage(item) {
  if (item.enclosure && item.enclosure.url) return item.enclosure.url;
  if (item.media && item.media.content) return item.media.content.url;
  return null;
}
 