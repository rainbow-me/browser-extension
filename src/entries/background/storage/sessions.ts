import create from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { persistStorage } from '~/core/state/persistStorage';
import {
  sessionsSlice,
  SessionsSliceState,
} from '~/core/state/slices/sessionsSlice';

export const backgroundStore = create<SessionsSliceState>()(
  persist(
    (...props) => ({
      ...sessionsSlice(...props),
    }),
    { name: 'store:background', getStorage: () => persistStorage },
  ),
);
