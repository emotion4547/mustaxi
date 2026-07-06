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

/** Класс автомобиля. */
export type CarClass = 'econom' | 'comfort' | 'minivan';

export interface FareEstimate {
  base: number;
  distanceKm: number;
  distanceFare: number;
  total: number;
  currency: string;
  carClass: CarClass;
  /** Оплата без ссудного процента (риба). Чаевые — по желанию, отдельно. */
  ribaFree: true;
}

/** Тип сохранённого адреса. */
export type SavedAddressKind = 'home' | 'work' | 'custom';

/** Сохранённый адрес пользователя («Дом», «Работа», произвольный). */
export interface SavedAddress {
  id: string;
  kind: SavedAddressKind;
  /** Отображаемое имя («Дом», «Работа» или своё). */
  label: string;
  place: Place;
  createdAt: number;
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

/** Сессия после успешной верификации по SMS. */
export interface AuthSession {
  token: string;
  profile: UserProfile;
}

/** Вызов OTP: заявка на код подтверждения. */
export interface OtpChallenge {
  phone: string;
  expiresAt: number;
  /** Только для прототипа — реальный бэкенд код не возвращает. */
  demoCode: string;
}

/** Живое обновление активной поездки от «сервера». */
export interface RideUpdate {
  status: RideStatus;
  driverLocation: LatLng;
  etaMinutes: number;
}

/** Запись в истории поездок. */
export interface RideRecord {
  id: string;
  pickupTitle: string;
  destinationTitle: string;
  driverName: string;
  driverGender: Gender;
  fareTotal: number;
  currency: string;
  status: 'completed' | 'cancelled';
  preferences: RidePreferences;
  /** Класс авто (может отсутствовать в старых записях). */
  carClass?: CarClass;
  createdAt: number;
}
