import { NextResponse } from 'next/server';
import { COOKIE, checkPassword, tokenFor } from '@/lib/auth';

export async function POST(req) {
  const { password } = await req.json().catch(() => ({}));
  if (!process.env.ADMIN_PASSWORD)
    return NextResponse.json({ error: 'Nincs beállítva ADMIN_PASSWORD.' }, { status: 500 });
  if (!checkPassword(password)) {
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json({ error: 'Hibás jelszó.' }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE, tokenFor(process.env.ADMIN_PASSWORD), {
    httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', path: '/',
    maxAge: 60 * 60 * 24 * 14,
  });
  return res;
}
