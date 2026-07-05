import { useEffect, useState } from 'react';
import { Magnetometer } from 'expo-sensors';

interface CompassState {
  /** Курс устройства в градусах (0 = север), по часовой стрелке. */
  heading: number;
  available: boolean;
}

/** Сглаживает угол по кратчайшей дуге, чтобы стрелка не «прыгала» через 360°. */
function smoothAngle(prev: number, next: number, factor = 0.2): number {
  let diff = ((next - prev + 540) % 360) - 180;
  return (prev + diff * factor + 360) % 360;
}

/**
 * Курс компаса по данным магнитометра.
 * Достаточно для указателя Киблы в прототипе (без калибровки).
 */
export function useCompass(updateIntervalMs = 100): CompassState {
  const [heading, setHeading] = useState(0);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    let mounted = true;
    Magnetometer.isAvailableAsync()
      .then((ok) => mounted && setAvailable(ok))
      .catch(() => mounted && setAvailable(false));

    Magnetometer.setUpdateInterval(updateIntervalMs);
    const sub = Magnetometer.addListener(({ x, y }) => {
      let angle = Math.atan2(y, x) * (180 / Math.PI);
      angle = (angle + 360) % 360;
      setHeading((prev) => smoothAngle(prev, angle));
    });

    return () => {
      mounted = false;
      sub.remove();
    };
  }, [updateIntervalMs]);

  return { heading, available };
}
