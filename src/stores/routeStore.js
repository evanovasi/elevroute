import { create } from 'zustand';

export const COLORS = ['#FF2C2C', '#00c9ff', '#ffb347'];

export const useRouteStore = create((set) => ({
  // API & inputs
  origin: '',
  destination: '',
  travelMode: 'DRIVING',
  samples: 256,

  // State
  allRoutes: [],
  activeRouteIndex: 0,
  mapState: { type: 'terrain', theme: 'light' }, // UI State
  status: { text: 'Masukkan titik awal dan tujuan untuk memulai', state: '' },
  error: null,
  loading: null,
  searchDisabled: false,
  appTheme: 'light',

  // Map objects (refs, not reactive — stored in refs in components)
  sdkLoaded: false,

  // Mobile & Sidebar
  activeTab: 'rute',
  isSidebarOpen: true,

  // Simulation
  simulationVisible: false,

  // Actions
  setOrigin: (v) => set({ origin: v }),
  setDestination: (v) => set({ destination: v }),
  setTravelMode: (v) => set({ travelMode: v }),
  setSamples: (v) => set({ samples: v }),

  setRoutes: (routes) => set({ allRoutes: routes, activeRouteIndex: 0, simulationVisible: true }),
  selectRoute: (idx) => set({ activeRouteIndex: idx }),

  setMapState: (ms) => set((s) => ({ mapState: { ...s.mapState, ...ms } })),
  setStatus: (text, state) => set({ status: { text, state: state || '' } }),
  setError: (err) => set({ error: err }),
  clearError: () => set({ error: null }),
  setLoading: (text) => set({ loading: text }),
  hideLoading: () => set({ loading: null }),
  setSearchDisabled: (v) => set({ searchDisabled: v }),
  setSdkLoaded: () => set({ sdkLoaded: true }),

  setAppTheme: (theme) => {
    if (typeof window !== 'undefined') localStorage.setItem('elevroute-theme', theme);
    set({ appTheme: theme });
  },
  toggleAppTheme: () => set((s) => {
    const next = s.appTheme === 'dark' ? 'light' : 'dark';
    if (typeof window !== 'undefined') localStorage.setItem('elevroute-theme', next);
    return { appTheme: next };
  }),

  setActiveTab: (tab) => set({ activeTab: tab }),
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
}));
