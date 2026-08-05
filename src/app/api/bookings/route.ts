import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, users, vehicles, payments } from '@/db/schema';
import { and, desc, eq, lt, gt, ne } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

const DEMO_EMAIL = 'demo@vanguard.com';

async function resolveUser(email?: string, name?: string) {
  const target = (email || DEMO_EMAIL).toLowerCase();
  const [existing] = await db.select().from(users).where(eq(users.email, target)).limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(users)
    .values({ email: target, password: 'oauth-less-demo', name: name || 'Guest Driver', role: 'customer' })
    .returning();
  return created;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = (searchParams.get('email') || DEMO_EMAIL).toLowerCase();
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!user) return NextResponse.json([]);

  const rows = await db
    .select({
      id: bookings.id,
      status: bookings.status,
      paymentStatus: bookings.paymentStatus,
      pickupDate: bookings.pickupDate,
      returnDate: bookings.returnDate,
      pickupLocation: bookings.pickupLocation,
      totalDays: bookings.totalDays,
      totalPrice: bookings.totalPrice,
      brand: vehicles.brand,
      model: vehicles.model,
      image: vehicles.image,
    })
    .from(bookings)
    .innerJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
    .where(eq(bookings.userId, user.id))
    .orderBy(desc(bookings.pickupDate));

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const vehicleId = Number(body.vehicleId);
  const pickup = new Date(body.pickup);
  const drop = new Date(body.return);

  if (!vehicleId || Number.isNaN(pickup.getTime()) || Number.isNaN(drop.getTime()) || drop <= pickup) {
    return NextResponse.json({ error: 'Invalid vehicle or date range' }, { status: 400 });
  }

  const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, vehicleId)).limit(1);
  if (!vehicle) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });

  // Double-booking protection: any confirmed booking that overlaps the range
  const clashes = await db
    .select({ id: bookings.id })
    .from(bookings)
    .where(
      and(
        eq(bookings.vehicleId, vehicleId),
        ne(bookings.status, 'cancelled'),
        lt(bookings.pickupDate, drop),
        gt(bookings.returnDate, pickup),
      ),
    );

  if (clashes.length) {
    return NextResponse.json({ error: 'This vehicle is already reserved for those dates.' }, { status: 409 });
  }

  const user = await resolveUser(body.email, body.name);

  const days = Math.max(1, Math.ceil((drop.getTime() - pickup.getTime()) / 86400000));
  const base = days * Number(vehicle.pricePerDay);
  const extras = Array.isArray(body.extras) ? body.extras : [];
  const extrasTotal = extras.length * 45 * days;
  const insurance = body.insurance ? 89 * days : 0;
  const subtotal = base + extrasTotal + insurance;
  const discount = body.discountAmount ? Number(body.discountAmount) : 0;
  const tax = Math.round((subtotal - discount) * 0.08 * 100) / 100;
  const total = Math.round((subtotal - discount + tax) * 100) / 100;

  const [created] = await db
    .insert(bookings)
    .values({
      userId: user.id,
      vehicleId,
      pickupLocation: body.location || 'Los Angeles',
      returnLocation: body.returnLocation || body.location || 'Los Angeles',
      pickupDate: pickup,
      returnDate: drop,
      totalDays: days,
      basePrice: String(base),
      extras,
      insurance: String(insurance),
      tax: String(tax),
      discount: String(discount),
      totalPrice: String(total),
      status: 'confirmed',
      paymentStatus: 'paid',
    })
    .returning();

  await db.insert(payments).values({ bookingId: created.id, amount: String(total), status: 'succeeded' });

  return NextResponse.json({ success: true, booking: created }, { status: 201 });
}
