import React, { useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, radius } from '@/theme';
import type { LatLng } from '@/types';

interface Props {
  pickup: LatLng;
  destination?: LatLng | null;
  driver?: LatLng | null;
  /** Подпись к маркеру водителя (имя). */
  driverLabel?: string;
  style?: object;
}

/**
 * Карта на OpenStreetMap (Leaflet в WebView).
 *
 * Полностью бесплатно, без API-ключей и регистрации — подходит там, где
 * Google Maps недоступен (санкции/отсутствие Google Cloud). Leaflet и тайлы
 * OSM загружаются во WebView во время выполнения. Маркеры (подача,
 * назначение, водитель) обновляются через injectJavaScript, поэтому
 * движущийся водитель отрисовывается плавно, без перезагрузки карты.
 */
const HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #eef2f0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false })
      .setView([55.751, 37.618], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    var markers = [];
    function dot(lat, lng, color, size) {
      return L.marker([lat, lng], {
        icon: L.divIcon({
          className: '',
          html: '<div style="width:' + size + 'px;height:' + size +
            'px;border-radius:50%;background:' + color +
            ';border:3px solid #fff;box-shadow:0 0 5px rgba(0,0,0,.4)"></div>',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        }),
      });
    }
    function car(lat, lng) {
      return L.marker([lat, lng], {
        icon: L.divIcon({
          className: '',
          html: '<div style="width:22px;height:22px;border-radius:6px;background:#0A6B4E;border:3px solid #fff;box-shadow:0 0 5px rgba(0,0,0,.4)"></div>',
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        }),
      });
    }

    window.updateMap = function (d) {
      markers.forEach(function (m) { map.removeLayer(m); });
      markers = [];
      var pts = [];
      if (d.pickup) {
        var a = dot(d.pickup.latitude, d.pickup.longitude, '#2E9E5B', 16).addTo(map);
        markers.push(a); pts.push([d.pickup.latitude, d.pickup.longitude]);
      }
      if (d.destination) {
        var b = dot(d.destination.latitude, d.destination.longitude, '#D24B4B', 16).addTo(map);
        markers.push(b); pts.push([d.destination.latitude, d.destination.longitude]);
      }
      if (d.driver) {
        var c = car(d.driver.latitude, d.driver.longitude).addTo(map);
        markers.push(c); pts.push([d.driver.latitude, d.driver.longitude]);
      }
      if (pts.length === 1) map.setView(pts[0], 14);
      else if (pts.length > 1) map.fitBounds(pts, { padding: [50, 60] });
    };
  </script>
</body>
</html>`;

export const AppMap: React.FC<Props> = ({
  pickup,
  destination,
  driver,
  style,
}) => {
  const ref = useRef<WebView>(null);

  const payload = JSON.stringify({
    pickup,
    destination: destination ?? null,
    driver: driver ?? null,
  });

  const push = () => {
    ref.current?.injectJavaScript(
      `window.updateMap && window.updateMap(${payload}); true;`,
    );
  };

  useEffect(() => {
    push();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload]);

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        ref={ref}
        originWhitelist={['*']}
        source={{ html: HTML }}
        onLoadEnd={push}
        style={styles.web}
        scrollEnabled={false}
        overScrollMode="never"
        androidLayerType="hardware"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surfaceAlt,
  },
  web: { flex: 1, backgroundColor: colors.surfaceAlt },
});
