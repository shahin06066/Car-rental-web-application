import { NextResponse } from 'next/server';
import { db } from '@/db';
import { bookings, users, vehicles } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [fleet, allUsers, allBookings] = await Promise.all([
    db.select().from(vehicles).orderBy(desc(vehicles.id)),
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role, createdAt: users.createdAt }).from(users),
    db
      .select({
        id: bookings.id,
        status: bookings.status,
        totalPrice: bookings.totalPrice,
        pickupDate: bookings.pickupDate,
        returnDate: bookings.returnDate,
        customer: users.name,
        email: users.email,
        brand: vehicles.brand,
        model: vehicles.model,
      })
      .from(bookings)
      .innerJoin(users, eq(bookings.userId, users.id))
      .innerJoin(vehicles, eq(bookings.vehicleId, vehicles.id))
      .orderBy(desc(bookings.id)),
  ]);

  const revenue = allBookings
    .filter((b) => b.status !== 'cancelled')
    .reduce((s, b) => s + Number(b.totalPrice), 0);

  return NextResponse.json({ fleet, users: allUsers, bookings: allBookings, revenue });
}
