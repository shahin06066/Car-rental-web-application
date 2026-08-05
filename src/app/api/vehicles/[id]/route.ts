import { NextResponse } from 'next/server';
import { db } from '@/db';
import { vehicles, bookings } from '@/db/schema';
import { and, eq, ne } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function parseId(id: string) {
  const n = Number.parseInt(id, 10);
  return Number.isNaN(n) ? null : n;
}

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = parseId(id);
  if (n === null) return NextResponse.json({ error: 'Invalid vehicle id' }, { status: 400 });

  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, n)).limit(1);
  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

  const similar = await db
    .select()
    .from(vehicles)
    .where(and(eq(vehicles.category, vehicle.category), ne(vehicles.id, vehicle.id)))
    .limit(3);

  return NextResponse.json({ ...vehicle, similar });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = parseId(id);
  if (n === null) return NextResponse.json({ error: 'Invalid vehicle id' }, { status: 400 });

  const body = await req.json();
  const patch: Record<string, unknown> = {};
  for (const k of ['brand', 'model', 'category', 'transmission', 'fuelType', 'image', 'description'] as const) {
    if (body[k] !== undefined) patch[k] = body[k];
  }
  if (body.pricePerDay !== undefined) patch.pricePerDay = String(body.pricePerDay);
  if (body.seats !== undefined) patch.seats = Number(body.seats);
  if (body.available !== undefined) patch.available = Boolean(body.available);

  if (Object.keys(patch).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });

  const [updated] = await db.update(vehicles).set(patch).where(eq(vehicles.id, n)).returning();
  if (!updated) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const n = parseId(id);
  if (n === null) return NextResponse.json({ error: 'Invalid vehicle id' }, { status: 400 });

  const linked = await db.select({ id: bookings.id }).from(bookings).where(eq(bookings.vehicleId, n)).limit(1);
  if (linked.length) {
    return NextResponse.json(
      { error: 'This vehicle has bookings attached. Mark it unavailable instead of deleting.' },
      { status: 409 },
    );
  }

  const [deleted] = await db.delete(vehicles).where(eq(vehicles.id, n)).returning({ id: vehicles.id });
  if (!deleted) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
