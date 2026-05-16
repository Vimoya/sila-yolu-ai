import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set) => ({
      user: null,
      isDark: true,
      activeTab: 'dashboard',
      currentRoute: null,
      routeResult: null,
      checklist: {},
      lastPosition: null,
      fuelLastSearch: null,
      fuelLastSearchAt: null,
      savedRoutes: [],   // [{ id, start, dest, routeKey, km, hours, total, date, countries }]
      tankSize: 60,      // Liter — User-Eingabe
      language: localStorage.getItem('lang') || 'de',

      // Route settings — persisted so user doesn't re-enter every time
      routeSettings: {
        start: 'München',
        dest: 'Istanbul',
        fuel: 'diesel',
        consumption: 8,
        fuelPrice: 1.65,
        avoidFerry: false,
        avoidToll: false,
        selectedRouteKey: 'austria_hungary',
        persons: 4,
      },

      setLastPosition: (pos) => set({ lastPosition: pos }),
      setFuelLastSearch: (data) => set({ fuelLastSearch: data, fuelLastSearchAt: Date.now() }),
      setUser: (user) => set({ user }),
      toggleDark: () => {},
      setActiveTab: (tab) => set({ activeTab: tab }),
      setCurrentRoute: (route) => set({ currentRoute: route }),
      setRouteResult: (result) => set({ routeResult: result }),
      setRouteSettings: (settings) => set((s) => ({ routeSettings: { ...s.routeSettings, ...settings } })),
      toggleCheckItem: (id) => set((s) => ({ checklist: { ...s.checklist, [id]: !s.checklist[id] } })),
      setTankSize: (v) => set({ tankSize: v }),
      setLanguage: (lang) => { localStorage.setItem('lang', lang); set({ language: lang }) },
      saveRoute: (route) => set((s) => {
        const entry = { ...route, id: Date.now(), date: new Date().toISOString() }
        const existing = s.savedRoutes.filter(r => !(r.start === route.start && r.dest === route.dest && r.routeKey === route.routeKey))
        return { savedRoutes: [entry, ...existing].slice(0, 10) }
      }),
      deleteRoute: (id) => set((s) => ({ savedRoutes: s.savedRoutes.filter(r => r.id !== id) })),
    }),
    {
      name: 'sila-store',
      partialize: (s) => ({
        checklist: s.checklist,
        routeSettings: s.routeSettings,
        currentRoute: s.currentRoute,
        routeResult: s.routeResult,
        lastPosition: s.lastPosition,
        fuelLastSearch: s.fuelLastSearch,
        fuelLastSearchAt: s.fuelLastSearchAt,
        savedRoutes: s.savedRoutes,
        tankSize: s.tankSize,
        language: s.language,
      }),
    }
  )
)
