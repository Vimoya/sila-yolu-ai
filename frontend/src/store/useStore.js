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
      lastPosition: null, // { lat, lng, city, updatedAt }
      fuelLastSearch: null,   // { query, stations, avgPrices, source, ts }
      fuelLastSearchAt: null, // timestamp ms

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
      }),
    }
  )
)
