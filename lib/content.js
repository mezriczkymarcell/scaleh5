import { list, put, del } from '@vercel/blob';
import { unstable_cache } from 'next/cache';
import { DEFAULT_CONTENT, normalize } from './defaults';

const PREFIX = 'content/';
const hasBlob = () => !!process.env.BLOB_READ_WRITE_TOKEN;

async function allContentBlobs() {
  const { blobs } = await list({ prefix: PREFIX });
  return blobs.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
}

export async function getContentFresh() {
  if (!hasBlob()) return normalize(DEFAULT_CONTENT);
  try {
    const [latest] = await allContentBlobs();
    if (!latest) return normalize(DEFAULT_CONTENT);
    const res = await fetch(latest.url, { cache: 'no-store' });
    return normalize(await res.json());
  } catch (e) {
    console.error('getContent', e);
    return normalize(DEFAULT_CONTENT);
  }
}

// Nyilvános oldal: gyorsítótárazva, mentéskor revalidateTag('content') üríti
export const getContent = unstable_cache(getContentFresh, ['mb-content'], { tags: ['content'] });

// Minden mentés új (egyedi URL-ű) JSON-t ír, így CDN-cache nem ad régi tartalmat.
export async function saveContent(data) {
  const content = normalize(data);
  await put(`${PREFIX}content.json`, JSON.stringify(content), {
    access: 'public',
    addRandomSuffix: true,
    contentType: 'application/json',
  });
  // takarítás: régi tartalomfájlok + már nem használt képek
  try {
    const old = (await allContentBlobs()).slice(1).map((b) => b.url);
    const used = new Set(content.boards.flatMap((b) => b.images).filter(Boolean));
    const { blobs: imgs } = await list({ prefix: 'images/' });
    const unused = imgs.filter((b) => !used.has(b.url)).map((b) => b.url);
    const toDelete = [...old, ...unused];
    if (toDelete.length) await del(toDelete);
  } catch (e) {
    console.error('cleanup', e);
  }
  return content;
}
