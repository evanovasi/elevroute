'use client';

import { useRouteStore } from '@/stores/routeStore';

export default function Header() {
  const appTheme = useRouteStore((s) => s.appTheme);
  const toggleAppTheme = useRouteStore((s) => s.toggleAppTheme);
  const isSidebarOpen = useRouteStore((s) => s.isSidebarOpen);
  const toggleSidebar = useRouteStore((s) => s.toggleSidebar);

  const isLight = appTheme === 'light';

  return (
    <header>
      <div className="header-left">
        <button
          className="header-sidebar-toggle"
          onClick={toggleSidebar}
          title={isSidebarOpen ? "Tutup Sidebar" : "Buka Sidebar"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" width="20" height="20">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="logo">
          <div className="logo-icon">⛰</div>
          <div className="logo-text">Elev<span>Route</span></div>
        </div>
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
