import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      isDark: true,
      activeTab: 'home',
      currentRoute: null,
      checklist: {},

      setUser: (user) => set({ user }),
      toggleDark: () => set((s) => ({ isDark: !s.isDark })),
      setActiveTab: (tab) => set({ activeTab: tab }),
      setCurrentRoute: (route) => set({ currentRoute: route }),
      toggleCheckItem: (id) =>
        set((s) => ({
          checklist: { ...s.checklist, [id]: !s.checklist[id] },
        })),
    }),
    { name: 'sila-store', partialize: (s) => ({ isDark: s.isDark, checklist: s.checklist }) }
  )
)
