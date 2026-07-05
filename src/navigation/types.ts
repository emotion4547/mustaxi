import type { NavigatorScreenParams } from '@react-navigation/native';
import type { Place, RidePreferences, RideRecord } from '@/types';

export type MainTabParamList = {
  Home: undefined;
  Prayer: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
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
