import create from 'zustand';

import { createStore } from '../internal/createStore';

type SheetMode = 'cancel' | 'none' | 'speedUp';

export interface CurrentSheetState {
  getCurrentSheet: () => SheetMode | null;
  setCurrentSheet: (sheetMode: SheetMode) => void;
  sheet: SheetMode;
}

export const currentSheetStore = createStore<CurrentSheetState>((set, get) => ({
  getCurrentSheet: () => get().sheet,
  setCurrentSheet: (sheetMode: SheetMode) => set({ sheet: sheetMode }),
  sheet: 'none',
}));

export const useCurrentSheetStore = create(currentSheetStore);
