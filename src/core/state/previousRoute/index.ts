import create from 'zustand';

import { AnimatedAttributes } from '~/design-system/styles/designTokens';

export interface PreviousRouteState {
  previousExit: AnimatedAttributes | null;
  setPreviousExit: (direction: AnimatedAttributes | null) => void;
}

export const usePreviousRouteStore = create<PreviousRouteState>((set) => ({
  previousExit: null,
  setPreviousExit: (exit) => set({ previousExit: exit }),
}));
