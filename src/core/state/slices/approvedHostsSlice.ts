import { StateCreator } from 'zustand';
import { BackgroundStoreState } from '../backgroundStore';

export interface ApprovedHostsSliceState {
  approvedHosts: string[];
  isApprovedHost: (host: string) => boolean;
  addApprovedHost: (host: string) => void;
  removeApprovedHost: (host: string) => void;
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
  removeApprovedHost: (removedHost) =>
    set(({ approvedHosts }) => ({
      approvedHosts: approvedHosts.filter((host) => host !== removedHost),
    })),
  isApprovedHost: (host) => {
    const approvedHosts = get().approvedHosts;
    return approvedHosts.includes(host);
  },
  clearApprovedHosts: () =>
    set(() => ({
      approvedHosts: [],
    })),
});
