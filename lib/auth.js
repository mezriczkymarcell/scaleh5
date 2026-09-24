import { createHmac, timingSafeEqual } from 'crypto';
import { cookies } from 'next/headers';

export const COOKIE = 'mb_admin';

export function tokenFor(password) {
  return createHmac('sha256', password).update('moodboard-admin-v1').digest('hex');
}

function safeEq(a, b) {
  const A = Buffer.from(a || ''), B = Buffer.from(b || '');
  return A.length === B.length && timingSafeEqual(A, B);
}

export function checkPassword(pw) {
  const real = process.env.ADMIN_PASSWORD;
  return !!real && safeEq(tokenFor(pw || ''), tokenFor(real));
}

export async function isAdmin() {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  return safeEq(c, tokenFor(real));
}
