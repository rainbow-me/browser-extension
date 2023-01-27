import React, { useCallback, useState } from 'react';

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
import { TextStyles } from '~/design-system/styles/core.css';
import { ButtonVariant } from '~/design-system/styles/designTokens';

interface ExplainerSheetProps {
  show: boolean;
  emoji: string;
  title: string;
  description: string[];
  headerPill?: React.ReactElement;
  actionButton?: {
    label: string;
    variant?: ButtonVariant;
    labelColor?: TextStyles['color'];
    action: () => void;
  };
  cancelButton?: {
    label: string;
    variant?: ButtonVariant;
    labelColor?: TextStyles['color'];
    action: () => void;
  };
  linkButton?: {
    label: string;
    url: string;
  };
}

export const useExplainerSheetParams = () => {
  const [explainerSheetParams, setExplainerSheetParams] =
    useState<ExplainerSheetProps>({
      show: false,
      emoji: '',
      title: '',
      description: [''],
    });

  const hideExplanerSheet = useCallback(
    () =>
      setExplainerSheetParams({
        show: false,
        emoji: '',
        title: '',
        description: [''],
      }),
    [],
  );

  const showExplainerSheet = useCallback(
    (params: ExplainerSheetProps) =>
      setExplainerSheetParams({
        ...params,
        show: true,
      }),
    [],
  );

  return { explainerSheetParams, hideExplanerSheet, showExplainerSheet };
};

export const ExplainerSheet = ({
  show,
  emoji,
  title,
  description,
  actionButton,
  cancelButton,
  linkButton,
  headerPill,
}: ExplainerSheetProps) => {
  const goToLink = useCallback(() => {
    linkButton?.url &&
      chrome.tabs.create({
        url: linkButton?.url,
      });
  }, [linkButton?.url]);

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

          {headerPill && <Box>{headerPill}</Box>}

          <Box style={{ width: 102 }}>
            <Separator color="separatorTertiary" strokeWeight="1px" />
          </Box>

          {description.map((t, i) => (
            <Text
              key={i}
              align="center"
              weight="regular"
              size="14pt"
              color="labelTertiary"
            >
              {t}
            </Text>
          ))}
        </Stack>
      </Box>
      <Box width="full" padding="20px">
        <Rows space="8px">
          {linkButton && (
            <Row>
              <Box width="full" alignItems="center">
                <Inline alignHorizontal="center">
                  <Button
                    width="full"
                    color="fill"
                    height="44px"
                    variant="flat"
                    onClick={goToLink}
                  >
                    <Text
                      align="center"
                      weight="bold"
                      size="16pt"
                      color="labelQuaternary"
                    >
                      {linkButton.label}
                    </Text>
                  </Button>
                </Inline>
              </Box>
            </Row>
          )}
          <Row>
            <Button
              width="full"
              color="blue"
              height="44px"
              variant={actionButton?.variant || 'raised'}
              onClick={actionButton?.action}
            >
              <Text
                align="center"
                weight="bold"
                size="16pt"
                color={actionButton?.labelColor || 'accent'}
              >
                {actionButton?.label}
              </Text>
            </Button>
          </Row>

          {cancelButton && (
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
                      {cancelButton?.label}
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
