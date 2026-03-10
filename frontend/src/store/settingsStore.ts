import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    colorEventsByTag: boolean;
    toggleColorByTag: () => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            colorEventsByTag: true, // Default to true
            toggleColorByTag: () => set((state) => ({ colorEventsByTag: !state.colorEventsByTag })),
        }),
        {
            name: 'app-settings',
        }
    )
);
