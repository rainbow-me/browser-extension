import { StateCreator } from 'zustand';
import { CoreStoreState } from '../coreStore';

export interface BoolSliceState {
  value: boolean;
  toggleValue: () => void;
}

export const boolSlice: StateCreator<
  CoreStoreState,
  [['zustand/persist', unknown]],
  [],
  BoolSliceState
> = (set) => ({
  value: false,
  toggleValue: () => set((state) => ({ value: !state.value })),
});
