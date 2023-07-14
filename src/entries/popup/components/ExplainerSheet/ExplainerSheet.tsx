import React, { useCallback, useState } from 'react';

import { goToNewTab } from '~/core/utils/tabs';
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
import { TextLink } from '~/design-system/components/TextLink/TextLink';
import { TextStyles } from '~/design-system/styles/core.css';
import { ButtonVariant } from '~/design-system/styles/designTokens';

import { zIndexes } from '../../utils/zIndexes';

export interface ExplainerSheetProps {
  show: boolean;
  header:
    | {
        emoji?: never;
        icon?: React.ReactElement;
        headerPill?: React.ReactElement;
      }
    | {
        emoji?: string;
        icon?: never;
        headerPill?: React.ReactElement;
      };
  title: string;
  description: string[];
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
  footerLinkText?: {
    openText: string;
    linkText: string;
    closeText: string;
    link: string;
  };
  testId?: string;
}

export const useExplainerSheetParams = () => {
  const [explainerSheetParams, setExplainerSheetParams] =
    useState<ExplainerSheetProps>({
      show: false,
      header: {},
      title: '',
      description: [''],
      footerLinkText: undefined,
      testId: '',
    });

  const hideExplainerSheet = useCallback(
    () =>
      setExplainerSheetParams({
        show: false,
        header: {},
        title: '',
        description: [''],
        footerLinkText: undefined,
        testId: '',
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

  return { explainerSheetParams, hideExplainerSheet, showExplainerSheet };
};

export const ExplainerSheet = ({
  show,
  header,
  title,
  description,
  actionButton,
  cancelButton,
  linkButton,
  footerLinkText,
  testId,
}: ExplainerSheetProps) => {
  const goToLink = useCallback((link?: string) => {
    link &&
      goToNewTab({
        url: link,
        active: false,
      });
  }, []);

  return (
    <BottomSheet
      onClickOutside={actionButton?.action}
      zIndex={zIndexes.EXPLAINER_BOTTOM_SHEET}
      show={show}
    >
      <Box testId={`explainer-sheet-${testId}`}>
        <Box paddingVertical="44px" paddingHorizontal="32px">
          <Stack alignHorizontal="center" space="20px">
            {header?.emoji ? (
              <Text weight="heavy" size="32pt" color="label">
                {header?.emoji}
              </Text>
            ) : (
              header?.icon
            )}
            <Text weight="heavy" size="20pt" color="label">
              {title}
            </Text>

            {header.headerPill && <Box>{header.headerPill}</Box>}

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
            {footerLinkText && (
              <Box>
                <Text
                  align="center"
                  weight="regular"
                  size="14pt"
                  color="labelTertiary"
                >
                  {footerLinkText.openText}
                  <TextLink
                    color="blue"
                    onClick={() => goToLink(footerLinkText.link)}
                  >
                    {footerLinkText?.linkText}
                  </TextLink>
                  {footerLinkText?.closeText}
                </Text>
              </Box>
            )}
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
                      onClick={() => goToLink(linkButton?.url)}
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
                testId="explainer-action-button"
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
      </Box>
    </BottomSheet>
  );
};
