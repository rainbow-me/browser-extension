import React, { ReactNode } from 'react';

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
      onClick={onClick}
      paddingVertical="2px"
      width="full"
      marginVertical="-5px"
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
  onOpenChange: () => void;
}) {
  if (closed) {
    return <ContextMenu onOpenChange={onOpenChange}>{children}</ContextMenu>;
  }

  return <ContextMenu>{children}</ContextMenu>;
}
