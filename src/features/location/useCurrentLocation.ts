import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';
import type { LatLng } from '@/types';
import { mockPlaces } from '@/data/mockData';

/** Запасная точка, если геодоступ не выдан (Московская Соборная мечеть). */
const FALLBACK: LatLng = mockPlaces[0].location;

interface State {
  location: LatLng;
  granted: boolean | null;
  loading: boolean;
}

/**
 * Возвращает текущие координаты устройства. При отказе в доступе тихо
 * откатывается на запасную точку, чтобы прототип оставался работоспособным.
 */
export function useCurrentLocation() {
  const [state, setState] = useState<State>({
    location: FALLBACK,
    granted: null,
    loading: true,
  });

  const refresh = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState({ location: FALLBACK, granted: false, loading: false });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      setState({
        location: {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        },
        granted: true,
        loading: false,
      });
    } catch {
      setState({ location: FALLBACK, granted: false, loading: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}
