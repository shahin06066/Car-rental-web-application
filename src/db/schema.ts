import { pgTable, serial, text, integer, decimal, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name').notNull(),
  phone: text('phone'),
  role: text('role').notNull().default('customer'), // customer, admin
  createdAt: timestamp('created_at').defaultNow(),
});

export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  category: text('category').notNull(), // luxury, sports, suv, sedan, electric
  pricePerDay: decimal('price_per_day', { precision: 10, scale: 2 }).notNull(),
  transmission: text('transmission').notNull(),
  fuelType: text('fuel_type').notNull(),
  seats: integer('seats').notNull(),
  image: text('image').notNull(),
  gallery: jsonb('gallery').$type<string[]>(),
  description: text('description'),
  year: integer('year').default(2024),
  rating: decimal('rating', { precision: 2, scale: 1 }).default('4.8'),
  reviewCount: integer('review_count').default(0),
  horsepower: integer('horsepower'),
  topSpeed: integer('top_speed'),
  acceleration: decimal('acceleration', { precision: 3, scale: 1 }),
  available: boolean('available').default(true),
  specs: jsonb('specs'),
  features: jsonb('features').$type<string[]>(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id),
  pickupLocation: text('pickup_location').notNull(),
  returnLocation: text('return_location').notNull(),
  pickupDate: timestamp('pickup_date').notNull(),
  returnDate: timestamp('return_date').notNull(),
  totalDays: integer('total_days').notNull(),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  extras: jsonb('extras'),
  insurance: decimal('insurance', { precision: 10, scale: 2 }),
  tax: decimal('tax', { precision: 10, scale: 2 }),
  discount: decimal('discount', { precision: 10, scale: 2 }).default('0'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'), // pending, confirmed, cancelled, completed
  paymentStatus: text('payment_status').default('pending'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const reviews = pgTable('reviews', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  vehicleId: integer('vehicle_id').notNull().references(() => vehicles.id),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const coupons = pgTable('coupons', {
  id: serial('id').primaryKey(),
  code: text('code').notNull().unique(),
  discountPercent: integer('discount_percent').notNull(),
  active: boolean('active').default(true),
});

export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});