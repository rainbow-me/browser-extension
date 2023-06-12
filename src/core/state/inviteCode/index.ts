import create from 'zustand';

import { createStore } from '../internal/createStore';

export interface InviteCodeStore {
  inviteCodeValidated: boolean;
  setInviteCodeValidated: (inviteCodeValidated: boolean) => void;
}

export const inviteCodeStore = createStore<InviteCodeStore>(
  (set) => ({
    inviteCodeValidated: false,
    setInviteCodeValidated: (inviteCodeValidated: boolean) => {
      set({
        inviteCodeValidated,
      });
    },
  }),
  {
    persist: {
      name: 'inviteCodeStore',
      version: 0,
    },
  },
);

export const useInviteCodeStore = create(inviteCodeStore);
