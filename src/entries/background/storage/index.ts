import create from 'zustand/vanilla';
import { persist } from 'zustand/middleware';
import { persistStorage } from '~/core/state/persistStorage';
import {
  sessionsSlice,
  SessionsSliceState,
} from '~/core/state/slices/sessionsSlice';
import {
  RequestsSliceState,
  requestSlice,
} from '~/core/state/slices/requestsSlice';

export type BackgrounStorage = SessionsSliceState & RequestsSliceState;

export const backgroundStore = create<BackgrounStorage>()(
  persist(
    (...props) => ({
      ...sessionsSlice(...props),
      ...requestSlice(...props),
    }),
    { name: 'store:background', getStorage: () => persistStorage },
  ),
);
