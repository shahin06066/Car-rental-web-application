import type { MetadataRoute } from 'next';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://vanguard.example.com';
  const staticRoutes = ['', '/cars', '/login', '/register', '/dashboard'].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
  }));

  try {
    const { db } = await import('@/db');
    const { vehicles } = await import('@/db/schema');
    const rows = await db.select({ id: vehicles.id }).from(vehicles);
    return [...staticRoutes, ...rows.map((v) => ({ url: `${base}/cars/${v.id}`, lastModified: new Date() }))];
  } catch {
    return staticRoutes;
  }
}
