import { motion } from 'framer-motion';
import { ComponentPropsWithoutRef, PropsWithChildren, ReactNode } from 'react';

import { Box, textStyles } from '~/design-system';
import {
  accentSelectionStyle,
  placeholderStyle,
} from '~/design-system/components/Input/Input.css';
import { accentColorAsHsl } from '~/design-system/styles/core.css';
import {
  transformScales,
  transitions,
} from '~/design-system/styles/designTokens';

export type ImportWalletTextareaProps = PropsWithChildren<
  { error: ReactNode; testId: string } & ComponentPropsWithoutRef<'textarea'>
>;
export function ImportWalletTextarea({
  error,
  children,
  testId,
  ...props
}: ImportWalletTextareaProps) {
  const borderColor = error
    ? 'orange'
    : ({ default: 'buttonStroke', focus: 'accent' } as const);

  return (
    <Box
      as={motion.div}
      whileTap={{ scale: transformScales['0.96'] }}
      transition={transitions.bounce}
      height="full"
      width="full"
      position="relative"
      testId={testId}
    >
      <Box
        as="textarea"
        background="surfaceSecondaryElevated"
        borderRadius="12px"
        borderWidth="1px"
        borderColor={borderColor}
        padding="12px"
        width="full"
        testId="secret-textarea"
        className={[
          placeholderStyle,
          textStyles({
            color: 'label',
            fontSize: '14pt',
            fontWeight: 'regular',
            fontFamily: 'rounded',
          }),
          accentSelectionStyle,
        ]}
        style={{
          transition: 'border-color 200ms',
          caretColor: accentColorAsHsl,
          height: '96px',
          resize: 'none',
        }}
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
      />
      <Box position="absolute" marginTop="-24px" paddingLeft="12px">
        {error}
      </Box>
      {children}
    </Box>
  );
}
