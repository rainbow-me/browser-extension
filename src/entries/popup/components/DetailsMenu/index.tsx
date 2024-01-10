import { ReactNode } from 'react';

import { Box, Inline } from '~/design-system';

import { ContextMenu, ContextMenuContent } from '../ContextMenu/ContextMenu';

export function DetailsMenuRow({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) {
  return (
    <Box
      marginVertical="-5px"
      onClick={onClick}
      paddingVertical="2px"
      width="full"
    >
      <Inline space="8px" alignVertical="center" alignHorizontal="justify">
        {children}
      </Inline>
    </Box>
  );
}

export function DetailsMenuContentWrapper({
  children,
  closed,
}: {
  children: ReactNode;
  closed: boolean;
}) {
  if (closed) return null;
  return <ContextMenuContent>{children}</ContextMenuContent>;
}

export function DetailsMenuWrapper({
  children,
  closed,
  onOpenChange,
}: {
  children: ReactNode;
  closed: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  if (closed) {
    return <ContextMenu onOpenChange={onOpenChange}>{children}</ContextMenu>;
  }

  return <ContextMenu>{children}</ContextMenu>;
}
