import type { Driver, Place } from '@/types';

/** Демонстрационные места (центр Москвы) для MVP. */
export const mockPlaces: Place[] = [
  {
    id: 'p1',
    title: 'Московская Соборная мечеть',
    subtitle: 'Выползов пер., 7',
    location: { latitude: 55.7797, longitude: 37.6314 },
  },
  {
    id: 'p2',
    title: 'ТЦ «Афимолл Сити»',
    subtitle: 'Пресненская наб., 2',
    location: { latitude: 55.7494, longitude: 37.5397 },
  },
  {
    id: 'p3',
    title: 'Аэропорт Домодедово',
    subtitle: 'Терминал',
    location: { latitude: 55.4088, longitude: 37.9063 },
  },
  {
    id: 'p4',
    title: 'Халяль-ресторан «Чайхона»',
    subtitle: 'Проспект Мира, 33',
    location: { latitude: 55.7823, longitude: 37.6336 },
  },
];

/** Демонстрационный пул водителей обоих полов для MVP. */
export const mockDrivers: Driver[] = [
  {
    id: 'd1',
    name: 'Амина Юсупова',
    gender: 'female',
    rating: 4.9,
    carModel: 'Kia Rio',
    carPlate: 'А 123 МС',
    etaMinutes: 4,
    location: { latitude: 55.7812, longitude: 37.6301 },
  },
  {
    id: 'd2',
    name: 'Ибрагим Салимов',
    gender: 'male',
    rating: 4.8,
    carModel: 'Hyundai Solaris',
    carPlate: 'В 456 КР',
    etaMinutes: 3,
    location: { latitude: 55.7788, longitude: 37.6289 },
  },
  {
    id: 'd3',
    name: 'Фатима Каримова',
    gender: 'female',
    rating: 5.0,
    carModel: 'Volkswagen Polo',
    carPlate: 'Е 789 НО',
    etaMinutes: 6,
    location: { latitude: 55.7801, longitude: 37.6350 },
  },
];

import type { DriverGenderPreference } from '@/types';

/** Подбирает первого подходящего водителя по предпочтению пола. */
export function pickDriver(pref: DriverGenderPreference): Driver {
  const pool =
    pref === 'any'
      ? mockDrivers
      : mockDrivers.filter((d) => d.gender === pref);
  const list = pool.length ? pool : mockDrivers;
  return [...list].sort((a, b) => a.etaMinutes - b.etaMinutes)[0];
}
