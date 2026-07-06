/**
 * Mock-API прототипа MusTaxi.
 *
 * Полностью имитирует бэкенд в памяти устройства: задержки сети через
 * промисы, SMS-OTP, матчинг водителя и live-трекинг поездки. Все функции
 * повторяют форму реального REST/WebSocket-API, поэтому при переходе на
 * настоящий сервер меняется только реализация этого файла.
 */
import type {
  CarClass,
  Driver,
  DriverGenderPreference,
  FareEstimate,
  LatLng,
  OtpChallenge,
  Place,
  RidePreferences,
  RideStatus,
  RideUpdate,
  UserProfile,
} from '@/types';
import { pickDriver } from '@/data/mockData';
import { estimateFare } from '@/features/payment/fare';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Демонстрационный код подтверждения (в проде приходит по SMS). */
export const DEMO_OTP = '0000';

// ── Авторизация ────────────────────────────────────────────────────────

export async function requestOtp(phone: string): Promise<OtpChallenge> {
  await delay(700);
  return {
    phone,
    expiresAt: Date.now() + 5 * 60 * 1000,
    demoCode: DEMO_OTP,
  };
}

export async function verifyOtp(
  phone: string,
  code: string,
): Promise<{ token: string; profile: UserProfile }> {
  await delay(600);
  if (code !== DEMO_OTP) {
    throw new Error('INVALID_CODE');
  }
  return {
    token: `demo-${Math.random().toString(36).slice(2)}`,
    profile: {
      id: `u-${phone.replace(/\D/g, '')}`,
      name: 'Пользователь',
      phone,
      gender: 'male',
      preferredLocale: 'ru',
    },
  };
}

// ── Заказ поездки ──────────────────────────────────────────────────────

export interface CreateRideInput {
  pickup: Place;
  destination: Place;
  preferences: RidePreferences;
  carClass: CarClass;
}

export interface CreatedRide {
  id: string;
  driver: Driver;
  fare: FareEstimate;
  pickup: Place;
  destination: Place;
  preferences: RidePreferences;
}

export async function createRide(input: CreateRideInput): Promise<CreatedRide> {
  await delay(1200); // «поиск ближайшего водителя»
  const driver = pickDriver(input.preferences.driverGender);
  const fare = estimateFare(
    input.pickup.location,
    input.destination.location,
    input.carClass,
  );
  return {
    id: `ride-${Date.now()}`,
    driver,
    fare,
    pickup: input.pickup,
    destination: input.destination,
    preferences: input.preferences,
  };
}

// ── Live-трекинг ───────────────────────────────────────────────────────

const lerp = (a: LatLng, b: LatLng, t: number): LatLng => ({
  latitude: a.latitude + (b.latitude - a.latitude) * t,
  longitude: a.longitude + (b.longitude - a.longitude) * t,
});

/**
 * Подписка на обновления активной поездки. Имитирует движение водителя:
 * подача к точке (arriving) → поездка к назначению (in_progress) →
 * завершение (completed). Возвращает функцию отписки.
 */
export function subscribeRide(
  ride: CreatedRide,
  onUpdate: (update: RideUpdate) => void,
  options: { tickMs?: number; steps?: number } = {},
): () => void {
  const tickMs = options.tickMs ?? 700;
  const steps = options.steps ?? 12;

  const legs: { status: RideStatus; from: LatLng; to: LatLng }[] = [
    {
      status: 'arriving',
      from: ride.driver.location,
      to: ride.pickup.location,
    },
    {
      status: 'in_progress',
      from: ride.pickup.location,
      to: ride.destination.location,
    },
  ];

  let legIndex = 0;
  let step = 0;
  let cancelled = false;

  // Стартовое состояние: водитель назначен.
  onUpdate({
    status: 'driver_assigned',
    driverLocation: ride.driver.location,
    etaMinutes: ride.driver.etaMinutes,
  });

  const timer = setInterval(() => {
    if (cancelled) return;
    const leg = legs[legIndex];
    step += 1;
    const t = Math.min(step / steps, 1);
    const driverLocation = lerp(leg.from, leg.to, t);
    const remainingLegs = legs.length - legIndex - 1;
    const etaMinutes = Math.max(
      0,
      Math.round((1 - t) * (legIndex === 0 ? ride.driver.etaMinutes : 8)) +
        remainingLegs * 8,
    );

    onUpdate({ status: leg.status, driverLocation, etaMinutes });

    if (t >= 1) {
      legIndex += 1;
      step = 0;
      if (legIndex >= legs.length) {
        clearInterval(timer);
        onUpdate({
          status: 'completed',
          driverLocation: ride.destination.location,
          etaMinutes: 0,
        });
      }
    }
  }, tickMs);

  return () => {
    cancelled = true;
    clearInterval(timer);
  };
}

// Реэкспорт для удобства потребителей.
export type { DriverGenderPreference };
