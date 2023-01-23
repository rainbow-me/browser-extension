import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { i18n } from '~/core/languages';
import { txSpeedEmoji } from '~/core/references/txSpeed';
import { useGasStore } from '~/core/state';
import { GasFeeParams, GasSpeed } from '~/core/types/gas';
import {
  handleSignificantDecimals,
  isZero,
  lessThan,
} from '~/core/utils/numbers';
import {
  Box,
  Button,
  Column,
  Columns,
  Inline,
  Row,
  Rows,
  Separator,
  Stack,
  Symbol,
  Text,
} from '~/design-system';
import { Prompt } from '~/design-system/components/Prompt/Prompt';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';
import { SymbolStyles, TextStyles } from '~/design-system/styles/core.css';
import { SymbolName } from '~/design-system/styles/designTokens';

import usePrevious from '../../hooks/usePrevious';
import { GweiInputMask } from '../InputMask/GweiInputMask/GweiInputMask';

const speeds = [GasSpeed.URGENT, GasSpeed.FAST, GasSpeed.NORMAL];

const { innerWidth: windowWidth } = window;
const TEXT_OVERFLOW_WIDTH = windowWidth / 2 - 30;

const getBaseFeeTrend = (trend: number) => {
  switch (trend) {
    case -1:
      return {
        color: 'green',
        label: i18n.t('custom_gas.base_trend.falling'),
        symbol: 'arrow.down.forward',
      };
    case 0:
      return {
        color: 'yellow',
        label: i18n.t('custom_gas.base_trend.stable'),
        symbol: 'sun.max.fill',
      };
    case 1:
      return {
        color: 'red',
        label: i18n.t('custom_gas.base_trend.surging'),
        symbol: 'exclamationmark.triangle.fill',
      };
    case 2:
      return {
        color: 'orange',
        label: i18n.t('custom_gas.base_trend.rising'),
        symbol: 'arrow.up.forward',
      };
    default:
      return { color: 'blue', label: '', symbol: '' };
  }
};

const GasLabel = ({
  label,
  warning,
}: {
  label: string;
  warning?: 'stuck' | 'fail';
}) => {
  if (!warning) {
    return (
      <Text align="left" color="label" size="14pt" weight="semibold">
        {label}
      </Text>
    );
  }

  return (
    <Rows space="8px">
      <Row>
        <Inline space="4px" alignVertical="center">
          <Text align="left" color="label" size="14pt" weight="semibold">
            {label}
          </Text>
          <Symbol
            symbol={'exclamationmark.triangle.fill'}
            color={warning === 'fail' ? 'red' : 'orange'}
            weight="bold"
            size={11}
          />
        </Inline>
      </Row>
      <Row>
        <Inline space="4px">
          <Text
            color={warning === 'fail' ? 'red' : 'orange'}
            size="14pt"
            weight="medium"
          >
            {i18n.t(`custom_gas.warnings.low`)}
          </Text>
          <Text color="label" size="14pt" weight="medium">
            {'‧'}
          </Text>
          <Text color="labelTertiary" size="14pt" weight="medium">
            {i18n.t(
              `custom_gas.warnings.${
                warning === 'stuck' ? 'may_get_stuck' : 'likely_to_fail'
              }`,
            )}
          </Text>
        </Inline>
      </Row>
    </Rows>
  );
};

export const CustomGasSheet = ({
  show,
  currentBaseFee,
  baseFeeTrend,
  setCustomMaxBaseFee,
  setCustomMaxPriorityFee,
  closeCustomGasSheet,
  setSelectedSpeed,
}: {
  show: boolean;
  currentBaseFee: string;
  baseFeeTrend: number;
  setCustomMaxBaseFee: (maxBaseFee: string) => void;
  setCustomMaxPriorityFee: (maxPriorityFee: string) => void;
  closeCustomGasSheet: () => void;
  setSelectedSpeed: (speed: GasSpeed) => void;
}) => {
  const {
    gasFeeParamsBySpeed: { custom: customSpeed },
    gasFeeParamsBySpeed,
    selectedGas,
    setSelectedGas,
  } = useGasStore();

  const [selectedSpeedOption, setSelectedSpeedOption] = useState<GasSpeed>(
    selectedGas.option,
  );

  const prevSelectedGasOption = usePrevious(selectedSpeedOption);

  const maxBaseFeeInputRef = useRef<HTMLInputElement>(null);
  const maxPriorityFeeInputRef = useRef<HTMLInputElement>(null);

  const [maxBaseFee, setMaxBaseFee] = useState(
    (customSpeed as GasFeeParams)?.maxBaseFee?.gwei,
  );
  const [maxPriorityFee, setMaxPriorityFee] = useState(
    (customSpeed as GasFeeParams)?.maxPriorityFeePerGas?.gwei,
  );

  const [maxBaseFeeWarning, setMaxBaseFeeWarning] = useState<
    'stuck' | 'fail' | undefined
  >();
  const [maxPriorityFeeWarning, setPriorityBaseFeeWarning] = useState<
    'stuck' | 'fail' | undefined
  >();

  const trend = useMemo(() => getBaseFeeTrend(baseFeeTrend), [baseFeeTrend]);

  const updateCustomMaxBaseFee = useCallback(
    (maxBaseFee: string) => {
      if (prevSelectedGasOption !== GasSpeed.CUSTOM && prevSelectedGasOption) {
        const prevSelectedGas = gasFeeParamsBySpeed[
          prevSelectedGasOption
        ] as GasFeeParams;
        setSelectedGas({
          selectedGas: prevSelectedGas,
        });
        setMaxPriorityFee(prevSelectedGas.maxPriorityFeePerGas.gwei);
      }
      setSelectedSpeedOption(GasSpeed.CUSTOM);
      setCustomMaxBaseFee(maxBaseFee);
      setMaxBaseFee(maxBaseFee);
    },
    [
      gasFeeParamsBySpeed,
      prevSelectedGasOption,
      setCustomMaxBaseFee,
      setSelectedGas,
    ],
  );

  const updateCustomMaxPriorityFee = useCallback(
    (maxPriorityFee: string) => {
      if (prevSelectedGasOption !== GasSpeed.CUSTOM && prevSelectedGasOption) {
        const prevSelectedGas = gasFeeParamsBySpeed[
          prevSelectedGasOption
        ] as GasFeeParams;
        setSelectedGas({
          selectedGas: prevSelectedGas,
        });
        setMaxBaseFee(prevSelectedGas.maxBaseFee.gwei);
      }
      setSelectedSpeedOption(GasSpeed.CUSTOM);
      setCustomMaxPriorityFee(maxPriorityFee);
      setMaxPriorityFee(maxPriorityFee);
    },
    [
      gasFeeParamsBySpeed,
      prevSelectedGasOption,
      setCustomMaxPriorityFee,
      setSelectedGas,
    ],
  );

  const setCustomGas = useCallback(() => {
    setSelectedSpeed(selectedSpeedOption);
    closeCustomGasSheet();
  }, [closeCustomGasSheet, selectedSpeedOption, setSelectedSpeed]);

  useEffect(() => {
    onSelectedGasChange(selectedGas.option);
    setTimeout(() => {
      maxBaseFeeInputRef?.current?.focus();
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  useEffect(() => {
    if (!maxBaseFee || isZero(maxBaseFee)) {
      setMaxBaseFeeWarning('fail');
    } else if (lessThan(maxBaseFee, currentBaseFee)) {
      setMaxBaseFeeWarning('stuck');
    } else {
      setMaxBaseFeeWarning(undefined);
    }
  }, [currentBaseFee, gasFeeParamsBySpeed.normal, maxBaseFee]);

  useEffect(() => {
    const normalSpeed = gasFeeParamsBySpeed.normal as GasFeeParams;
    if (!maxPriorityFee || isZero(maxPriorityFee)) {
      setPriorityBaseFeeWarning('fail');
    } else if (
      lessThan(maxPriorityFee, normalSpeed.maxPriorityFeePerGas.gwei)
    ) {
      setPriorityBaseFeeWarning('stuck');
    } else {
      setPriorityBaseFeeWarning(undefined);
    }
  }, [gasFeeParamsBySpeed.normal, maxBaseFee, maxPriorityFee]);

  const onSelectedGasChange = useCallback(
    (speed: GasSpeed) => {
      const selectedGas = gasFeeParamsBySpeed[speed] as GasFeeParams;
      setSelectedGas({ selectedGas: gasFeeParamsBySpeed[speed] });
      setMaxBaseFee(selectedGas.maxBaseFee.gwei);
      setMaxPriorityFee(selectedGas.maxPriorityFeePerGas.gwei);
      setSelectedSpeedOption(speed);
      maxBaseFeeInputRef?.current?.focus();
    },
    [gasFeeParamsBySpeed, setSelectedGas],
  );

  return (
    <Prompt
      background="surfaceSecondary"
      show={show}
      padding="16px"
      backdropFilter="opacity(0%)"
      scrimBackground
    >
      <Box paddingHorizontal="20px">
        <Box paddingVertical="27px">
          <Text color="label" align="center" size="14pt" weight="heavy">
            {i18n.t('custom_gas.title')}
          </Text>
        </Box>
        <Box paddingBottom="8px">
          <Stack space="12px">
            <Box paddingBottom="12px">
              <Box height="full">
                <Stack space="12px">
                  <Inline
                    height="full"
                    alignHorizontal="right"
                    space="4px"
                    alignVertical="center"
                  >
                    <Symbol
                      symbol={trend.symbol as SymbolName}
                      color={trend.color as SymbolStyles['color']}
                      weight="bold"
                      size={11}
                    />
                    <Text
                      color={trend.color as TextStyles['color']}
                      align="center"
                      size="11pt"
                      weight="bold"
                    >
                      {trend.label}
                    </Text>
                  </Inline>
                  <Inline
                    height="full"
                    alignHorizontal="justify"
                    alignVertical="bottom"
                  >
                    <Text
                      color="label"
                      align="left"
                      size="14pt"
                      weight="semibold"
                    >
                      {i18n.t('custom_gas.current_base_fee')}
                    </Text>
                    <Text
                      color="label"
                      align="right"
                      size="14pt"
                      weight="semibold"
                    >
                      {`${handleSignificantDecimals(
                        currentBaseFee,
                        0,
                        3,
                        true,
                      )} Gwei`}
                    </Text>
                  </Inline>
                </Stack>
              </Box>
            </Box>
            <Box>
              <Inline
                height="fit"
                alignHorizontal="justify"
                alignVertical="center"
              >
                <Box>
                  <GasLabel
                    label={i18n.t('custom_gas.max_base_fee')}
                    warning={maxBaseFeeWarning}
                  />
                </Box>
                <Box style={{ width: 98 }} marginRight="-4px">
                  <GweiInputMask
                    inputRef={maxBaseFeeInputRef}
                    value={maxBaseFee}
                    variant="surface"
                    onChange={updateCustomMaxBaseFee}
                  />
                </Box>
              </Inline>
            </Box>
            <Box>
              <Inline
                height="full"
                alignHorizontal="justify"
                alignVertical="center"
              >
                <Box>
                  <GasLabel
                    label={i18n.t('custom_gas.miner_tip')}
                    warning={maxPriorityFeeWarning}
                  />
                </Box>
                <Box style={{ width: 98 }} marginRight="-4px">
                  <GweiInputMask
                    inputRef={maxPriorityFeeInputRef}
                    value={maxPriorityFee}
                    variant="surface"
                    onChange={updateCustomMaxPriorityFee}
                  />
                </Box>
              </Inline>
            </Box>
            <Box paddingVertical="12px">
              <Inline alignHorizontal="justify" alignVertical="center">
                <Text color="label" align="left" size="14pt" weight="semibold">
                  {i18n.t('custom_gas.max_transaction_fee')}
                </Text>
                <TextOverflow
                  maxWidth={TEXT_OVERFLOW_WIDTH}
                  color="label"
                  align="right"
                  size="14pt"
                  weight="semibold"
                >
                  {customSpeed.gasFee.display}
                </TextOverflow>
              </Inline>
            </Box>
          </Stack>
        </Box>

        <Box
          background="surfaceSecondaryElevated"
          paddingBottom="20px"
          paddingTop="22px"
          marginHorizontal="-20px"
          paddingHorizontal="20px"
          style={{
            borderEndEndRadius: 16,
            borderEndStartRadius: 16,
          }}
        >
          <Box paddingBottom="8px">
            <Text color="labelQuaternary" size="12pt" weight="semibold">
              {i18n.t('custom_gas.transaction_speed')}
            </Text>
          </Box>

          <Stack space="2px">
            <Box
              paddingVertical="8px"
              borderRadius="12px"
              marginHorizontal="-12px"
              paddingHorizontal="12px"
              background={{
                default:
                  selectedSpeedOption === GasSpeed.CUSTOM
                    ? 'accent'
                    : 'transparent',
                hover: 'accent',
              }}
              onClick={() => onSelectedGasChange(GasSpeed.CUSTOM)}
            >
              <Inline alignVertical="center" alignHorizontal="justify">
                <Inline space="10px" alignVertical="center">
                  <Text weight="semibold" size="14pt">
                    {txSpeedEmoji[GasSpeed.CUSTOM]}
                  </Text>
                  <Stack space="12px">
                    <Text
                      align="left"
                      color="label"
                      size="14pt"
                      weight="semibold"
                    >
                      {i18n.t(`transaction_fee.custom`)}
                    </Text>
                    <TextOverflow
                      maxWidth={TEXT_OVERFLOW_WIDTH - 50}
                      align="left"
                      color="label"
                      size="11pt"
                      weight="semibold"
                    >
                      {customSpeed.gasFee.display}
                    </TextOverflow>
                  </Stack>
                </Inline>

                <Stack space="12px">
                  <TextOverflow
                    maxWidth={TEXT_OVERFLOW_WIDTH}
                    align="right"
                    color="label"
                    size="14pt"
                    weight="semibold"
                  >
                    {customSpeed.display}
                  </TextOverflow>
                  <TextOverflow
                    maxWidth={TEXT_OVERFLOW_WIDTH}
                    align="right"
                    color="label"
                    size="11pt"
                    weight="semibold"
                  >
                    {customSpeed.estimatedTime.display}
                  </TextOverflow>
                </Stack>
              </Inline>
            </Box>

            <Box>
              <Separator color="separatorTertiary" />
            </Box>

            {speeds.map((speed, i) => (
              <>
                <Box
                  key={i}
                  paddingVertical="8px"
                  borderRadius="12px"
                  marginHorizontal="-12px"
                  paddingHorizontal="12px"
                  background={{
                    default:
                      selectedSpeedOption === speed ? 'accent' : 'transparent',
                    hover: 'accent',
                  }}
                  onClick={() => onSelectedGasChange(speed)}
                >
                  <Inline alignVertical="center" alignHorizontal="justify">
                    <Inline space="10px" alignVertical="center">
                      <Text weight="semibold" size="14pt">
                        {txSpeedEmoji[speed]}
                      </Text>
                      <Stack space="12px">
                        <Text
                          align="left"
                          color="label"
                          size="14pt"
                          weight="semibold"
                        >
                          {i18n.t(`transaction_fee.${speed}`)}
                        </Text>
                        <TextOverflow
                          maxWidth={TEXT_OVERFLOW_WIDTH}
                          align="left"
                          color="label"
                          size="11pt"
                          weight="semibold"
                        >
                          {gasFeeParamsBySpeed[speed].gasFee.display}
                        </TextOverflow>
                      </Stack>
                    </Inline>

                    <Stack space="12px">
                      <TextOverflow
                        maxWidth={TEXT_OVERFLOW_WIDTH}
                        align="right"
                        color="label"
                        size="14pt"
                        weight="semibold"
                      >
                        {gasFeeParamsBySpeed[speed].display}
                      </TextOverflow>
                      <TextOverflow
                        maxWidth={TEXT_OVERFLOW_WIDTH}
                        align="right"
                        color="label"
                        size="11pt"
                        weight="semibold"
                      >
                        {gasFeeParamsBySpeed[speed].estimatedTime.display}
                      </TextOverflow>
                    </Stack>
                  </Inline>
                </Box>
                {i !== speeds.length - 1 && (
                  <Box paddingHorizontal="20px">
                    <Separator color="separatorTertiary" />
                  </Box>
                )}
              </>
            ))}
          </Stack>

          <Box paddingTop="20px">
            <Columns alignHorizontal="justify" space="12px">
              <Column>
                <Button
                  width="full"
                  color="fillSecondary"
                  height="44px"
                  variant="flat"
                  onClick={closeCustomGasSheet}
                >
                  <Text color="labelSecondary" size="16pt" weight="bold">
                    {i18n.t('custom_gas.cancel')}
                  </Text>
                </Button>
              </Column>
              <Column>
                <Button
                  width="full"
                  color="accent"
                  height="44px"
                  variant="flat"
                  onClick={setCustomGas}
                >
                  <Text color="label" size="16pt" weight="bold">
                    {i18n.t('custom_gas.set')}
                  </Text>
                </Button>
              </Column>
            </Columns>
          </Box>
        </Box>
      </Box>
    </Prompt>
  );
};
