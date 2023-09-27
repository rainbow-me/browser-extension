import React, {
  ChangeEvent,
  ReactElement,
  useCallback,
  useEffect,
  useImperativeHandle,
  useState,
} from 'react';

import { i18n } from '~/core/languages';
import { ParsedSearchAsset } from '~/core/types/assets';
import { Box } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { SwapInputMask } from '~/entries/popup/components/InputMask/SwapInputMask/SwapInputMask';
import { CursorTooltip } from '~/entries/popup/components/Tooltip/CursorTooltip';
import usePrevious from '~/entries/popup/hooks/usePrevious';

import { CoinIcon } from '../../../components/CoinIcon/CoinIcon';
import { DropdownInputWrapper } from '../../../components/DropdownInputWrapper/DropdownInputWrapper';
import { SwapInputActionButton } from '../SwapInputActionButton';

const SwapInputMaskWrapper = ({
  inputDisabled,
  children,
}: {
  inputDisabled?: boolean;
  children: ReactElement;
}) => {
  return inputDisabled ? (
    <CursorTooltip
      text={i18n.t('swap.tokens_input.output_quotes_disabled')}
      textWeight="semibold"
      textSize="12pt"
      textColor="labelSecondary"
    >
      {children}
    </CursorTooltip>
  ) : (
    children
  );
};

interface TokenInputProps {
  accentCaretColor?: boolean;
  asset: ParsedSearchAsset | null;
  assetFilter: string;
  dropdownHeight?: number;
  dropdownComponent: ReactElement;
  bottomComponent: ReactElement | null;
  placeholder: string;
  zIndex?: number;
  dropdownClosed: boolean;
  variant: 'surface' | 'bordered' | 'transparent' | 'tinted';
  inputRef: React.RefObject<HTMLInputElement>;
  inputDisabled?: boolean;
  value: string;
  testId: string;
  openDropdownOnMount?: boolean;
  onDropdownOpen: (open: boolean) => void;
  selectAsset: (asset: ParsedSearchAsset | null) => void;
  setOnSelectAsset: (cb: (asset: ParsedSearchAsset | null) => void) => void;
  setAssetFilter: React.Dispatch<React.SetStateAction<string>>;
  setValue: (value: string) => void;
  onFocus?: () => void;
}

export const TokenInput = React.forwardRef<
  { openDropdown: () => void },
  TokenInputProps
>(
  (
    {
      accentCaretColor,
      asset,
      assetFilter,
      dropdownHeight,
      dropdownComponent,
      bottomComponent,
      placeholder,
      zIndex,
      dropdownClosed,
      variant,
      inputRef,
      inputDisabled,
      value,
      testId,
      openDropdownOnMount,
      onDropdownOpen,
      selectAsset,
      setOnSelectAsset,
      setAssetFilter,
      setValue,
      onFocus,
    }: TokenInputProps,
    forwardedRef,
  ) => {
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const prevDropdownVisible = usePrevious(dropdownVisible);

    useImperativeHandle(forwardedRef, () => ({
      openDropdown: () => {
        onDropdownOpen(true);
        setDropdownVisible(true);
      },
    }));

    const onDropdownAction = useCallback(() => {
      onDropdownOpen(!dropdownVisible);
      setDropdownVisible(!dropdownVisible);
      dropdownVisible ? inputRef?.current?.blur() : inputRef?.current?.focus();
    }, [dropdownVisible, inputRef, onDropdownOpen]);

    const onSelectAsset = useCallback(() => {
      onDropdownOpen(false);
      setDropdownVisible(false);
      setAssetFilter('');
      setTimeout(() => inputRef?.current?.focus(), 300);
    }, [inputRef, onDropdownOpen, setAssetFilter]);

    const onClose = useCallback(() => {
      selectAsset(null);
      onDropdownOpen(!dropdownVisible);
      setDropdownVisible(!dropdownVisible);
      dropdownVisible ? inputRef?.current?.blur() : inputRef?.current?.focus();
    }, [dropdownVisible, inputRef, onDropdownOpen, selectAsset]);

    const onInputValueChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        setAssetFilter(e.target.value);
      },
      [setAssetFilter],
    );

    useEffect(() => {
      if (dropdownClosed) {
        setDropdownVisible(false);
      }
    }, [dropdownClosed]);

    useEffect(() => {
      if (prevDropdownVisible !== dropdownVisible && dropdownVisible) {
        setTimeout(() => inputRef?.current?.focus(), 100);
      }
    });

    useEffect(() => {
      setOnSelectAsset(onSelectAsset);
    }, [onSelectAsset, setOnSelectAsset]);

    useEffect(() => {
      if (openDropdownOnMount) {
        onDropdownAction();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [openDropdownOnMount]);

    const onFocusTokenInput = useCallback(() => {
      if (!dropdownVisible) {
        onDropdownAction();
      }
      onFocus?.();
    }, [dropdownVisible, onDropdownAction, onFocus]);

    return (
      <DropdownInputWrapper
        zIndex={zIndex || 1}
        dropdownHeight={dropdownHeight || 376}
        testId={`${testId}-token-input`}
        leftComponent={
          <Box>
            <CoinIcon asset={asset ?? undefined} />
          </Box>
        }
        centerComponent={
          !asset ? (
            <Box>
              <Input
                testId={`${testId}-search-token-input`}
                value={assetFilter}
                placeholder={placeholder}
                onChange={onInputValueChange}
                height="32px"
                variant="transparent"
                style={{ paddingLeft: 0, paddingRight: 0 }}
                innerRef={inputRef}
                onFocus={onFocusTokenInput}
                tabIndex={0}
              />
            </Box>
          ) : (
            <Box>
              <SwapInputMaskWrapper inputDisabled={inputDisabled}>
                <Box marginVertical="-20px">
                  <SwapInputMask
                    testId={`${testId}-swap-token-input`}
                    accentCaretColor={accentCaretColor}
                    borderColor="transparent"
                    decimals={asset?.decimals}
                    height="56px"
                    placeholder="0.00"
                    value={value}
                    variant={variant}
                    onChange={setValue}
                    paddingHorizontal={0}
                    innerRef={inputRef}
                    disabled={inputDisabled}
                  />
                </Box>
              </SwapInputMaskWrapper>
            </Box>
          )
        }
        bottomComponent={bottomComponent}
        rightComponent={
          <SwapInputActionButton
            showClose={!!asset}
            onClose={onClose}
            onDropdownAction={onDropdownAction}
            dropdownVisible={dropdownVisible}
            testId={testId}
            asset={asset}
          />
        }
        dropdownComponent={dropdownComponent}
        dropdownVisible={dropdownVisible}
        borderVisible
      />
    );
  },
);

TokenInput.displayName = 'TokenInput';
