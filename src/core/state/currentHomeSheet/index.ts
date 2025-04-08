import { createRainbowStore } from '../internal/createRainbowStore';

type SheetMode = 'cancel' | 'none' | 'speedUp';

export interface CurrentSheetState {
  getCurrentHomeSheet: () => SheetMode | null;
  setCurrentHomeSheet: (sheetMode: SheetMode) => void;
  sheet: SheetMode;
}

export const useCurrentHomeSheetStore = createRainbowStore<CurrentSheetState>(
  (set, get) => ({
    getCurrentHomeSheet: () => get().sheet,
    setCurrentHomeSheet: (sheetMode: SheetMode) => set({ sheet: sheetMode }),
    sheet: 'none',
  }),
);
