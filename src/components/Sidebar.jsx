'use client';

import { useRouteStore, COLORS } from '@/stores/routeStore';
import { haversine } from '@/utils/math';

export default function Sidebar({ onFindRoutes }) {
  const origin = useRouteStore((s) => s.origin);
  const setOrigin = useRouteStore((s) => s.setOrigin);
  const destination = useRouteStore((s) => s.destination);
  const setDestination = useRouteStore((s) => s.setDestination);
  const travelMode = useRouteStore((s) => s.travelMode);
  const setTravelMode = useRouteStore((s) => s.setTravelMode);
  const samples = useRouteStore((s) => s.samples);
  const setSamples = useRouteStore((s) => s.setSamples);
  const status = useRouteStore((s) => s.status);
  const error = useRouteStore((s) => s.error);
  const searchDisabled = useRouteStore((s) => s.searchDisabled);
  const allRoutes = useRouteStore((s) => s.allRoutes);
  const activeRouteIndex = useRouteStore((s) => s.activeRouteIndex);
  const selectRoute = useRouteStore((s) => s.selectRoute);
  const isSidebarOpen = useRouteStore((s) => s.isSidebarOpen);

  const handleKeyDown = (e) => { if (e.key === 'Enter') onFindRoutes(); };

  return (
    <>
      <div className={`sidebar ${isSidebarOpen ? 'is-open' : ''}`}>

      {/* Route Inputs */}
      <div>
        <div className="section-label">Rute</div>
        <div className="input-group">
          <label>TITIK ASAL</label>
          <span className="input-icon">🔴</span>
          <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="Cth: Monas, Jakarta" onKeyDown={handleKeyDown} />
        </div>
        <div className="connector-line"></div>
        <div className="input-group" style={{ marginTop: '6px' }}>
          <label>TITIK TUJUAN</label>
          <span className="input-icon">🟢</span>
          <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="Cth: Puncak, Bogor" onKeyDown={handleKeyDown} />
        </div>
      </div>

      {/* Error Panel */}
      {error && (
        <div className="error-panel show">
          <strong>⚠ {error.title}</strong>
          <div dangerouslySetInnerHTML={{ __html: error.html }} />
        </div>
      )}

      {/* Options */}
      <div>
        <div className="section-label">Opsi</div>
        <div className="options-row">
          <div>
            <div className="section-label">MODE</div>
            <select className="opt-sel" value={travelMode} onChange={(e) => setTravelMode(e.target.value)}>
              <option value="DRIVING">🚗 Mobil</option>
              <option value="MOTORCYCLE">🏍 Motor</option>
              <option value="WALKING">🚶 Jalan Kaki</option>
            </select>
          </div>
          <div>
            <div className="section-label">SAMPEL ELEVASI</div>
            <select className="opt-sel" value={samples} onChange={(e) => setSamples(parseInt(e.target.value))}>
              <option value={128}>128 titik</option>
              <option value={256}>256 titik</option>
              <option value={512}>512 titik</option>
            </select>
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="status-bar">
        <div className={`status-dot ${status.state}`}></div>
        <span>{status.text}</span>
      </div>

      {/* Search Button */}
      <button className="btn-primary" disabled={searchDisabled} onClick={onFindRoutes}>
        ⛰ Cari Rute + Profil Elevasi
      </button>

      <div className="divider"></div>

      {/* Route Cards */}
      <div>
        <div className="section-label">Hasil Rute (<span>{allRoutes.length}</span> alternatif)</div>
        <div className="route-cards">
          {allRoutes.length === 0 ? (
            <div className="empty-state">
              <span className="icon">🗺</span>
              Belum ada hasil pencarian
            </div>
          ) : (
            allRoutes.map((route, i) => {
              const dist = (route.dist / 1000).toFixed(1);
              const dur = Math.round(route.dur / 60);
              const sc = i === 0 ? 'score-best' : (i === 1 ? 'score-mid' : 'score-low');
              const lbl = i === 0 ? '★ Terbaik' : '● Alt ' + (i + 1);
              return (
                <div key={i} className={`route-card${i === activeRouteIndex ? ' active' : ''}`} onClick={() => selectRoute(i)}>
                  <div className="card-header">
                    <span className="card-title" style={{ color: COLORS[i] || '#888' }}>Rute {i + 1}</span>
                    <span className={`score-badge ${sc}`}>{lbl} · {route.score}pt</span>
                  </div>
                  <div className="card-stats">
                    <div className="stat-item"><span className="stat-val">{dist}km</span><span className="stat-label">Jarak</span></div>
                    <div className="stat-item"><span className="stat-val">{dur}mnt</span><span className="stat-label">Waktu</span></div>
                    <div className="stat-item"><span className="stat-val stat-up">↑{route.gain}m</span><span className="stat-label">Gain</span></div>
                    <div className="stat-item"><span className="stat-val stat-down">↓{route.loss}m</span><span className="stat-label">Loss</span></div>
                  </div>
                  <button className="export-btn" onClick={(e) => { e.stopPropagation(); exportRouteData(route); }}>
                    📥 Export CSV
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
    </>
  );
}

function exportRouteData(route) {
  if (!route) return;
  const elevResults = route.elevResults;
  if (!elevResults || elevResults.length === 0) return;

  const distances = [0];
  for (let i = 1; i < elevResults.length; i++) {
    const p1 = elevResults[i - 1].location;
    const p2 = elevResults[i].location;
    const d = haversine(p1.lat(), p1.lng(), p2.lat(), p2.lng());
    distances.push(distances[i - 1] + d);
  }

  const rows = ['lat,lng,km,elev'];
  for (let i = 0; i < elevResults.length; i++) {
    const loc = elevResults[i].location;
    const lat = loc.lat();
    const lng = loc.lng();
    const km = (distances[i] / 1000).toFixed(3);
    const elev = Math.round(elevResults[i].elevation);
    rows.push(`${lat},${lng},${km},${elev}`);
  }
  const csvString = rows.join('\n');

  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `elevroute_data.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
