import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { idbStorage } from '@/lib/idb'
import type { Roll, Frame } from '@/types'

interface RollState {
    rolls: Roll[]
    activeRollId: string | null

    startRoll: (params: {
        filmId: string
        cameraId: string
        maxFrames: number
    }) => string // returns new roll id

    finishRoll: (rollId: string) => void
    deleteRoll: (rollId: string) => void

    setCurrentLens: (rollId: string, lensId: string | undefined) => void
    recordFrame: (rollId: string) => void
    updateFrame: (
        rollId: string,
        frameId: string,
        patch: Partial<Pick<Frame, 'lensId' | 'aperture' | 'shutterSpeed' | 'memo'>>
    ) => void
    deleteFrame: (rollId: string, frameId: string) => void

    // Bulk import (replaces all rolls)
    importRolls: (rolls: Roll[], activeRollId: string | null) => void
}

export const useRollStore = create<RollState>()(
    persist(
        (set, get) => ({
            rolls: [],
            activeRollId: null,

            startRoll: ({ filmId, cameraId, maxFrames }) => {
                const id = nanoid()
                const newRoll: Roll = {
                    id,
                    filmId,
                    cameraId,
                    maxFrames,
                    startedAt: new Date().toISOString(),
                    frames: [],
                    status: 'active',
                }
                set((s) => ({
                    rolls: [...s.rolls, newRoll],
                    activeRollId: id,
                }))
                return id
            },

            finishRoll: (rollId) =>
                set((s) => ({
                    rolls: s.rolls.map((r) =>
                        r.id === rollId
                            ? { ...r, status: 'finished', finishedAt: new Date().toISOString() }
                            : r
                    ),
                    activeRollId: s.activeRollId === rollId ? null : s.activeRollId,
                })),

            deleteRoll: (rollId) =>
                set((s) => ({
                    rolls: s.rolls.filter((r) => r.id !== rollId),
                    activeRollId: s.activeRollId === rollId ? null : s.activeRollId,
                })),

            setCurrentLens: (rollId, lensId) =>
                set((s) => ({
                    rolls: s.rolls.map((r) =>
                        r.id === rollId ? { ...r, currentLensId: lensId } : r
                    ),
                })),

            recordFrame: (rollId) => {
                const roll = get().rolls.find((r) => r.id === rollId)
                if (!roll || roll.frames.length >= roll.maxFrames) return

                const frame: Frame = {
                    id: nanoid(),
                    frameNumber: roll.frames.length + 1,
                    timestamp: new Date().toISOString(),
                    lensId: roll.currentLensId,
                }
                set((s) => ({
                    rolls: s.rolls.map((r) =>
                        r.id === rollId ? { ...r, frames: [...r.frames, frame] } : r
                    ),
                }))
            },

            updateFrame: (rollId, frameId, patch) =>
                set((s) => ({
                    rolls: s.rolls.map((r) =>
                        r.id === rollId
                            ? {
                                  ...r,
                                  frames: r.frames.map((f) =>
                                      f.id === frameId ? { ...f, ...patch } : f
                                  ),
                              }
                            : r
                    ),
                })),

            deleteFrame: (rollId, frameId) =>
                set((s) => ({
                    rolls: s.rolls.map((r) =>
                        r.id === rollId
                            ? {
                                  ...r,
                                  frames: r.frames
                                      .filter((f) => f.id !== frameId)
                                      .map((f, i) => ({ ...f, frameNumber: i + 1 })),
                              }
                            : r
                    ),
                })),

            importRolls: (rolls, activeRollId) => set({ rolls, activeRollId }),
        }),
        {
            name: 'flog-rolls',
            storage: createJSONStorage(() => idbStorage),
        }
    )
)
