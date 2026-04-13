import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { idbStorage } from '@/lib/idb'
import type { Film, Camera, Lens } from '@/types'

interface MasterDataState {
    films: Film[]
    cameras: Camera[]
    lenses: Lens[]

    // Film actions
    addFilm: (data: Omit<Film, 'id'>) => void
    updateFilm: (id: string, patch: Partial<Omit<Film, 'id'>>) => void
    deleteFilm: (id: string) => void

    // Camera actions
    addCamera: (data: Omit<Camera, 'id'>) => void
    updateCamera: (id: string, patch: Partial<Omit<Camera, 'id'>>) => void
    deleteCamera: (id: string) => void

    // Lens actions
    addLens: (data: Omit<Lens, 'id'>) => void
    updateLens: (id: string, patch: Partial<Omit<Lens, 'id'>>) => void
    deleteLens: (id: string) => void

    // Bulk import (replaces all master data)
    importMasterData: (data: { films: Film[]; cameras: Camera[]; lenses: Lens[] }) => void

    // 전체 삭제
    clearAll: () => void
}

export const useMasterDataStore = create<MasterDataState>()(
    persist(
        (set) => ({
            films: [],
            cameras: [],
            lenses: [],

            addFilm: (data) => set((s) => ({ films: [...s.films, { id: nanoid(), ...data }] })),
            updateFilm: (id, patch) =>
                set((s) => ({ films: s.films.map((f) => (f.id === id ? { ...f, ...patch } : f)) })),
            deleteFilm: (id) => set((s) => ({ films: s.films.filter((f) => f.id !== id) })),

            addCamera: (data) =>
                set((s) => ({ cameras: [...s.cameras, { id: nanoid(), ...data }] })),
            updateCamera: (id, patch) =>
                set((s) => ({
                    cameras: s.cameras.map((c) => (c.id === id ? { ...c, ...patch } : c)),
                })),
            deleteCamera: (id) => set((s) => ({ cameras: s.cameras.filter((c) => c.id !== id) })),

            addLens: (data) => set((s) => ({ lenses: [...s.lenses, { id: nanoid(), ...data }] })),
            updateLens: (id, patch) =>
                set((s) => ({
                    lenses: s.lenses.map((l) => (l.id === id ? { ...l, ...patch } : l)),
                })),
            deleteLens: (id) => set((s) => ({ lenses: s.lenses.filter((l) => l.id !== id) })),

            importMasterData: (data) => set({ ...data }),

            clearAll: () => set({ films: [], cameras: [], lenses: [] }),
        }),
        {
            name: 'flog-master',
            storage: createJSONStorage(() => idbStorage),
        }
    )
)
