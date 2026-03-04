'use client';

import { useRouteStore } from '@/stores/routeStore';

export default function Header() {
  const appTheme = useRouteStore((s) => s.appTheme);
  const toggleAppTheme = useRouteStore((s) => s.toggleAppTheme);

  const isLight = appTheme === 'light';

  return (
    <header>
      <div className="logo">
        <div className="logo-icon">⛰</div>
        <div className="logo-text">Elev<span>Route</span></div>
      </div>
      <div className="header-right">
        <button className="theme-toggle" onClick={toggleAppTheme} title="Ganti tampilan Dark/Light">
          <span className="toggle-icon">{isLight ? '☀️' : '🌙'}</span>
          <div className={`toggle-track${isLight ? ' on' : ''}`}>
            <div className="toggle-thumb"></div>
          </div>
          <span className="toggle-label">{isLight ? 'Light' : 'Dark'}</span>
        </button>
        <span className="api-badge">Google Maps Platform</span>
      </div>
    </header>
  );
}
