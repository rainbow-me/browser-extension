/* eslint-disable react/jsx-props-no-spreading */
import {
  Content,
  Header,
  Item,
  Root,
  Trigger,
} from '@radix-ui/react-accordion';
import clsx from 'clsx';
import { PropsWithChildren, ReactNode } from 'react';

import { Box, BoxProps } from '../Box/Box';
import { Inline } from '../Inline/Inline';
import { Symbol } from '../Symbol/Symbol';
import { Text, TextProps } from '../Text/Text';

import * as styles from './accordion.css';

export const Accordion = Root;

type AccordionTriggerProps =
  | (Partial<TextProps> & { asChild?: false })
  | { asChild?: true; children: ReactNode };
export function AccordionTrigger({
  children,
  asChild,
  ...props
}: PropsWithChildren<AccordionTriggerProps>) {
  const trigger = asChild ? (
    children
  ) : (
    <Text size="14pt" weight="heavy" {...props}>
      <Inline space="4px" alignVertical="center">
        {children}
        <Box className={styles.chevron}>
          <Symbol
            color="labelTertiary"
            symbol="chevron.down.circle"
            size={11}
            weight="semibold"
          />
        </Box>
      </Inline>
    </Text>
  );
  return (
    <Header asChild>
      <Trigger asChild>
        <div className={styles.trigger}>{trigger}</div>
      </Trigger>
    </Header>
  );
}

export function AccordionContent(props: PropsWithChildren<BoxProps>) {
  return (
    <Content asChild>
      <Box
        display="flex"
        flexDirection="column"
        {...props}
        className={clsx(styles.content, props.className)}
      />
    </Content>
  );
}

export function AccordionItem({
  value,
  children,
}: PropsWithChildren<{ value: string }>) {
  return <Item value={value}>{children}</Item>;
}
