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
        <button className={`theme-toggle ${isLight ? 'is-light' : 'is-dark'}`} onClick={toggleAppTheme} title="Ganti tampilan Dark/Light" aria-label="Toggle Theme">
          <div className="theme-toggle-inner">
            <span className="theme-icon sun">☀️</span>
            <span className="theme-icon moon">🌙</span>
          </div>
        </button>
      </div>
    </header>
  );
}
