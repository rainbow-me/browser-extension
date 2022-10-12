import React, { useCallback, useEffect, useState } from 'react';
import { useBalance } from 'wagmi';
import { useFirstTransactionTimestamp } from '~/core/resources/transactions';
import { Storage } from '~/core/storage';

import { title } from './index.css';

export function Index() {
  const [status, setStatus] = useState(0);

  const { data: balance } = useBalance({
    addressOrName: '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4',
  });
  const { data: firstTransactionTimestamp } = useFirstTransactionTimestamp({
    address: '0x70c16D2dB6B00683b29602CBAB72CE0Dcbc243C4',
  });

  const switchInjection = useCallback(async () => {
    const shouldInject = (await Storage.get('inject')) === true;
    const newVal = !shouldInject;
    Storage.set('inject', newVal);
    setStatus(newVal ? 1 : 0);
  }, []);

  useEffect(() => {
    const init = async () => {
      const shouldInject = (await Storage.get('inject')) === true;
      setStatus(shouldInject ? 1 : 0);
    };
    init();
  }, []);

  return (
    <div>
      <h1 className={title}>Rainbow Rocks!!!</h1>
      <div>Balance: {balance?.formatted}</div>
      {firstTransactionTimestamp && (
        <div>
          First transaction on: {new Date(firstTransactionTimestamp).toString()}
        </div>
      )}
      Injecting? <div id="injection-status">{status ? 'YES' : 'NO'}</div>
      <button id="injection-button" onClick={switchInjection}>
        TURN {status ? 'OFF' : 'ON'}
      </button>
    </div>
  );
}
