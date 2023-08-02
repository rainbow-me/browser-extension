import { useState } from 'react';

import UnsupportedBrowserIcon from 'static/assets/unsupportedBrowserIcon.svg';
import { i18n } from '~/core/languages';
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
      title={i18n.t('unsupported_browser.title')}
      description={[i18n.t('unsupported_browser.description')]}
      header={{
        icon: (
          <Box
            as="img"
            src={UnsupportedBrowserIcon}
            style={{ width: '212px' }}
          />
        ),
      }}
      footerLinkText={{
        openText: '',
        linkText: i18n.t('unsupported_browser.link_text.highlighted'),
        closeText: i18n.t('unsupported_browser.link_text.after'),
        link: 'https://support.rainbow.me/',
      }}
      actionButton={{
        label: i18n.t('unsupported_browser.download_the_app'),
        labelColor: 'label',
        symbol: 'arrow.right',
        symbolSide: 'right',
        action: () => window.open('https://rainbow.me'),
      }}
      onClickOutside={() => setIsOpen(false)}
    />
  );
}
