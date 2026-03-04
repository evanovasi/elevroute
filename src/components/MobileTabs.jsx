'use client';

import { useRouteStore } from '@/stores/routeStore';

export default function MobileTabs() {
  const activeTab = useRouteStore((s) => s.activeTab);
  const setActiveTab = useRouteStore((s) => s.setActiveTab);
  const allRoutes = useRouteStore((s) => s.allRoutes);

  return (
    <div className="mobile-tabs" id="mobileTabs">
      <button className={`tab-btn${activeTab === 'rute' ? ' active' : ''}`} onClick={() => setActiveTab('rute')}>
        🗂 Rute
        {allRoutes.length > 0 && (
          <span className="tab-badge">{allRoutes.length}</span>
        )}
      </button>
      <button className={`tab-btn${activeTab === 'peta' ? ' active' : ''}`} onClick={() => setActiveTab('peta')}>
        🗺 Peta
      </button>
    </div>
  );
}
