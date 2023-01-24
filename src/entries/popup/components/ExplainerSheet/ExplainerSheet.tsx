import React from 'react';

import {
  Box,
  Button,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';

export const ExplainerSheet = ({
  show,
  emoji,
  title,
  description,
  actionButtonLabel,
  actionButtonAction,
  cancelButtonLabel,
}: {
  show: boolean;
  emoji: string;
  title: string;
  description: string | string[];
  actionButtonLabel: string;
  actionButtonAction: () => void;
  cancelButtonLabel?: string;
}) => {
  return (
    <BottomSheet show={show}>
      <Box paddingVertical="44px" paddingHorizontal="32px">
        <Stack alignHorizontal="center" space="20px">
          <Text weight="heavy" size="32pt" color="label">
            {emoji}
          </Text>
          <Text weight="heavy" size="20pt" color="label">
            {title}
          </Text>
          <Separator color="separatorTertiary" />
          {typeof description === 'string' ? (
            <Text
              align="center"
              weight="regular"
              size="14pt"
              color="labelTertiary"
            >
              {description}
            </Text>
          ) : (
            description.map((t, i) => (
              <Text
                key={i}
                align="center"
                weight="regular"
                size="14pt"
                color="labelTertiary"
              >
                {t}
              </Text>
            ))
          )}
        </Stack>
      </Box>
      <Box width="full" padding="20px">
        <Rows space="8px">
          <Row>
            <Button
              width="full"
              color="accent"
              height="44px"
              variant="raised"
              onClick={actionButtonAction}
            >
              <Text align="center" weight="bold" size="16pt" color="label">
                {actionButtonLabel}
              </Text>
            </Button>
          </Row>
          {cancelButtonLabel && (
            <Row>
              <Box width="full" alignItems="center">
                <Inline alignHorizontal="center">
                  <Button color="transparent" height="44px" variant="tinted">
                    <Text
                      align="center"
                      weight="bold"
                      size="16pt"
                      color="labelSecondary"
                    >
                      {cancelButtonLabel}
                    </Text>
                  </Button>
                </Inline>
              </Box>
            </Row>
          )}
        </Rows>
      </Box>
    </BottomSheet>
  );
};
