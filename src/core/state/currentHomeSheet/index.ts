import { createBaseStore } from '@storesjs/stores';

type SheetMode = 'cancel' | 'none' | 'speedUp';

export interface CurrentSheetState {
  getCurrentHomeSheet: () => SheetMode | null;
  setCurrentHomeSheet: (sheetMode: SheetMode) => void;
  sheet: SheetMode;
}

export const useCurrentHomeSheetStore = createBaseStore<CurrentSheetState>(
  (set, get) => ({
    getCurrentHomeSheet: () => get().sheet,
    setCurrentHomeSheet: (sheetMode: SheetMode) => set({ sheet: sheetMode }),
    sheet: 'none',
  }),
);
