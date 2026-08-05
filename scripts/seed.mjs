import 'dotenv/config';
import pg from 'pg';

const px = (id, slug) =>
  `https://images.pexels.com/photos/${id}/${slug || `pexels-photo-${id}`}.jpeg?auto=compress&cs=tinysrgb&fit=crop&w=1200&h=800`;

const FLEET = [
  {
    brand: 'Porsche', model: '911 Carrera S', category: 'sports', price: 425, year: 2024,
    transmission: 'Automatic', fuel: 'Petrol', seats: 2, hp: 443, top: 191, acc: 3.5, rating: 4.9, reviews: 184,
    image: px(33345481), gallery: [px(261986), px(261985), px(8359715)],
    desc: 'Seven decades of obsession distilled into one silhouette. The 911 Carrera S pairs a twin-turbo flat-six with telepathic steering — a supercar you can genuinely drive every day.',
    features: ['Sport Chrono Package', 'Adaptive Sport Seats', 'Bose Surround Sound', 'Apple CarPlay', 'Lane Keep Assist', 'Rear-Axle Steering'],
  },
  {
    brand: 'Lamborghini', model: 'Huracán EVO', category: 'sports', price: 890, year: 2023,
    transmission: 'Automatic', fuel: 'Petrol', seats: 2, hp: 631, top: 202, acc: 2.9, rating: 5.0, reviews: 96,
    image: px(20150915), gallery: [px(9814982), px(17632052), px(30687977)],
    desc: 'A naturally aspirated V10 that screams to 8,500rpm. No turbos, no filters, no apologies — the last of a dying breed and the loudest way to arrive anywhere.',
    features: ['V10 Naturally Aspirated', 'Carbon Ceramic Brakes', 'Magnetorheological Suspension', 'Alcantara Interior', 'Launch Control', 'Lifting System'],
  },
  {
    brand: 'Mercedes-Benz', model: 'S 580 Sedan', category: 'luxury', price: 375, year: 2024,
    transmission: 'Automatic', fuel: 'Petrol', seats: 5, hp: 496, top: 155, acc: 4.4, rating: 4.9, reviews: 241,
    image: px(15535501), gallery: [px(261985), px(30096223), px(261986)],
    desc: 'The benchmark every other limousine is measured against. Rear executive seating, a 3D instrument cluster and near-silence at 80mph.',
    features: ['Executive Rear Seats', 'Burmester 4D Sound', 'Massage Seats', 'Panoramic Roof', 'Air Suspension', 'Ambient Lighting'],
  },
  {
    brand: 'Bentley', model: 'Continental GT', category: 'luxury', price: 750, year: 2024,
    transmission: 'Automatic', fuel: 'Petrol', seats: 4, hp: 542, top: 198, acc: 3.9, rating: 4.9, reviews: 78,
    image: px(94272, 'sports-car-pkw-auto-vehicle-94272'), gallery: [px(261986), px(8359715), px(30687977)],
    desc: 'Hand-stitched in Crewe over 100 hours. A grand tourer that crosses continents without creasing your suit.',
    features: ['Handcrafted Leather', 'Rotating Display', 'Naim Audio', 'All-Wheel Drive', 'Diamond Knurling', 'Adaptive Cruise'],
  },
  {
    brand: 'Tesla', model: 'Model S Plaid', category: 'electric', price: 310, year: 2024,
    transmission: 'Automatic', fuel: 'Electric', seats: 5, hp: 1020, top: 200, acc: 1.99, rating: 4.7, reviews: 312,
    image: px(10029873), gallery: [px(35736771), px(3846205), px(28851165)],
    desc: 'Tri-motor, 1,020 horsepower, and 0–60 in under two seconds. The fastest accelerating production car — that also seats five and costs pennies to run.',
    features: ['Tri-Motor AWD', '396mi Range', 'Autopilot', 'Glass Roof', '22-Speaker Audio', 'Supercharger Access'],
  },
  {
    brand: 'Audi', model: 'e-tron GT quattro', category: 'electric', price: 395, year: 2024,
    transmission: 'Automatic', fuel: 'Electric', seats: 5, hp: 522, top: 152, acc: 3.9, rating: 4.8, reviews: 134,
    image: px(30096223), gallery: [px(28851165), px(35736771), px(15121199)],
    desc: 'Silent, savage and impeccably tailored. Audi\u2019s electric grand tourer proves that going quiet doesn\u2019t mean going quietly.',
    features: ['Quattro AWD', 'Bang & Olufsen 3D', 'Matrix LED Headlights', '270kW Fast Charge', 'Adaptive Air Suspension', 'Virtual Cockpit'],
  },
  {
    brand: 'Land Rover', model: 'Range Rover Velar', category: 'suv', price: 285, year: 2024,
    transmission: 'Automatic', fuel: 'Diesel', seats: 5, hp: 395, top: 155, acc: 5.2, rating: 4.8, reviews: 167,
    image: px(15824825), gallery: [px(10638645), px(29452726), px(33814686)],
    desc: 'Reductive design at its finest — flush door handles, a floating roofline and a cabin engineered around calm.',
    features: ['Terrain Response 2', 'Meridian Sound', 'Heated Steering Wheel', 'Air Suspension', '360° Camera', 'Configurable Ambient'],
  },
  {
    brand: 'BMW', model: 'M4 Competition', category: 'sports', price: 345, year: 2024,
    transmission: 'Automatic', fuel: 'Petrol', seats: 4, hp: 503, top: 180, acc: 3.4, rating: 4.7, reviews: 203,
    image: px(261985), gallery: [px(261986), px(33345481), px(13672917)],
    desc: 'Track-bred and street-legal. The S58 straight-six pulls relentlessly while the M-tuned chassis keeps everything gloriously composed.',
    features: ['M xDrive AWD', 'Carbon Bucket Seats', 'M Drive Professional', 'Adaptive M Suspension', 'Harman Kardon', 'Head-Up Display'],
  },
  {
    brand: 'Volkswagen', model: 'Touareg R-Line', category: 'suv', price: 195, year: 2023,
    transmission: 'Automatic', fuel: 'Petrol', seats: 7, hp: 335, top: 143, acc: 5.9, rating: 4.6, reviews: 118,
    image: px(10638645), gallery: [px(29452726), px(15824825), px(15072149)],
    desc: 'The sensible one that still feels special. Seven seats, genuine off-road hardware and a boot that swallows a family holiday.',
    features: ['7 Seats', 'IQ.Light Matrix', 'Dynaudio Premium', '4MOTION AWD', 'Trailer Assist', 'Wireless Charging'],
  },
];

const LOCATIONS = ['Los Angeles', 'New York', 'Miami', 'San Francisco'];

const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();

await client.query('TRUNCATE payments, bookings, reviews, vehicles RESTART IDENTITY CASCADE');

for (const v of FLEET) {
  await client.query(
    `INSERT INTO vehicles (brand, model, category, price_per_day, transmission, fuel_type, seats, image, gallery,
       description, year, rating, review_count, horsepower, top_speed, acceleration, available, features)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,true,$17)`,
    [v.brand, v.model, v.category, v.price, v.transmission, v.fuel, v.seats, v.image,
     JSON.stringify(v.gallery), v.desc, v.year, v.rating, v.reviews, v.hp, v.top, v.acc,
     JSON.stringify(v.features)],
  );
}

await client.query(
  `INSERT INTO coupons (code, discount_percent, active) VALUES ('VANGUARD10',10,true),('WELCOME15',15,true)
   ON CONFLICT (code) DO NOTHING`,
);

const { rows } = await client.query('SELECT count(*) FROM vehicles');
console.log(`Seeded ${rows[0].count} vehicles across ${LOCATIONS.length} locations.`);
await client.end();
