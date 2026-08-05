import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [updated] = await db
    .update(bookings)
    .set({ status: 'cancelled', paymentStatus: 'refunded' })
    .where(eq(bookings.id, Number(id)))
    .returning();
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, booking: updated });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const [updated] = await db
    .update(bookings)
    .set({ status: body.status ?? 'confirmed' })
    .where(eq(bookings.id, Number(id)))
    .returning();
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ success: true, booking: updated });
}
