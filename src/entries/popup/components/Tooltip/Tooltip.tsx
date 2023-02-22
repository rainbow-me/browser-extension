import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import React, { ReactNode } from 'react';

import { Box, Text } from '~/design-system';

export const Tooltip = ({
  children,
  text,
}: {
  children: ReactNode;
  text: string;
}) => {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild>{children}</TooltipPrimitive.Trigger>
        <TooltipPrimitive.Portal>
          <TooltipPrimitive.Content className="TooltipContent" sideOffset={5}>
            <Box
              background="surfaceSecondaryElevated"
              padding="7px"
              boxShadow="24px surfaceSecondaryElevated"
              borderRadius="6px"
              backdropFilter="blur(26px)"
            >
              <Text color="label" size="16pt" weight="bold">
                {text}
              </Text>
            </Box>
          </TooltipPrimitive.Content>
        </TooltipPrimitive.Portal>
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
};
