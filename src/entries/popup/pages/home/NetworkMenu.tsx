import * as React from 'react';

import { AppNetworkMenu } from '../../components/SwitchMenu/AppNetworkMenu';

export const NetworkMenu = ({ children }: { children: React.ReactNode }) => {
  const [url, setUrl] = React.useState('');

  React.useEffect(() => {
    chrome?.tabs?.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const url = tabs[0].url;
      try {
        if (url) {
          const urlObject = new URL(url ?? '');
          if (
            urlObject.protocol === 'http:' ||
            urlObject.protocol === 'https:'
          ) {
            setUrl(url);
          }
        }
      } catch (e) {
        //
      }
    });
  }, []);

  return (
    <AppNetworkMenu sideOffset={1} url={url}>
      {children}
    </AppNetworkMenu>
  );
};
