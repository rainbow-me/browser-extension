import { Source } from '@rainbow-me/swaps';
import { AnimatePresence, motion } from 'framer-motion';
import { I18n } from 'i18n-js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import config from '~/core/firebase/remoteConfig';
import { i18n } from '~/core/languages';
import { RAINBOW_LEARN_URL } from '~/core/references/links';
import { useCurrentAddressStore } from '~/core/state';
import { useFeatureFlagsStore } from '~/core/state/currentSettings/featureFlags';
import { ChainId } from '~/core/types/chains';
import {
  Bleed,
  Box,
  Button,
  ButtonSymbol,
  Inline,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { BottomSheet } from '~/design-system/components/BottomSheet/BottomSheet';
import { AccentColorProvider } from '~/design-system/components/Box/ColorContext';
import { ButtonOverflow } from '~/design-system/components/Button/ButtonOverflow';
import { Lens } from '~/design-system/components/Lens/Lens';
import { Toggle } from '~/design-system/components/Toggle/Toggle';
import { TextStyles } from '~/design-system/styles/core.css';
import {
  toggleDegenMode,
  useDegenMode,
} from '~/entries/popup/hooks/swap/useSwapDegenMode';
import { useTranslationContext } from '~/entries/popup/hooks/useTranslationContext';
import { simulateClick } from '~/entries/popup/utils/simulateClick';

import {
  ExplainerSheet,
  useExplainerSheetParams,
} from '../../../components/ExplainerSheet/ExplainerSheet';
import { getDefaultSlippage } from '../../../hooks/swap/useSwapSettings';
import { useAvatar } from '../../../hooks/useAvatar';
import usePrevious from '../../../hooks/usePrevious';
import { SlippageInputMask } from '../SlippageInputMask';
import { aggregatorInfo } from '../utils';

import { SwapRouteDropdownMenu } from './SwapRouteDropdownMenu';

const Label = ({
  label,
  warning,
  testId,
  onClick,
}: {
  label: string;
  warning?: 'loss';
  testId: string;
  onClick: () => void;
}) => (
  <Box as={motion.div} layout="position">
    <Stack space="8px">
      <Inline space="4px" alignVertical="center">
        <Box as={motion.div}>
          <Text align="left" color="label" size="14pt" weight="semibold">
            {label}
          </Text>
        </Box>
        <AnimatePresence>
          {!!warning && (
            <Box
              key="swap-settings-warning-icon"
              as={motion.div}
              layout
              marginBottom="-2px"
              testId="swap-settings-slippage-warning"
            >
              <Bleed vertical="6px" horizontal="6px">
                <ButtonSymbol
                  symbol={'exclamationmark.triangle.fill'}
                  color={'orange'}
                  height="28px"
                  variant="transparent"
                  onClick={onClick}
                />
              </Bleed>
            </Box>
          )}
          {!warning && (
            <Box key="swap-settings-warning-icon" as={motion.div} layout>
              <Bleed vertical="6px" horizontal="6px">
                <ButtonSymbol
                  symbol="info.circle.fill"
                  color="labelQuaternary"
                  height="28px"
                  variant="tinted"
                  onClick={onClick}
                  testId={testId}
                />
              </Bleed>
            </Box>
          )}
        </AnimatePresence>
      </Inline>
      <AnimatePresence>
        {!!warning && (
          <Box key="swap-settings-warning" as={motion.div} layout="position">
            <Inline space="4px">
              <Text color={'orange'} size="14pt" weight="medium">
                {i18n.t(`swap.settings.warnings.high`)}
              </Text>
              <Text color="label" size="14pt" weight="medium">
                {'‧'}
              </Text>
              <Text color="labelTertiary" size="14pt" weight="medium">
                {i18n.t(`swap.settings.warnings.possible_loss`)}
              </Text>
            </Inline>
          </Box>
        )}
      </AnimatePresence>
    </Stack>
  </Box>
);

interface SwapSettingsProps {
  accentColor?: string;
  chainId?: ChainId;
  show: boolean;
  slippage: string;
  onDone: () => void;
  setSettings: ({
    source,
    slippage,
  }: {
    source: Source | 'auto';
    slippage: string;
  }) => void;
  bridge: boolean;
}

const getRoutingExplainerProps = (t: I18n['t']) => ({
  show: true,
  header: {
    emoji: '🔀',
  },
  description: [t('swap.settings.explainers.routing.description')],
  title: t('swap.settings.explainers.routing.title'),
  actionButton: {
    label: t('swap.settings.explainers.got_it'),
    labelColor: 'label' as TextStyles['color'],
  },
  footerLinkText: {
    openText: t('swap.settings.explainers.routing.read_more.open_text'),
    linkText: t('swap.settings.explainers.routing.read_more.link_text'),
    closeText: t('swap.settings.explainers.routing.read_more.close_text'),
    link: `${RAINBOW_LEARN_URL}/swap-with-confidence-with-rainbow`,
  },
});

const getSlippageExplainerProps = (t: I18n['t']) => ({
  show: true,
  header: {
    emoji: '🌊',
  },
  description: [
    t('swap.settings.explainers.slippage.description_1'),
    t('swap.settings.explainers.slippage.description_2'),
  ],
  title: t('swap.settings.explainers.slippage.title'),
  actionButton: {
    label: t('swap.settings.explainers.got_it'),
    labelColor: 'label' as TextStyles['color'],
  },
  footerLinkText: {
    openText: t('swap.settings.explainers.slippage.read_more.open_text'),
    linkText: t('swap.settings.explainers.slippage.read_more.link_text'),
    closeText: t('swap.settings.explainers.slippage.read_more.close_text'),
    link: 'https://academy.shrimpy.io/post/what-is-slippage-how-to-avoid-slippage-on-defi-exchanges',
  },
});

function DegenModeCard() {
  const { isDegenModeEnabled } = useDegenMode();

  const { featureFlags } = useFeatureFlagsStore();

  if (!featureFlags.degen_mode && !config.degen_mode) return null;

  return (
    <Stack marginHorizontal="-8px" space="16px" paddingBottom="8px">
      <Box
        paddingVertical="16px"
        paddingLeft="16px"
        paddingRight="12px"
        background="fillTertiary"
        borderWidth="1.5px"
        borderRadius="16px"
        borderColor="separatorSecondary"
        display="flex"
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between"
      >
        <Stack space="8px">
          <Text size="14pt" weight="heavy" color="label">
            {i18n.t('swap.settings.degen_mode.title')}
          </Text>
          <Text size="12pt" weight="bold" color="labelSecondary">
            {i18n.t('swap.settings.degen_mode.description')}
          </Text>
        </Stack>
        <Toggle checked={isDegenModeEnabled} handleChange={toggleDegenMode} />
      </Box>
      <Separator color="separatorTertiary" />
    </Stack>
  );
}

export const SwapSettings = ({
  accentColor,
  chainId = ChainId.mainnet,
  show,
  slippage: defaultSlippage,
  setSettings,
  onDone,
  bridge,
}: SwapSettingsProps) => {
  const { currentAddress } = useCurrentAddressStore();
  const { data: avatar } = useAvatar({ addressOrName: currentAddress });

  const prevChainId = usePrevious(chainId);
  const [source, setSource] = useState<
    Source.Aggregator0x | Source.Aggregator1inch | 'auto'
  >('auto');
  const [slippage, setSlippage] = useState<string>(defaultSlippage);

  const slippageInputRef = useRef(null);
  const settingsAccentColor = accentColor || avatar?.color;

  const routesTriggerRef = useRef(null);

  const { explainerSheetParams, showExplainerSheet, hideExplainerSheet } =
    useExplainerSheetParams();

  // translate based on the context, bridge or swap
  const t = useTranslationContext();

  const setDefaultSettings = useCallback(() => {
    setSource('auto');
    const defaultSlippage = getDefaultSlippage(chainId);
    setSlippage(defaultSlippage);
  }, [chainId]);

  const done = useCallback(() => {
    try {
      setSettings({
        source,
        slippage,
      });
      onDone();
    } catch (e) {
      //
    }
  }, [onDone, setSettings, slippage, source]);

  const slippageWarning = useMemo(
    () => (Number(slippage) >= 6 ? 'loss' : undefined),
    [slippage],
  );

  useEffect(() => {
    if (prevChainId !== chainId) {
      setSlippage(getDefaultSlippage(chainId));
    }
  }, [prevChainId, chainId]);

  const showSlippageExplainer = useCallback(() => {
    const slippageExplainerProps = getSlippageExplainerProps(t);
    showExplainerSheet({
      ...slippageExplainerProps,
      actionButton: {
        ...slippageExplainerProps.actionButton,
        action: hideExplainerSheet,
      },
      testId: 'swap-slippage',
    });
  }, [hideExplainerSheet, showExplainerSheet, t]);

  const showRoutingExplainer = useCallback(() => {
    const routingExplainerProps = getRoutingExplainerProps(t);
    showExplainerSheet({
      ...routingExplainerProps,
      actionButton: {
        ...routingExplainerProps.actionButton,
        action: hideExplainerSheet,
      },
      testId: 'swap-routing',
    });
  }, [hideExplainerSheet, showExplainerSheet, t]);

  return (
    <>
      <ExplainerSheet
        show={explainerSheetParams.show}
        header={explainerSheetParams.header}
        title={explainerSheetParams.title}
        description={explainerSheetParams.description}
        actionButton={explainerSheetParams.actionButton}
        footerLinkText={explainerSheetParams.footerLinkText}
      />
      <BottomSheet onClickOutside={done} background="scrim" show={show}>
        <AccentColorProvider color={settingsAccentColor}>
          <Box paddingHorizontal="20px" paddingBottom="20px">
            <Stack space="10px">
              <Box>
                <Box style={{ height: '64px' }}>
                  <Inline
                    height="full"
                    alignVertical="center"
                    alignHorizontal="center"
                  >
                    <Text
                      align="center"
                      color="label"
                      size="14pt"
                      weight="heavy"
                    >
                      {t('swap.settings.title')}
                    </Text>
                  </Inline>
                </Box>

                <DegenModeCard />

                <Box paddingBottom="8px">
                  <Stack space="12px">
                    {!bridge ? (
                      <Box
                        testId="swap-settings-route-row"
                        style={{ height: '32px' }}
                      >
                        <Inline
                          alignVertical="center"
                          alignHorizontal="justify"
                        >
                          <Label
                            label={t('swap.settings.route')}
                            onClick={showRoutingExplainer}
                            testId="swap-settings-route-label"
                          />
                          <Lens
                            onKeyDown={() =>
                              simulateClick(routesTriggerRef?.current)
                            }
                            style={{ borderRadius: 6, padding: 4 }}
                          >
                            <SwapRouteDropdownMenu
                              accentColor={settingsAccentColor}
                              source={source}
                              setSource={setSource}
                            >
                              <Box
                                testId={`settings-route-context-trigger-${source}`}
                                ref={routesTriggerRef}
                              >
                                <ButtonOverflow style={{ height: '23px' }}>
                                  <Inline
                                    height="full"
                                    space="4px"
                                    alignVertical="center"
                                  >
                                    <Box
                                      style={{ height: '16px', width: '16px' }}
                                    >
                                      <img
                                        src={aggregatorInfo[source].logo}
                                        width="100%"
                                        height="100%"
                                      />
                                    </Box>
                                    <Text
                                      color="label"
                                      size="14pt"
                                      weight="semibold"
                                    >
                                      {aggregatorInfo[source].name}
                                    </Text>
                                    <Symbol
                                      size={12}
                                      symbol="chevron.down"
                                      weight="semibold"
                                    />
                                  </Inline>
                                </ButtonOverflow>
                              </Box>
                            </SwapRouteDropdownMenu>
                          </Lens>
                        </Inline>
                      </Box>
                    ) : null}

                    <Box
                      testId="swap-settings-slippage-row"
                      style={{ height: '32px' }}
                    >
                      <Inline alignVertical="center" alignHorizontal="justify">
                        <Label
                          label={t('swap.settings.max_slippage')}
                          onClick={showSlippageExplainer}
                          warning={slippageWarning}
                          testId="swap-settings-slippage-label"
                        />
                        <SlippageInputMask
                          variant={'transparent'}
                          onChange={setSlippage}
                          value={String(slippage)}
                          inputRef={slippageInputRef}
                        />
                      </Inline>
                    </Box>
                  </Stack>
                </Box>
              </Box>
              <Box width="full">
                <Button
                  width="full"
                  color="fillSecondary"
                  height="28px"
                  variant="plain"
                  onClick={setDefaultSettings}
                  testId="settings-use-defaults-button"
                  tabIndex={0}
                >
                  <Text
                    align="center"
                    color="labelSecondary"
                    size="14pt"
                    weight="bold"
                  >
                    {t('swap.settings.use_defaults')}
                  </Text>
                </Button>
              </Box>
              <Box alignItems="center" justifyContent="center" display="flex">
                <Separator
                  color="separatorTertiary"
                  strokeWeight="1px"
                  width="102px"
                />
              </Box>
              <Box width="full" paddingTop="20px">
                <Button
                  width="full"
                  color="accent"
                  height="44px"
                  variant="flat"
                  onClick={done}
                  testId="swap-settings-done"
                  tabIndex={0}
                >
                  <Text align="center" color="label" size="16pt" weight="bold">
                    {t('swap.settings.done')}
                  </Text>
                </Button>
              </Box>
            </Stack>
          </Box>
        </AccentColorProvider>
      </BottomSheet>
    </>
  );
};
