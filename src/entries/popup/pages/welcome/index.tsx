import * as React from 'react';
import rainbowLogo from 'static/assets/rainbow/rainbow-logo.png';
import { i18n } from '~/core/languages';
import {
  Box,
  Button,
  Inline,
  Inset,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { Row, Rows } from '~/design-system/components/Rows/Rows';

export function Welcome() {
  return (
    <Box display="flex" flexDirection="column" height="full">
      <Box
        background="surfaceSecondary"
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: 360,
          height: 600,
          borderRadius: '32px',
          marginTop: 151,
          alignItems: 'center',
          alignSelf: 'center',
        }}
      >
        <Box width="full" justifyContent="center">
          <img src={rainbowLogo} width="162" height="40" />
        </Box>
        <Box width="full" alignItems="center" marginTop="-4px">
          <Text align="center" color="labelTertiary" size="14pt" weight="bold">
            {i18n.t('welcome.subtitle')}
          </Text>
        </Box>
        <Rows alignVertical="top" space="20px">
          <Button color="fill" height="36px" variant="flat" width="full">
            {i18n.t('welcome.create_wallet')}
          </Button>
          <Button
            color="surfaceSecondaryElevated"
            height="36px"
            variant="raised"
            width="full"
          >
            {i18n.t('welcome.import_wallet')}
          </Button>
        </Rows>
      </Box>
    </Box>
  );
}
