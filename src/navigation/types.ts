import type {
  CarClass,
  Place,
  RidePreferences,
  RideRecord,
  SavedAddressKind,
} from '@/types';

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
    carClass: CarClass;
  };
  History: undefined;
  RideDetails: {
    record: RideRecord;
  };
  SearchLocation: {
    /** Какую точку выбираем. */
    target: 'pickup' | 'destination';
    /** Если задано — выбранное место сохраняется как адрес этого типа. */
    saveAs?: SavedAddressKind;
  };
  /** Выбор точки перетаскиванием карты (центральный пин). */
  MapPick: {
    target: 'pickup' | 'destination';
  };
  SavedAddresses: undefined;
};
