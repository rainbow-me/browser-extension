import { createBaseStore } from '@storesjs/stores';

type SheetMode = 'cancel' | 'none' | 'speedUp';

export interface CurrentSheetState {
  setCurrentHomeSheet: (sheetMode: SheetMode) => void;
  sheet: SheetMode;
}

export const useCurrentHomeSheetStore = createBaseStore<CurrentSheetState>(
  (set) => ({
    setCurrentHomeSheet: (sheetMode: SheetMode) => set({ sheet: sheetMode }),
    sheet: 'none',
  }),
);
