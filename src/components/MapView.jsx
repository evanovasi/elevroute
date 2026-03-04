'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useRouteStore, COLORS } from '@/stores/routeStore';
import { getStyle } from '@/utils/mapStyles';
import { haversine } from '@/utils/math';

export default function MapView() {
  const allRoutes = useRouteStore((s) => s.allRoutes);
  const activeRouteIndex = useRouteStore((s) => s.activeRouteIndex);
  const mapState = useRouteStore((s) => s.mapState);
  const setMapState = useRouteStore((s) => s.setMapState);
  const loading = useRouteStore((s) => s.loading);
  const travelMode = useRouteStore((s) => s.travelMode);
  const activeTab = useRouteStore((s) => s.activeTab);
  const simulationVisible = useRouteStore((s) => s.simulationVisible);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const polylinesRef = useRef([]);
  const markersRef = useRef([]);
  const vehicleMarkerRef = useRef(null);
  const animFrameRef = useRef(null);
  const simStartTimeRef = useRef(0);

  const [simState, setSimState] = useState('idle'); // idle | playing | paused
  const [simDuration, setSimDuration] = useState(15);
  const currentDistanceRef = useRef(0);
  const pathDistancesRef = useRef([]);
  const pathCoordsRef = useRef([]);
  const totalDistanceRef = useRef(0);

  // Chart indicator ref (will be set from parent)
  const onSimUpdate = useRef(null);

  // Init map when routes come in
  useEffect(() => {
    if (allRoutes.length === 0 || !mapRef.current) return;
    if (typeof google === 'undefined') return;

    if (!mapInstanceRef.current) {
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: -6.2, lng: 106.8 }, zoom: 10,
        mapTypeId: mapState.type,
        styles: getStyle(mapState.theme),
        mapTypeControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });
    }

    const map = mapInstanceRef.current;

    // Clear old
    polylinesRef.current.forEach((p) => p.setMap(null));
    polylinesRef.current = [];
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];

    // Draw polylines
    allRoutes.forEach((route, idx) => {
      const pl = new google.maps.Polyline({
        path: route.pts, geodesic: true,
        strokeColor: COLORS[idx] || '#888',
        strokeOpacity: idx === activeRouteIndex ? 1 : 0.35,
        strokeWeight: idx === activeRouteIndex ? 5 : 2.5,
        zIndex: idx === activeRouteIndex ? 10 : 1,
        map,
      });
      polylinesRef.current.push(pl);
    });

    // Markers
    const first = allRoutes[0].pts[0];
    const last = allRoutes[0].pts[allRoutes[0].pts.length - 1];
    const mkIcon = (color) => ({ path: google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 });
    markersRef.current.push(new google.maps.Marker({ position: first, map, icon: mkIcon('#ff5e5e'), title: 'Origin' }));
    markersRef.current.push(new google.maps.Marker({ position: last, map, icon: mkIcon('#3dff9a'), title: 'Destination' }));

    // Fit bounds
    const bounds = new google.maps.LatLngBounds();
    allRoutes[0].pts.forEach((p) => bounds.extend(p));
    map.fitBounds(bounds, { padding: 60 });

    // Prepare path distances for active route
    preparePathDistances(allRoutes[activeRouteIndex]);
  }, [allRoutes]);

  // Update active route polyline styles
  useEffect(() => {
    polylinesRef.current.forEach((p, i) => {
      p.setOptions({
        strokeOpacity: i === activeRouteIndex ? 1 : 0.25,
        strokeWeight: i === activeRouteIndex ? 5 : 2,
        zIndex: i === activeRouteIndex ? 10 : 1,
      });
    });
    if (allRoutes[activeRouteIndex]) {
      preparePathDistances(allRoutes[activeRouteIndex]);
    }
    // Stop simulation when switching routes
    if (simState !== 'idle') stopSimulation();
  }, [activeRouteIndex]);

  // Apply map style changes
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setMapTypeId(mapState.type);
    mapInstanceRef.current.setOptions({ styles: getStyle(mapState.theme) });
  }, [mapState.type, mapState.theme]);

  // Resize on tab change (mobile)
  useEffect(() => {
    if (activeTab === 'peta' && mapInstanceRef.current) {
      setTimeout(() => google.maps.event.trigger(mapInstanceRef.current, 'resize'), 100);
    }
  }, [activeTab]);

  // Prepare path distances
  function preparePathDistances(route) {
    const pts = route.pts;
    const dists = [0];
    for (let i = 1; i < pts.length; i++) {
      const d = haversine(pts[i - 1].lat, pts[i - 1].lng, pts[i].lat, pts[i].lng);
      dists.push(dists[i - 1] + d);
    }
    pathDistancesRef.current = dists;
    totalDistanceRef.current = route.dist;
    pathCoordsRef.current = pts;
  }

  // Vehicle icon
  function getVehicleIcon(mode) {
    let emoji = '🚗', color = '#4285F4';
    if (mode === 'MOTORCYCLE') { emoji = '🏍'; color = '#FFA500'; }
    else if (mode === 'WALKING') { emoji = '🚶'; color = '#34A853'; }
    const svg = `<svg width="30" height="30" viewBox="0 0 30 30" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="15" r="12" fill="${color}" stroke="white" stroke-width="2"/><text x="15" y="22" font-size="16" text-anchor="middle" fill="white" font-family="Arial, sans-serif">${emoji}</text></svg>`;
    return {
      url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg),
      scaledSize: new google.maps.Size(30, 30),
    };
  }

  // Simulation
  function startSimulation() {
    if (!allRoutes.length || !mapInstanceRef.current) return;
    currentDistanceRef.current = 0;
    if (vehicleMarkerRef.current) vehicleMarkerRef.current.setMap(null);
    vehicleMarkerRef.current = new google.maps.Marker({
      position: pathCoordsRef.current[0],
      map: mapInstanceRef.current,
      icon: getVehicleIcon(travelMode),
      title: 'Kendaraan',
    });
    setSimState('playing');
    simStartTimeRef.current = performance.now();
    animFrameRef.current = requestAnimationFrame(updateSimulation);
  }

  function pauseSimulation() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setSimState('paused');
  }

  function resumeSimulation() {
    setSimState('playing');
    simStartTimeRef.current = performance.now() - (currentDistanceRef.current / totalDistanceRef.current) * simDuration * 1000;
    animFrameRef.current = requestAnimationFrame(updateSimulation);
  }

  function stopSimulation() {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    if (vehicleMarkerRef.current) { vehicleMarkerRef.current.setMap(null); vehicleMarkerRef.current = null; }
    setSimState('idle');
    currentDistanceRef.current = 0;
    if (onSimUpdate.current) onSimUpdate.current(null);
  }

  function toggleSimulation() {
    if (simState === 'idle') startSimulation();
    else if (simState === 'playing') pauseSimulation();
    else resumeSimulation();
  }

  const updateSimulation = useCallback((timestamp) => {
    const elapsed = (timestamp - simStartTimeRef.current) / 1000;
    let progress = elapsed / simDuration;
    if (progress >= 1) {
      progress = 1;
      currentDistanceRef.current = totalDistanceRef.current;
      updateVehiclePosition(currentDistanceRef.current);
      stopSimulation();
      return;
    }
    currentDistanceRef.current = progress * totalDistanceRef.current;
    updateVehiclePosition(currentDistanceRef.current);
    animFrameRef.current = requestAnimationFrame(updateSimulation);
  }, [simDuration]);

  function updateVehiclePosition(distance) {
    const pathDistances = pathDistancesRef.current;
    const pathCoords = pathCoordsRef.current;
    let i = 0;
    while (i < pathDistances.length - 1 && pathDistances[i + 1] < distance) i++;
    if (i >= pathDistances.length - 1) {
      vehicleMarkerRef.current?.setPosition(pathCoords[pathCoords.length - 1]);
      if (onSimUpdate.current) onSimUpdate.current(totalDistanceRef.current);
      return;
    }
    const d1 = pathDistances[i];
    const d2 = pathDistances[i + 1];
    const frac = (distance - d1) / (d2 - d1);
    const p1 = pathCoords[i];
    const p2 = pathCoords[i + 1];
    const lat = p1.lat + (p2.lat - p1.lat) * frac;
    const lng = p1.lng + (p2.lng - p1.lng) * frac;
    vehicleMarkerRef.current?.setPosition({ lat, lng });
    if (onSimUpdate.current) onSimUpdate.current(distance);
  }

  // Expose onSimUpdate ref to parent via global
  useEffect(() => {
    window.__elevroute_onSimUpdate = onSimUpdate;
    return () => { delete window.__elevroute_onSimUpdate; };
  }, []);

  const hasRoutes = allRoutes.length > 0;

  const simBtnText = simState === 'idle' ? '▶ Jalankan' : simState === 'playing' ? '⏸️ Pause' : '▶️ Lanjutkan';

  return (
    <div className={`map-area${activeTab === 'peta' ? ' tab-active' : ''}`}>
      <div id="map" ref={mapRef} style={{ flex: 1, minHeight: 0, display: hasRoutes ? 'block' : 'none' }}></div>

      {/* Map controls */}
      <div className={`map-controls${hasRoutes ? ' visible' : ''}`}>
        <div className="ctrl-card">
          <span className="ctrl-label">Type</span>
          <div className="ctrl-pills">
            {['roadmap', 'terrain', 'satellite', 'hybrid'].map((t) => (
              <button key={t} className={`ctrl-pill${mapState.type === t ? ' active' : ''}`}
                onClick={() => setMapState({ type: t })}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="ctrl-card">
          <span className="ctrl-label">Style</span>
          <div className="ctrl-pills">
            {[{ k: 'dark', l: '🌙 Dark' }, { k: 'light', l: '☀️ Light' }, { k: 'night', l: '🌃 Night' }, { k: 'silver', l: '🩶 Silver' }].map(({ k, l }) => (
              <button key={k} className={`ctrl-pill${mapState.theme === k ? ' active' : ''}`}
                onClick={() => setMapState({ theme: k })}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Simulation controls */}
        {simulationVisible && (
          <div className="ctrl-card">
            <span className="ctrl-label">Simulasi</span>
            <button className="ctrl-pill" onClick={toggleSimulation}>{simBtnText}</button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '4px' }}>
              <span style={{ fontSize: '0.7rem' }}>⏱️</span>
              <input type="range" min="5" max="30" value={simDuration} step="1" style={{ width: '70px' }}
                onChange={(e) => setSimDuration(parseInt(e.target.value))} />
            </div>
          </div>
        )}
      </div>

      {/* Placeholder */}
      {!hasRoutes && (
        <div className="map-placeholder">
          <div className="placeholder-icon">🗺</div>
          <div className="placeholder-text">Peta akan muncul setelah pencarian rute</div>
        </div>
      )}

      {/* Loading overlay */}
      {loading && (
        <div className="loading-overlay show">
          <div className="spinner"></div>
          <div className="loading-text">{loading}</div>
        </div>
      )}
    </div>
  );
}
