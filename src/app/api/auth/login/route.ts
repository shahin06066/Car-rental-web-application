import { NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, verifyPassword, signToken } from '@/lib/auth';

const DEMO = { email: 'demo@vanguard.com', password: 'demo123', name: 'Alex Rivera' };

export async function POST(req: Request) {
  const { email, password } = await req.json();
  if (!email || !password) return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  const normalized = String(email).toLowerCase();

  let [user] = await db.select().from(users).where(eq(users.email, normalized)).limit(1);

  // Seed the demo account on first use so the preview is always explorable.
  if (!user && normalized === DEMO.email && password === DEMO.password) {
    [user] = await db
      .insert(users)
      .values({ name: DEMO.name, email: DEMO.email, password: await hashPassword(DEMO.password), role: 'admin' })
      .returning();
  }

  if (!user || !(await verifyPassword(password, user.password))) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }

  const safe = { id: user.id, name: user.name, email: user.email, role: user.role };
  const token = signToken({ id: user.id, email: user.email, role: user.role });
  const res = NextResponse.json({ user: safe, token });
  res.cookies.set('vg_token', token, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 * 7 });
  return res;
}
