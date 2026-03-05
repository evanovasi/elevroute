'use client';

import { useCallback, useEffect } from 'react';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MapView from '@/components/MapView';
import ElevationPanel from '@/components/ElevationPanel';
import { useRouteStore } from '@/stores/routeStore';
import { decodePolyline } from '@/utils/polyline';
import { calcGain, calcLoss, calcMaxGrade, calcScore } from '@/utils/math';

export default function Home() {
  const appTheme = useRouteStore((s) => s.appTheme);

  // Sync theme to body class
  useEffect(() => {
    document.body.classList.toggle('light-mode', appTheme === 'light');
  }, [appTheme]);

  // Load Map SDK on mount
  useEffect(() => {
    const { sdkLoaded, setSdkLoaded, setLoading, hideLoading, setStatus, setError } = useRouteStore.getState();
    if (!sdkLoaded) {
      loadMapsSDK()
        .then(() => {
          setSdkLoaded(true);
        })
        .catch(() => {
          setError({
            title: 'Gagal Memuat SDK',
            html: 'Kemungkinan penyebab:<ol><li>API Key tidak valid</li><li><code>Maps JavaScript API</code> belum diaktifkan</li><li>Billing belum diaktifkan</li><li>Coba lewat server lokal</li></ol>',
          });
          setStatus('Gagal memuat SDK', 'error');
        });
    }
  }, []);

  const findRoutes = useCallback(async () => {
    const { origin, destination, travelMode, samples,
      clearError, setError, setSearchDisabled, setLoading, hideLoading,
      setStatus, setRoutes, setSdkLoaded, sdkLoaded, setMapState, appTheme } = useRouteStore.getState();

    clearError();

    if (!origin || !destination) { alert('Isi titik asal dan tujuan!'); return; }

    setSearchDisabled(true);

    if (!sdkLoaded) {
      alert('Peta belum sepenuhnya dimuat atau API Key tidak valid.');
      setSearchDisabled(false);
      return;
    }

    setLoading('Mencari rute alternatif...');
    setStatus('Memanggil Directions API...', 'active');

    try {
      const isMotorcycle = travelMode === 'MOTORCYCLE';
      const apiMode = isMotorcycle ? 'DRIVING' : travelMode;
      let rawRoutes;
      let usedFallback = null;

      try {
        rawRoutes = await fetchDirections(origin, destination, apiMode, isMotorcycle);
      } catch (firstErr) {
        throw firstErr;
      }

      setStatus(rawRoutes.length + ' rute ditemukan. Mengambil elevasi...', 'active');

      const routes = [];
      for (let i = 0; i < rawRoutes.length; i++) {
        setLoading('Elevasi rute ' + (i + 1) + '/' + rawRoutes.length + '...');
        const r = rawRoutes[i];
        const pts = decodePolyline(r.overview_polyline);
        const elevResults = await fetchElevation(pts, samples);
        const elevations = elevResults.map((e) => e.elevation);
        const dist = r.legs.reduce((a, l) => a + l.distance.value, 0);
        const dur = r.legs.reduce((a, l) => a + l.duration.value, 0);
        const gain = calcGain(elevations);
        const loss = calcLoss(elevations);
        const maxG = calcMaxGrade(elevResults);
        routes.push({ raw: r, pts, elevations, elevResults, gain, loss, maxG, dist, dur, score: calcScore(dist, dur, gain) });
      }
      routes.sort((a, b) => b.score - a.score);

      setRoutes(routes);

      // Auto-switch map theme if needed
      const isLight = appTheme === 'light';
      const currentMapTheme = useRouteStore.getState().mapState.theme;
      if (isLight && ['dark', 'night'].includes(currentMapTheme)) {
        setMapState({ theme: 'light' });
      }

      setStatus('✓ ' + rawRoutes.length + ' rute + profil elevasi dimuat', 'active');
      hideLoading();
      setSearchDisabled(false);

      // No mobile tab switching anymore

    } catch (err) {
      console.error('[ElevRoute]', err);
      hideLoading();
      setSearchDisabled(false);
      const msg = err.message || '';

      if (msg === 'REQUEST_DENIED') {
        setError({
          title: 'REQUEST_DENIED — API Key Ditolak',
          html: 'Periksa di <a href="https://console.cloud.google.com/apis/dashboard" target="_blank">Cloud Console</a>:<ol><li><code>Maps JavaScript API</code> aktif?</li><li><code>Elevation API</code> aktif?</li><li>Billing aktif?</li><li>API Key restriction: coba None saat testing</li></ol>',
        });
        setStatus('REQUEST_DENIED', 'error');
      } else if (msg === 'ZERO_RESULTS') {
        setStatus('Tidak ada rute antara dua lokasi ini.', 'error');
      } else if (msg === 'NOT_FOUND') {
        setStatus('Lokasi tidak ditemukan. Coba nama lebih spesifik.', 'error');
      } else if (msg === 'OVER_QUERY_LIMIT') {
        setStatus('Kuota API habis. Coba beberapa saat lagi.', 'error');
      } else {
        setError({ title: 'Error: ' + msg, html: 'Buka DevTools (F12) untuk detail.' });
        setStatus('Error — lihat panel di atas', 'error');
      }
    }
  }, []);

  return (
    <>
      <Header />
      <main>
        <Sidebar onFindRoutes={findRoutes} />
        <div className="map-area-wrapper">
          <MapView />
          <ElevationPanel />
        </div>
      </main>
    </>
  );
}

/* ─── Helper functions (not React components) ─── */
function loadMapsSDK() {
  return new Promise((resolve, reject) => {
    if (typeof google !== 'undefined' && google.maps) { resolve(); return; }
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return reject(new Error('API Key missing in .env.local'));
    }
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('SDK_LOAD_FAILED'));
    document.head.appendChild(s);
  });
}

function fetchDirections(origin, dest, mode, avoidHighways = false) {
  return new Promise((resolve, reject) => {
    const svc = new google.maps.DirectionsService();
    svc.route({
      origin, destination: dest,
      travelMode: google.maps.TravelMode[mode],
      provideRouteAlternatives: true,
      avoidHighways,
    }, (result, status) => {
      if (status === 'OK') resolve(result.routes);
      else reject(new Error(status));
    });
  });
}

function fetchElevation(pts, samples) {
  return new Promise((resolve, reject) => {
    const svc = new google.maps.ElevationService();
    svc.getElevationAlongPath({
      path: pts,
      samples: Math.min(samples, 512),
    }, (results, status) => {
      if (status === 'OK') resolve(results);
      else reject(new Error('ELEV_' + status));
    });
  });
}
