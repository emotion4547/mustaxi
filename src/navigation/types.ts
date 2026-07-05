import type { Place, RidePreferences, RideRecord } from '@/types';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Prayer: undefined;
  Profile: undefined;
  Order: {
    pickup: Place;
    destination: Place;
  };
  Ride: {
    pickup: Place;
    destination: Place;
    preferences: RidePreferences;
  };
  History: undefined;
  RideDetails: {
    record: RideRecord;
  };
  SearchLocation: {
    /** Какую точку выбираем. */
    target: 'pickup' | 'destination';
  };
};
