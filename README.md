# Vanguard — Premium Car Rental

A cinematic premium car rental platform. A deliberately small, hand-selected fleet of desirable
machines — delivered, insured and ready the moment you land. Built with Next.js 16, PostgreSQL
(Drizzle ORM) and GSAP-powered motion design.

🔗 **Live demo:** https://car-rental-web-application-topaz.vercel.app

---

## ✨ Features

- **Cinematic homepage** — GSAP smooth scrolling (Lenis), animated hero with per-character
  headline reveal, velocity marquee, horizontal category scroller, parallax sections and a
  magnetic-button CTA system
- **Fleet browser** (`/cars`) — search, category filters, sorting and live vehicle cards
- **Vehicle detail pages** — image gallery, specs and a booking widget with pre-filled dates
- **6-step booking flow** — location, dates, optional extras (chauffeur, child seat, wifi),
  zero-excess insurance, promo codes and a live price breakdown (taxes + discounts)
- **Accounts** — register / login with JWT auth (bcrypt-hashed passwords), user dashboard with
  upcoming & past bookings, cancellation
- **Admin console** (`/admin`) — fleet, booking and customer management with revenue stats
- **Promo codes** — `WELCOME15` (15% off) and `VANGUARD10` (10% off)
- **Respects `prefers-reduced-motion`** across all animations

## 🛠 Tech Stack

| Layer      | Tech |
| ---------- | ---- |
| Framework  | [Next.js 16](https://nextjs.org) (App Router, React 19, TypeScript) |
| Styling    | [Tailwind CSS 4](https://tailwindcss.com) |
| Database   | PostgreSQL via [Drizzle ORM](https://orm.drizzle.team) + `node-postgres` |
| Auth       | JWT (`jsonwebtoken`) + `bcryptjs` |
| Animation  | [GSAP](https://gsap.com) + [Lenis](https://lenis.darkroom.engineering) |
| UI icons   | [lucide-react](https://lucide.dev) |
| Toasts     | [sonner](https://sonner.emilkowal.ski) |

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ and npm
- A running PostgreSQL server (local) **or** a hosted one (e.g. [Neon](https://neon.tech))

### 1. Install

```bash
npm install
```

### 2. Environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/premium_3d_car_rental
JWT_SECRET=change-me-to-a-long-random-secret
```

### 3. Create the database & schema

```bash
# Create the database (adjust for your setup)
createdb premium_3d_car_rental

# Generate migrations from src/db/schema.ts (already checked in under /drizzle)
npx drizzle-kit generate

# Apply them to your database
npx drizzle-kit push
```

### 4. Seed the fleet

```bash
node scripts/seed.mjs
```

Seeds **9 vehicles**, **4 locations** (Los Angeles, New York, Miami, San Francisco) and the
promo codes `WELCOME15` + `VANGUARD10`.

### 5. Run

```bash
npm run dev        # http://localhost:3000
```

Other scripts: `npm run build`, `npm start`, `npm run lint`, `npm run typecheck`.

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage (hero, fleet, categories, reviews, promo)
│   ├── cars/                 # Fleet browser + vehicle detail pages
│   ├── booking/[id]/         # Multi-step booking flow
│   ├── dashboard/            # User dashboard (bookings)
│   ├── login/ register/      # Auth pages
│   ├── admin/                # Admin console
│   └── api/                  # Route handlers (auth, vehicles, bookings, admin)
├── components/
│   ├── gsap/                 # Motion components (Hero, Smoke, Parallax, …)
│   └── ...                   # UI components (SiteNav, SearchBar, VehicleCard, …)
├── db/
│   ├── index.ts              # Drizzle client (pg Pool)
│   └── schema.ts             # Tables: users, vehicles, bookings, reviews, coupons, payments
└── lib/
    ├── auth.ts               # Password hashing + JWT helpers
    └── types.ts              # Shared DTO types
```

## ☁️ Deploying to Vercel

This project deploys cleanly to [Vercel](https://vercel.com) with a serverless PostgreSQL
database such as [Neon](https://neon.tech).

1. **Push the repo to GitHub**, then import it in Vercel (**New Project → Import Git Repository**).
   Framework is auto-detected as Next.js.
2. **Provision a Neon database** and set these environment variables in the Vercel project
   (Production + Preview):

   | Name           | Value                                        |
   | -------------- | -------------------------------------------- |
   | `DATABASE_URL` | Your Neon pooled connection string (`postgresql://...?sslmode=require`) |
   | `JWT_SECRET`   | A long random string                          |

3. **Apply schema + seed** against the hosted database:

   ```bash
   DATABASE_URL='postgresql://...' npx drizzle-kit push
   DATABASE_URL='postgresql://...' node scripts/seed.mjs
   ```

4. **Deploy.** Every push to `main` auto-deploys to production.

## 🧭 API Routes

| Method | Route                   | Description                         |
| ------ | ----------------------- | ----------------------------------- |
| POST   | `/api/auth/register`    | Create an account                   |
| POST   | `/api/auth/login`       | Sign in, returns a JWT              |
| GET    | `/api/vehicles`         | List the fleet                      |
| POST   | `/api/vehicles`         | Add a vehicle (admin)               |
| GET/PUT/DELETE | `/api/vehicles/[id]` | Vehicle detail / update / delete |
| POST   | `/api/bookings`         | Create a booking                    |
| GET    | `/api/bookings?email=`  | List bookings for a user            |
| PUT/DELETE | `/api/bookings/[id]` | Update status / cancel            |
| GET    | `/api/admin/overview`   | Fleet, bookings, customers, revenue |
| GET    | `/api/health`           | Health check                        |

## 🎨 Design Notes

- **Brand palette:** acid lime (`#e8fc03`) as the signature fill, deep charcoal (`#1a191d`),
  violet accents and a warm paper canvas (`#f7f7f8`)
- **Type:** Playfair Display (serif display) paired with Inter (sans body)
- Images are served from Pexels CDN (see `scripts/seed.mjs` for the fleet photography)

---

Built with 💛 by [Sabbir Ahmed Shahin](https://github.com/shahin06066).
