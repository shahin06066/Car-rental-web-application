export type VehicleDTO = {
  id: number;
  brand: string;
  model: string;
  category: string;
  pricePerDay: string;
  transmission: string;
  fuelType: string;
  seats: number;
  image: string;
  gallery: string[] | null;
  description: string | null;
  year: number | null;
  rating: string | null;
  reviewCount: number | null;
  horsepower: number | null;
  topSpeed: number | null;
  acceleration: string | null;
  available: boolean | null;
  features: string[] | null;
};

export type BookingRow = {
  id: number;
  status: string;
  paymentStatus: string | null;
  pickupDate: string;
  returnDate: string;
  pickupLocation: string;
  totalDays: number;
  totalPrice: string;
  brand: string;
  model: string;
  image: string;
};

export const LOCATIONS = ['Los Angeles', 'New York', 'Miami', 'San Francisco'] as const;

export const CATEGORIES = [
  { key: 'sports', label: 'Sports' },
  { key: 'luxury', label: 'Luxury' },
  { key: 'suv', label: 'SUV' },
  { key: 'electric', label: 'Electric' },
] as const;
