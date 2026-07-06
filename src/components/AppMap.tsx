import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';
import Constants from 'expo-constants';
import { colors, radius } from '@/theme';
import type { LatLng } from '@/types';

interface Props {
  pickup: LatLng;
  destination?: LatLng | null;
  driver?: LatLng | null;
  /** Текст на карточке подачи (напр. «Подача 8 мин»). */
  pickupBadge?: string | null;
  /** Геометрия реального маршрута; если нет — рисуется пунктирная прямая. */
  routePolyline?: LatLng[] | null;
  /** Показывать кнопку «моё местоположение». */
  showLocate?: boolean;
  /**
   * Режим выбора точки: маркеры не рисуются, карта свободно двигается,
   * а её центр сообщается через onCenter (пин рисует родительский экран).
   */
  pickMode?: boolean;
  /** Колбэк с координатами центра карты (после перемещения). */
  onCenter?: (center: LatLng) => void;
  /** Текст-предупреждение, если карта не смогла загрузиться (офлайн). */
  offlineNotice?: string;
  style?: object;
}

const YANDEX_KEY: string = Constants.expoConfig?.extra?.yandex?.mapsKey ?? '';

/** Общий CSS маркеров/карточки для обоих движков. */
const SHARED_CSS = `
  html, body, #map { height:100%; margin:0; padding:0; background:#eaf0ee; }
  .badge { display:inline-block; background:#fff; color:#1A1D1B; font:700 13px -apple-system,Roboto,sans-serif;
    padding:7px 11px; border-radius:12px; box-shadow:0 3px 8px rgba(0,0,0,.25); white-space:nowrap; }
  .badge .ico { color:#0A6B4E; margin-right:5px; }
  .car { width:36px; height:36px; border-radius:50%; background:#fff; border:2px solid #0A6B4E;
    box-shadow:0 2px 6px rgba(0,0,0,.35); display:flex; align-items:center; justify-content:center; font-size:20px; }
`;

const PIN_SVG = (color: string) =>
  `<svg width="30" height="42" viewBox="0 0 30 42" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 2px 3px rgba(0,0,0,.35))">` +
  `<path d="M15 0C6.7 0 0 6.7 0 15c0 11 15 27 15 27s15-16 15-27C30 6.7 23.3 0 15 0z" fill="${color}"/>` +
  `<circle cx="15" cy="15" r="5.5" fill="#fff"/></svg>`;

/** Яндекс.Карты 2.1. При сбое загрузки шлёт MAP_FAILED в RN для отката. */
const yandexHtml = (key: string) => `<!DOCTYPE html><html><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
<style>${SHARED_CSS}</style></head><body>
<div id="map"></div>
<script>
  function fail(){ if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage('MAP_FAILED'); }
  var s=document.createElement('script');
  s.src='https://api-maps.yandex.ru/2.1/?apikey=${key}&lang=ru_RU';
  s.onerror=fail;
  document.head.appendChild(s);
  var t=setTimeout(function(){ if(!window.ymaps||!window.ymaps.Map) fail(); }, 8000);

  s.onload=function(){ ymaps.ready(function(){
    clearTimeout(t);
    var map=new ymaps.Map('map',{center:[55.751,37.618],zoom:13,controls:[]},{suppressMapOpenBlock:true,yandexMapDisablePoiInteractivity:true});
    var last=null;
    map.events.add('boundschange',function(){
      var c=map.getCenter();
      if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'center',lat:c[0],lng:c[1]}));
    });
    var PinLayout=ymaps.templateLayoutFactory.createClass(
      '<div style="position:absolute;transform:translate(-50%,-100%);text-align:center;white-space:nowrap">'+
      '{% if properties.badge %}<div class="badge"><span class="ico">◈</span>$[properties.badge]</div><div style="height:4px"></div>{% endif %}'+
      '$[properties.svg]</div>');
    var CarLayout=ymaps.templateLayoutFactory.createClass(
      '<div style="position:absolute;transform:translate(-50%,-50%)"><div class="car">🚕</div></div>');
    window.updateMap=function(d){
      if(d.pick){
        // Режим выбора точки: только начальное центрирование, без маркеров.
        if(!window.__pickInit&&d.pickup){ window.__pickInit=true; map.setCenter([d.pickup.latitude,d.pickup.longitude],16); }
        return;
      }
      map.geoObjects.removeAll();
      var pts=[];
      var hasRoute=d.routePolyline&&d.routePolyline.length>1;
      var line=hasRoute
        ? d.routePolyline.map(function(p){return [p.latitude,p.longitude];})
        : (d.pickup&&d.destination
            ? [[d.pickup.latitude,d.pickup.longitude],[d.destination.latitude,d.destination.longitude]]
            : null);
      if(line){
        map.geoObjects.add(new ymaps.Polyline(line,{},{strokeColor:'#0A6B4E',strokeWidth:4,strokeStyle:hasRoute?'solid':'shortdash',strokeOpacity:0.85}));
      }
      if(d.pickup){ last=[d.pickup.latitude,d.pickup.longitude];
        map.geoObjects.add(new ymaps.Placemark(last,{badge:d.pickupBadge||'',svg:'${PIN_SVG('#2E9E5B')}'},{iconLayout:PinLayout,iconShape:{type:'Rectangle',coordinates:[[-16,-46],[16,2]]}}));
        pts.push(last); }
      if(d.destination){ var dd=[d.destination.latitude,d.destination.longitude];
        map.geoObjects.add(new ymaps.Placemark(dd,{badge:'',svg:'${PIN_SVG('#D24B4B')}'},{iconLayout:PinLayout,iconShape:{type:'Rectangle',coordinates:[[-16,-46],[16,2]]}}));
        pts.push(dd); }
      if(d.driver){ var dr=[d.driver.latitude,d.driver.longitude];
        map.geoObjects.add(new ymaps.Placemark(dr,{},{iconLayout:CarLayout,iconShape:{type:'Circle',coordinates:[0,0],radius:18}}));
        pts.push(dr); }
      if(pts.length===1) map.setCenter(pts[0],15,{duration:250});
      else if(pts.length>1) map.setBounds(ymaps.util.bounds.fromPoints(pts),{checkZoomRange:true,zoomMargin:70,duration:250});
    };
    window.recenter=function(){ if(last) map.setCenter(last,15,{duration:300}); };
    if(window.__pending) window.updateMap(window.__pending);
  }); };
  window.updateMap=function(d){ window.__pending=d; };
</script></body></html>`;

/** OpenStreetMap/CARTO через Leaflet — запасной движок без ключей. */
const LEAFLET_HTML = `<!DOCTYPE html><html><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"/>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css"/>
<style>${SHARED_CSS} .leaflet-container{background:#eaf0ee}</style></head><body>
<div id="map"></div>
<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var map=L.map('map',{zoomControl:false,attributionControl:false}).setView([55.751,37.618],13);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',{maxZoom:20,subdomains:'abcd'}).addTo(map);
  var layers=[],last=null;
  map.on('moveend',function(){
    var c=map.getCenter();
    if(window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'center',lat:c.lat,lng:c.lng}));
  });
  function pinIcon(color,badge){ var b=badge?('<div class="badge" style="position:absolute;left:50%;bottom:46px;transform:translateX(-50%)"><span class="ico">◈</span>'+badge+'</div>'):'';
    return L.divIcon({className:'',html:'<div style="position:relative">'+b+'${PIN_SVG('COLORPH')}'.replace('COLORPH',color)+'</div>',iconSize:[30,42],iconAnchor:[15,42]}); }
  window.updateMap=function(d){
    if(d.pick){
      if(!window.__pickInit&&d.pickup){ window.__pickInit=true; map.setView([d.pickup.latitude,d.pickup.longitude],16); }
      return;
    }
    layers.forEach(function(l){map.removeLayer(l)}); layers=[]; var pts=[];
    var hasRoute=d.routePolyline&&d.routePolyline.length>1;
    var line=hasRoute
      ? d.routePolyline.map(function(p){return [p.latitude,p.longitude];})
      : (d.pickup&&d.destination
          ? [[d.pickup.latitude,d.pickup.longitude],[d.destination.latitude,d.destination.longitude]]
          : null);
    if(line){ layers.push(L.polyline(line,{color:'#0A6B4E',weight:4,opacity:0.85,dashArray:hasRoute?null:'1 8'}).addTo(map)); }
    if(d.pickup){ last=[d.pickup.latitude,d.pickup.longitude]; layers.push(L.marker(last,{icon:pinIcon('#2E9E5B',d.pickupBadge)}).addTo(map)); pts.push(last); }
    if(d.destination){ var dd=[d.destination.latitude,d.destination.longitude]; layers.push(L.marker(dd,{icon:pinIcon('#D24B4B','')}).addTo(map)); pts.push(dd); }
    if(d.driver){ var dr=[d.driver.latitude,d.driver.longitude]; layers.push(L.marker(dr,{icon:L.divIcon({className:'',html:'<div class="car">🚕</div>',iconSize:[36,36],iconAnchor:[18,18]})}).addTo(map)); pts.push(dr); }
    if(pts.length===1) map.setView(pts[0],15);
    else if(pts.length>1) map.fitBounds(pts,{padding:[60,70]});
  };
  window.recenter=function(){ if(last) map.setView(last,15); };
</script></body></html>`;

export const AppMap: React.FC<Props> = ({
  pickup,
  destination,
  driver,
  pickupBadge,
  routePolyline,
  showLocate = true,
  pickMode = false,
  onCenter,
  offlineNotice,
  style,
}) => {
  const ref = useRef<WebView>(null);
  const [engine, setEngine] = useState<'yandex' | 'leaflet'>(
    YANDEX_KEY ? 'yandex' : 'leaflet',
  );
  const [webFailed, setWebFailed] = useState(false);

  const payload = JSON.stringify({
    pickup,
    destination: destination ?? null,
    driver: driver ?? null,
    pickupBadge: pickupBadge ?? '',
    routePolyline: routePolyline ?? null,
    pick: pickMode,
  });

  const push = () => {
    ref.current?.injectJavaScript(
      `window.updateMap && window.updateMap(${payload}); true;`,
    );
  };

  useEffect(() => {
    push();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload, engine]);

  const onMessage = (e: WebViewMessageEvent) => {
    const data = e.nativeEvent.data;
    if (data === 'MAP_FAILED') {
      if (engine !== 'leaflet') setEngine('leaflet');
      return;
    }
    try {
      const msg = JSON.parse(data) as { type?: string; lat?: number; lng?: number };
      if (msg.type === 'center' && onCenter && msg.lat != null && msg.lng != null) {
        onCenter({ latitude: msg.lat, longitude: msg.lng });
      }
    } catch {
      // не-JSON сообщения игнорируем
    }
  };

  const html = engine === 'yandex' ? yandexHtml(YANDEX_KEY) : LEAFLET_HTML;

  return (
    <View style={[styles.wrap, style]}>
      <WebView
        key={engine}
        ref={ref}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://mustaxi.app' }}
        onLoadEnd={push}
        onMessage={onMessage}
        onError={() => setWebFailed(true)}
        style={styles.web}
        scrollEnabled={false}
        overScrollMode="never"
        androidLayerType="hardware"
      />
      {webFailed && !!offlineNotice && (
        <View style={styles.offline} pointerEvents="none">
          <Text style={styles.offlineText}>{offlineNotice}</Text>
        </View>
      )}
      {showLocate && (
        <Pressable
          style={styles.locate}
          onPress={() =>
            ref.current?.injectJavaScript('window.recenter && window.recenter(); true;')
          }
        >
          <Text style={styles.locateIcon}>➤</Text>
        </Pressable>
      )}
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
  locate: {
    position: 'absolute',
    right: 14,
    bottom: 14,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  locateIcon: {
    fontSize: 20,
    color: colors.primary,
    transform: [{ rotate: '-45deg' }],
  },
  offline: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
    padding: 24,
  },
  offlineText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
});
