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
 * Карта на OpenStreetMap-данных с тайлами CARTO (Leaflet в WebView).
 *
 * Полностью бесплатно, без API-ключей и регистрации — подходит там, где
 * Google Maps недоступен. Тайлы CARTO дают чистый светлый стиль. Маркеры
 * (подача, назначение, водитель) и маршрут обновляются через
 * injectJavaScript, поэтому движущийся водитель отрисовывается плавно.
 */
const HTML = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; background: #eaf0ee; }
    .leaflet-container { background: #eaf0ee; }
    .pin { filter: drop-shadow(0 2px 3px rgba(0,0,0,.35)); }
    .car {
      width: 34px; height: 34px; border-radius: 50%;
      background: #fff; box-shadow: 0 2px 6px rgba(0,0,0,.35);
      display: flex; align-items: center; justify-content: center;
      font-size: 19px; border: 2px solid #0A6B4E;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false })
      .setView([55.751, 37.618], 12);
    L.tileLayer(
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      { maxZoom: 20, subdomains: 'abcd' }
    ).addTo(map);

    function pinSvg(color) {
      return '<svg class="pin" width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg">' +
        '<path d="M15 0C6.7 0 0 6.7 0 15c0 11 15 27 15 27s15-16 15-27C30 6.7 23.3 0 15 0z" fill="' + color + '"/>' +
        '<circle cx="15" cy="15" r="5.5" fill="#fff"/></svg>';
    }
    function pin(lat, lng, color) {
      return L.marker([lat, lng], { icon: L.divIcon({
        className: '', html: pinSvg(color),
        iconSize: [30, 42], iconAnchor: [15, 42],
      }) });
    }
    function car(lat, lng) {
      return L.marker([lat, lng], { icon: L.divIcon({
        className: '', html: '<div class="car">🚕</div>',
        iconSize: [34, 34], iconAnchor: [17, 17],
      }) });
    }

    var layers = [];
    window.updateMap = function (d) {
      layers.forEach(function (l) { map.removeLayer(l); });
      layers = [];
      var pts = [];
      var pu = d.pickup, dst = d.destination, drv = d.driver;

      if (pu && dst) {
        var line = L.polyline(
          [[pu.latitude, pu.longitude], [dst.latitude, dst.longitude]],
          { color: '#0A6B4E', weight: 4, opacity: 0.75, dashArray: '1 8', lineCap: 'round' }
        ).addTo(map);
        layers.push(line);
      }
      if (pu) {
        var a = pin(pu.latitude, pu.longitude, '#2E9E5B').addTo(map);
        layers.push(a); pts.push([pu.latitude, pu.longitude]);
      }
      if (dst) {
        var b = pin(dst.latitude, dst.longitude, '#D24B4B').addTo(map);
        layers.push(b); pts.push([dst.latitude, dst.longitude]);
      }
      if (drv) {
        var c = car(drv.latitude, drv.longitude).addTo(map);
        layers.push(c); pts.push([drv.latitude, drv.longitude]);
      }
      if (pts.length === 1) map.setView(pts[0], 15);
      else if (pts.length > 1) map.fitBounds(pts, { padding: [60, 70] });
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
