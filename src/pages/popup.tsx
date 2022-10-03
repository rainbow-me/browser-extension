import React, { useCallback, useEffect, useState } from 'react';
import { Storage } from '../utils/storage';

import { title } from './popup.css';

export function Popup() {
  const [status, setStatus] = useState(0);

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
      <h1 className={title}>Rainbow Rocks!</h1>
      Injecting? <div id="injection-status">{status ? 'YES' : 'NO'}</div>
      <button id="injection-button" onClick={switchInjection}>
        TURN {status ? 'OFF' : 'ON'}
      </button>
    </div>
  );
}
