import { createRainbowStore } from '../internal/createRainbowStore';

type SheetMode = 'cancel' | 'none' | 'speedUp';

export interface CurrentSheetState {
  getCurrentHomeSheet: () => SheetMode | null;
  setCurrentHomeSheet: (sheetMode: SheetMode) => void;
  sheet: SheetMode;
}

export const currentHomeSheetStore = createRainbowStore<CurrentSheetState>(
  (set, get) => ({
    getCurrentHomeSheet: () => get().sheet,
    setCurrentHomeSheet: (sheetMode: SheetMode) => set({ sheet: sheetMode }),
    sheet: 'none',
  }),
);

export const useCurrentHomeSheetStore = currentHomeSheetStore;
