import { StateCreator } from 'zustand';
import { BackgroundStoreState } from '../backgroundStore';

export interface ApprovedHostsSliceState {
  approvedHosts: string[];
  isApprovedHost: (host?: string) => boolean;
  addApprovedHost: (host: string) => void;
  clearApprovedHosts: () => void;
}

export const approvedHostsSlice: StateCreator<
  BackgroundStoreState,
  [['zustand/persist', unknown]],
  [],
  ApprovedHostsSliceState
> = (set, get) => ({
  approvedHosts: [],
  addApprovedHost: (host) =>
    set(({ approvedHosts }) => ({
      approvedHosts: approvedHosts.concat([host]),
    })),
  isApprovedHost: (host) => {
    const approvedHosts = get().approvedHosts;
    return !!host && approvedHosts.includes(host);
  },
  clearApprovedHosts: () =>
    set(() => ({
      approvedHosts: [],
    })),
});
