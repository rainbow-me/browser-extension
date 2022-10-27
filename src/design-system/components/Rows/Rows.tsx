import React, { ReactNode } from 'react';
import flattenChildren from 'react-flatten-children';

import { Space } from '../../styles/designTokens';
import { Box } from '../Box/Box';

import * as styles from './Rows.css';

const alignHorizontalToAlignItems = {
  center: 'center',
  left: 'flex-start',
  right: 'flex-end',
} as const;
type AlignHorizontal = keyof typeof alignHorizontalToAlignItems;

const alignVerticalToJustifyContent = {
  bottom: 'flex-end',
  center: 'center',
  top: 'flex-start',
  justify: 'space-between',
} as const;
type AlignVertical = keyof typeof alignVerticalToJustifyContent;

interface RowsProps {
  space?: Space;
  alignHorizontal?: AlignHorizontal;
  alignVertical?: AlignVertical;
  children: ReactNode;
}

export function Rows({
  space,
  alignHorizontal,
  alignVertical,
  children,
}: RowsProps) {
  return (
    <Box
      display="flex"
      flexDirection="column"
      flexGrow="1"
      height="full"
      width="full"
      gap={space}
      alignItems={
        alignHorizontal && alignHorizontalToAlignItems[alignHorizontal]
      }
      justifyContent={
        alignVertical && alignVerticalToJustifyContent[alignVertical]
      }
    >
      {flattenChildren(children).map((child, index) => {
        const rowProps = getRowProps(child);

        return rowProps ? (
          // eslint-disable-next-line react/jsx-props-no-spreading
          <PrivateRow key={index} {...rowProps} />
        ) : (
          <PrivateRow key={index}>{child}</PrivateRow>
        );
      })}
    </Box>
  );
}

interface RowProps {
  height?: 'content' | keyof typeof styles.height;
  children: ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function Row(_props: RowProps): JSX.Element {
  // We use this pattern to ensure that Row can only be used within Rows.
  // Rows detects when this element has been used and replaces it with an
  // instance of PrivateRow instead, which means that this component is
  // never actually rendered when used correctly.
  throw new Error(
    'Row: Must be a direct child of Rows within the same component.',
  );
}
Row.__isRow__ = true;

function getRowProps(node: NonNullable<ReactNode>): RowProps | null {
  return typeof node === 'object' &&
    'type' in node &&
    // @ts-expect-error This lets us detect Row elements even if they've
    // been hot reloaded. If we checked that node.type === Row, it will
    // fail if Row has been dynamically replaced with a new component.
    node.type.__isRow__
    ? (node.props as RowProps)
    : null;
}

function PrivateRow({ children, height }: RowProps) {
  if (height) {
    return (
      <Box
        className={height !== 'content' ? styles.height[height] : undefined}
        flexGrow="0"
        flexShrink="0"
      >
        {children}
      </Box>
    );
  }

  return (
    <Box flexGrow="1" flexShrink="1" flexBasis="0">
      {children}
    </Box>
  );
}
