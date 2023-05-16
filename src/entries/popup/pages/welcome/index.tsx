import React, { useState } from 'react';

import { usePendingRequestStore } from '~/core/state';

import { FlyingRainbows } from '../../components/FlyingRainbows/FlyingRainbows';

import { ImportOrCreateWallet } from './ImportOrCreateWallet';
import { InviteCodePortal } from './InviteCodePortal';
import { OnboardBeforeConnectSheet } from './OnboardBeforeConnectSheet';

export function Welcome() {
  const [screen, setScreen] = useState<'invite_code' | 'unlock'>('invite_code');
  const { pendingRequests } = usePendingRequestStore();
  const [showOnboardBeforeConnectSheet, setShowOnboardBeforeConnectSheet] =
    useState(!!pendingRequests.length);

  return (
    <>
      <OnboardBeforeConnectSheet
        show={showOnboardBeforeConnectSheet}
        onClick={() => setShowOnboardBeforeConnectSheet(false)}
      />
      <FlyingRainbows screen={screen}>
        {screen === 'invite_code' ? (
          <InviteCodePortal onInviteCodeValidated={() => setScreen('unlock')} />
        ) : (
          <ImportOrCreateWallet />
        )}
      </FlyingRainbows>
    </>
  );
}
