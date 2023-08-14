import { useEffect, useState } from 'react';

export const useActiveTab = () => {
  const [activeTab, setActiveTab] = useState<{ url: string; title: string }>({
    url:
      process.env.IS_TESTING === 'true'
        ? 'https://bx-test-dapp.vercel.app/'
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
