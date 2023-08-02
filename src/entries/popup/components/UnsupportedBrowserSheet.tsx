import { useState } from 'react';

import UnsupportedBrowserIcon from 'static/assets/unsupportedBrowserIcon.svg';
import { Box } from '~/design-system';

import { useBrowser } from '../hooks/useBrowser';
import { isMobile } from '../utils/isMobile';

import { ExplainerSheet } from './ExplainerSheet/ExplainerSheet';

export function UnsupportedBrowserSheet() {
  const { isSupported } = useBrowser();
  const [isOpen, setIsOpen] = useState(isMobile() || !isSupported);

  return (
    <ExplainerSheet
      show={isOpen}
      description={[
        'Your browser is not currently supported. Rainbow is currently available for Android and iOS on mobile, and Chrome, Brave, Arc, and Edge on desktop devices.',
      ]}
      title="Unsupported Browser"
      header={{
        icon: (
          <Box
            as="img"
            src={UnsupportedBrowserIcon}
            style={{
              width: '212px',
            }}
          />
        ),
      }}
      footerLinkText={{
        openText: '',
        linkText: 'Contact Rainbow',
        closeText: ' to request more.',
        link: 'https://support.rainbow.me/',
      }}
      actionButton={{
        label: 'Download the App',
        labelColor: 'label',
        symbol: 'arrow.right',
        symbolSide: 'right',
        action: () => window.open('https://rainbow.me'),
      }}
      onClickOutside={() => setIsOpen(false)}
    />
  );
}
