import { useEffect, useState } from 'react';

import { RAINBOW_TEST_DAPP } from '~/core/references/links';
import { getDappHost } from '~/core/utils/connectedApps';

import { useAppSessions } from './useAppSessions';

export const useActiveTab = () => {
  const { appSessions } = useAppSessions();
  const [activeTab, setActiveTab] = useState<{ url: string; title: string }>({
    url:
      process.env.IS_TESTING === 'true' &&
      appSessions[getDappHost(RAINBOW_TEST_DAPP)]
        ? RAINBOW_TEST_DAPP
        : '',
    title: '',
  });
  useEffect(() => {
    chrome?.tabs?.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      try {
        const url = tabs[0].url;
        const title = tabs[0].title || '';
        if (url) {
          const urlObject = new URL(url ?? '');
          if (
            urlObject.protocol === 'http:' ||
            urlObject.protocol === 'https:'
          ) {
            setActiveTab({ url, title });
          }
        }
      } catch (e) {
        //
      }
    });
  }, []);
  return activeTab;
};
