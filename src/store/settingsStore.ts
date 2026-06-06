import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ApertureStop } from '@/types';

interface SettingsState {
    autoNavigateToShooting: boolean;
    setAutoNavigateToShooting: (value: boolean) => void;
    autoFinishRoll: boolean;
    setAutoFinishRoll: (value: boolean) => void;
    recordLocation: boolean;
    setRecordLocation: (value: boolean) => void;
    carryOverExposure: boolean;
    setCarryOverExposure: (value: boolean) => void;
    apertureStop: ApertureStop;
    setApertureStop: (value: ApertureStop) => void;
    sortFramesNewestFirst: boolean;
    setSortFramesNewestFirst: (value: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            autoNavigateToShooting: true,
            setAutoNavigateToShooting: (value) => set({ autoNavigateToShooting: value }),
            autoFinishRoll: false,
            setAutoFinishRoll: (value) => set({ autoFinishRoll: value }),
            recordLocation: false,
            setRecordLocation: (value) => set({ recordLocation: value }),
            carryOverExposure: true,
            setCarryOverExposure: (value) => set({ carryOverExposure: value }),
            apertureStop: '1',
            setApertureStop: (value) => set({ apertureStop: value }),
            sortFramesNewestFirst: false,
            setSortFramesNewestFirst: (value) => set({ sortFramesNewestFirst: value }),
        }),
        {
            name: 'filo-settings',
            storage: createJSONStorage(() => localStorage),
            version: 1,
            // v0의 halfStopAperture(boolean)을 apertureStop으로 변환한다.
            migrate: (persisted, version) => {
                const state = (persisted ?? {}) as Record<string, unknown>;
                if (version < 1) {
                    state.apertureStop = state.halfStopAperture ? '1/2' : '1';
                    delete state.halfStopAperture;
                }
                return state as unknown as SettingsState;
            },
        },
    ),
);
