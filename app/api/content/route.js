import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/auth';
import { getContent, saveContent } from '@/lib/content';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'auth' }, { status: 401 });
  return NextResponse.json({ content: await getContent(), blob: !!process.env.BLOB_READ_WRITE_TOKEN });
}

export async function PUT(req) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'auth' }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN)
    return NextResponse.json({ error: 'Nincs bekötve Vercel Blob store.' }, { status: 500 });
  const body = await req.json();
  const content = await saveContent(body);
  revalidatePath('/', 'layout');
  return NextResponse.json({ content });
}
