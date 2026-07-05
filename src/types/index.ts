export type Gender = 'male' | 'female';

/** Предпочтение пола водителя пассажиром. */
export type DriverGenderPreference = 'any' | 'male' | 'female';

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface Place {
  id: string;
  title: string;
  subtitle?: string;
  location: LatLng;
}

export interface Driver {
  id: string;
  name: string;
  gender: Gender;
  rating: number;
  carModel: string;
  carPlate: string;
  etaMinutes: number;
  location: LatLng;
}

/** Настройки поездки, ориентированные на нормы шариата. */
export interface RidePreferences {
  driverGender: DriverGenderPreference;
  noMusic: boolean;
  quietRide: boolean;
  fasting: boolean; // соблюдаю пост — водитель предупреждён
  prayerStop: boolean; // возможна остановка на намаз
}

export type PaymentMethod = 'cash' | 'card' | 'wallet';

export interface FareEstimate {
  base: number;
  distanceKm: number;
  distanceFare: number;
  total: number;
  currency: string;
  /** Оплата без ссудного процента (риба). Чаевые — по желанию, отдельно. */
  ribaFree: true;
}

export type RideStatus =
  | 'idle'
  | 'searching'
  | 'driver_assigned'
  | 'arriving'
  | 'in_progress'
  | 'completed'
  | 'cancelled';

export interface Ride {
  id: string;
  status: RideStatus;
  pickup: Place;
  destination: Place;
  preferences: RidePreferences;
  driver?: Driver;
  fare: FareEstimate;
  paymentMethod: PaymentMethod;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  gender: Gender;
  preferredLocale: 'ru' | 'ar' | 'en';
}
