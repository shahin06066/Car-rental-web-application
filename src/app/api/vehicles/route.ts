import { NextResponse } from 'next/server';
import { db } from '@/db';
import { vehicles } from '@/db/schema';
import { asc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = await db.select().from(vehicles).orderBy(asc(vehicles.id));
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.brand || !body.model || !body.pricePerDay) {
    return NextResponse.json({ error: 'brand, model and pricePerDay are required' }, { status: 400 });
  }
  const [created] = await db
    .insert(vehicles)
    .values({
      brand: body.brand,
      model: body.model,
      category: body.category ?? 'luxury',
      pricePerDay: String(body.pricePerDay),
      transmission: body.transmission ?? 'Automatic',
      fuelType: body.fuelType ?? 'Petrol',
      seats: Number(body.seats ?? 5),
      image: body.image ?? 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200',
      description: body.description ?? null,
      available: body.available ?? true,
    })
    .returning();
  return NextResponse.json(created, { status: 201 });
}
