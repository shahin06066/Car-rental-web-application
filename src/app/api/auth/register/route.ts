import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
  const { name, email, password } = await req.json();
  if (!name || !email || !password || String(password).length < 6) {
    return NextResponse.json({ error: 'Name, email and a 6+ character password are required.' }, { status: 400 });
  }
  const normalized = String(email).toLowerCase();
  const [existing] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);
  if (existing) return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });

  const [created] = await db
    .insert(users)
    .values({ name, email: normalized, password: await hashPassword(password), role: 'customer' })
    .returning({ id: users.id, name: users.name, email: users.email, role: users.role });

  const token = signToken({ id: created.id, email: created.email, role: created.role });
  const res = NextResponse.json({ user: created, token }, { status: 201 });
  res.cookies.set('vg_token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
