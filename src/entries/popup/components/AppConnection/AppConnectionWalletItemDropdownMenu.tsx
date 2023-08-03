import { shortcuts } from '~/core/references/shortcuts';
import { Box, ButtonSymbol, Inline, Stack, Text } from '~/design-system';
import { Symbol } from '~/design-system/components/Symbol/Symbol';

import { useKeyboardShortcut } from '../../hooks/useKeyboardShortcut';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../DropdownMenu/DropdownMenu';
import ExternalImage from '../ExternalImage/ExternalImage';

interface AppConnectionWalletItemDropdownMenuProps {
  appName?: string;
  appLogo?: string;
  open?: boolean;
  onClose?: () => void;
  onOpen?: () => void;
  testId?: string;
}

export const AppConnectionWalletItemDropdownMenu = ({
  appName,
  appLogo,
  onClose,
  onOpen,
  open,
  testId,
}: AppConnectionWalletItemDropdownMenuProps) => {
  useKeyboardShortcut({
    handler: (e: KeyboardEvent) => {
      if (e.key === shortcuts.global.CLOSE.key) {
        e.preventDefault();
        onClose?.();
      }
    },
  });
  return (
    <Box onClick={(e) => e.stopPropagation()} testId={testId}>
      <DropdownMenu
        onOpenChange={(openState) => (openState ? onOpen?.() : onClose?.())}
        open={open}
      >
        <DropdownMenuTrigger asChild>
          <Box style={{ cursor: 'default' }}>
            <ButtonSymbol
              color="labelTertiary"
              height="32px"
              variant="transparent"
              symbol="ellipsis.circle"
            />
          </Box>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end">
          <Box key="switch-networks">
            <DropdownMenuItem
              leftComponent={
                <Box height="fit" style={{ width: '18px', height: '18px' }}>
                  <Inline
                    height="full"
                    alignHorizontal="center"
                    alignVertical="center"
                  >
                    <Symbol
                      size={16}
                      symbol="network"
                      weight="semibold"
                      color="label"
                    />
                  </Inline>
                </Box>
              }
              onSelect={() => null}
            >
              <Stack space="8px">
                <Text size="14pt" weight="semibold" color="label">
                  {'Switch Networks'}
                </Text>
              </Stack>
            </DropdownMenuItem>
          </Box>
          <Box key="disconnect">
            <DropdownMenuItem
              color="label"
              leftComponent={
                <Box height="fit" style={{ width: '18px', height: '18px' }}>
                  <Inline
                    height="full"
                    alignHorizontal="center"
                    alignVertical="center"
                  >
                    <Symbol
                      size={12}
                      symbol="xmark"
                      weight="semibold"
                      color="label"
                    />
                  </Inline>
                </Box>
              }
              onSelect={() => null}
            >
              <Stack space="8px">
                <Text size="14pt" weight="semibold" color="label">
                  {'Disconnect'}
                </Text>
              </Stack>
            </DropdownMenuItem>
            <Box paddingVertical="4px">
              <DropdownMenuSeparator />
            </Box>
          </Box>
          <Box key="open-dapp">
            <DropdownMenuItem
              color="label"
              leftComponent={
                <Box
                  style={{
                    height: '18px',
                    width: '18px',
                    overflow: 'hidden',
                  }}
                  borderRadius="9px"
                >
                  <Inline
                    alignHorizontal="center"
                    alignVertical="center"
                    height="full"
                  >
                    <ExternalImage src={appLogo} width="18" height="18" />
                  </Inline>
                </Box>
              }
              onSelect={() => null}
            >
              <Stack space="8px">
                <Text size="14pt" weight="semibold" color="label">
                  {`Open ${appName}`}
                </Text>
              </Stack>
            </DropdownMenuItem>
          </Box>
        </DropdownMenuContent>
      </DropdownMenu>
    </Box>
  );
};
