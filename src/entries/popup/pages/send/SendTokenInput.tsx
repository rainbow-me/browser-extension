import { motion } from 'framer-motion';
import React, {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

import { i18n } from '~/core/languages';
import { useTestnetModeStore } from '~/core/state/currentSettings/testnetMode';
import { NftSort } from '~/core/state/nfts';
import { AddressOrEth, ParsedUserAsset } from '~/core/types/assets';
import { ChainId } from '~/core/types/chains';
import { SimpleHashCollectionDetails, UniqueAsset } from '~/core/types/nfts';
import { TESTNET_MODE_BAR_HEIGHT } from '~/core/utils/dimensions';
import { handleSignificantDecimals } from '~/core/utils/numbers';
import { Bleed, Box, Inline, Stack, Symbol, Text } from '~/design-system';
import { Input } from '~/design-system/components/Input/Input';
import { TextOverflow } from '~/design-system/components/TextOverflow/TextOverflow';

import { AssetContextMenu } from '../../components/AssetContextMenu';
import { CoinIcon, NFTIcon } from '../../components/CoinIcon/CoinIcon';
import { parseNftName } from '../../components/CommandK/useSearchableNFTs';
import { DropdownInputWrapper } from '../../components/DropdownInputWrapper/DropdownInputWrapper';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '../../components/DropdownMenu/DropdownMenu';
import { CursorTooltip } from '../../components/Tooltip/CursorTooltip';
import { SortMethod } from '../../hooks/send/useSendAsset';
import { NFTCollectionSection } from '../home/NFTs/NFTCollectionSection';
import { AssetRow } from '../home/Tokens';

import { InputActionButton } from './InputActionButton';
import { RowHighlightWrapper } from './RowHighlightWrapper';

const TokenSortMenu = ({
  asset,
  setSortDropdownOpen,
  sortDropdownOpen,
  sortMethod,
  setSortMethod,
}: {
  asset: ParsedUserAsset | null;
  setSortDropdownOpen: Dispatch<SetStateAction<boolean>>;
  sortDropdownOpen: boolean;
  sortMethod: string;
  setSortMethod: (method: SortMethod) => void;
}) => {
  return (
    <DropdownMenu onOpenChange={setSortDropdownOpen} open={sortDropdownOpen}>
      <DropdownMenuTrigger
        accentColor={asset?.colors?.primary || asset?.colors?.fallback}
        asChild
      >
        <Box>
          <Inline space="4px" alignVertical="center">
            <Symbol
              symbol="arrow.up.arrow.down"
              color="labelTertiary"
              weight="semibold"
              size={14}
            />
            <Text size="14pt" weight="semibold" color="labelTertiary">
              {i18n.t('send.tokens_input.sort')}
            </Text>
          </Inline>
        </Box>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        accentColor={asset?.colors?.primary || asset?.colors?.fallback}
        marginRight="32px"
      >
        <DropdownMenuRadioGroup
          value={sortMethod}
          onValueChange={(method) => {
            setSortMethod(method as SortMethod);
          }}
        >
          <DropdownMenuRadioItem value="token" selectedValue={sortMethod}>
            <Inline space="8px" alignVertical="center">
              <Bleed vertical="4px">
                <Symbol
                  weight="semibold"
                  symbol="record.circle.fill"
                  size={18}
                  color="label"
                />
              </Bleed>

              <Text size="14pt" weight="semibold" color="label">
                {i18n.t('send.tokens_input.token_balance')}
              </Text>
            </Inline>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="chain" selectedValue={sortMethod}>
            <Inline space="8px" alignVertical="center">
              <Bleed vertical="4px">
                <Symbol
                  weight="semibold"
                  symbol="network"
                  size={18}
                  color="label"
                />
              </Bleed>

              <Text size="14pt" weight="semibold" color="label">
                {i18n.t('send.tokens_input.networks')}
              </Text>
            </Inline>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const NFTSortMenu = ({
  setSortDropdownOpen,
  sortDropdownOpen,
  sortMethod,
  setSortMethod,
}: {
  setSortDropdownOpen: Dispatch<SetStateAction<boolean>>;
  sortDropdownOpen: boolean;
  sortMethod: string;
  setSortMethod: (method: NftSort) => void;
}) => {
  return (
    <DropdownMenu onOpenChange={setSortDropdownOpen} open={sortDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Box>
          <Inline space="4px" alignVertical="center">
            <Symbol
              symbol="arrow.up.arrow.down"
              color="labelTertiary"
              weight="semibold"
              size={14}
            />
            <Text size="14pt" weight="semibold" color="labelTertiary">
              {i18n.t('send.tokens_input.sort')}
            </Text>
          </Inline>
        </Box>
      </DropdownMenuTrigger>

      <DropdownMenuContent marginRight="32px">
        <DropdownMenuRadioGroup
          value={sortMethod}
          onValueChange={(method) => {
            setSortMethod(method as NftSort);
          }}
        >
          <DropdownMenuRadioItem value="recent" selectedValue={sortMethod}>
            <Inline space="8px" alignVertical="center">
              <Bleed vertical="4px">
                <Symbol
                  weight="semibold"
                  symbol="clock"
                  size={18}
                  color="label"
                />
              </Bleed>

              <Text size="14pt" weight="semibold" color="label">
                {i18n.t('send.tokens_input.recent')}
              </Text>
            </Inline>
          </DropdownMenuRadioItem>
          <DropdownMenuRadioItem
            value="alphabetical"
            selectedValue={sortMethod}
          >
            <Inline space="8px" alignVertical="center">
              <Bleed vertical="4px">
                <Symbol
                  weight="semibold"
                  symbol="list.bullet"
                  size={18}
                  color="label"
                />
              </Bleed>

              <Text size="14pt" weight="semibold" color="label">
                {i18n.t('send.tokens_input.alphabetical')}
              </Text>
            </Inline>
          </DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface InputRefAPI {
  blur: () => void;
  focus: () => void;
}

interface SendTokenInputProps {
  asset: ParsedUserAsset | null;
  assets: ParsedUserAsset[];
  selectAssetAddressAndChain: (
    address: AddressOrEth | '',
    chainId: ChainId,
  ) => void;
  nft?: UniqueAsset;
  collections?: SimpleHashCollectionDetails[];
  nftSortMethod: NftSort;
  setNftSortMethod: (sort: NftSort) => void;
  selectNft: (nft?: UniqueAsset) => void;
  dropdownClosed: boolean;
  setSortMethod: (sortMethod: SortMethod) => void;
  sortMethod: SortMethod;
  zIndex?: number;
}

export const SendTokenInput = React.forwardRef<
  InputRefAPI,
  SendTokenInputProps
>(function SendTokenInput(props, forwardedRef) {
  const {
    asset,
    assets,
    collections,
    nft,
    nftSortMethod,
    setNftSortMethod,
    selectNft,
    selectAssetAddressAndChain,
    dropdownClosed = false,
    setSortMethod,
    sortMethod,
    zIndex,
  } = props;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const [sortNFTDropdownOpen, setSortNFTDropdownOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const { testnetMode } = useTestnetModeStore();

  useImperativeHandle(forwardedRef, () => ({
    blur: () => {
      inputRef.current?.blur();
      setDropdownVisible(false);
    },
    focus: () => {
      inputRef?.current?.focus();
      setDropdownVisible(true);
    },
  }));

  const onDropdownAction = useCallback(() => {
    setDropdownVisible(!dropdownVisible);
    dropdownVisible ? inputRef?.current?.blur() : inputRef?.current?.focus();
  }, [dropdownVisible, inputRef]);

  const onSelectAsset = useCallback(
    (address: AddressOrEth | '', chainId: ChainId) => {
      selectNft();
      selectAssetAddressAndChain(address, chainId);
      setDropdownVisible(false);
    },
    [selectAssetAddressAndChain, selectNft],
  );

  const onSelectNft = useCallback(
    (nft?: UniqueAsset) => {
      selectNft(nft);
      selectAssetAddressAndChain('', ChainId.mainnet);
      setDropdownVisible(false);
    },
    [selectAssetAddressAndChain, selectNft],
  );

  const onInputValueChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setInputValue(e.target.value);
    },
    [setInputValue],
  );

  const filteredAssets = useMemo(() => {
    return inputValue
      ? assets.filter(
          ({ name, symbol, address }) =>
            name.toLowerCase().startsWith(inputValue.toLowerCase()) ||
            symbol.toLowerCase().startsWith(inputValue.toLowerCase()) ||
            address.toLowerCase().startsWith(inputValue.toLowerCase()),
        )
      : assets;
  }, [assets, inputValue]);

  const filteredCollections = useMemo(() => {
    return collections?.reduce((res, currentCollection) => {
      const val = inputValue.toLowerCase();
      const match = currentCollection.collection_details.name
        .toLowerCase()
        .includes(val);
      if (match) {
        return [...res, currentCollection];
      }
      return res;
    }, [] as SimpleHashCollectionDetails[]);
  }, [inputValue, collections]);

  const onCloseDropdown = useCallback(() => {
    onSelectAsset('', ChainId.mainnet);
    onSelectNft();
    setTimeout(() => {
      inputRef?.current?.focus();
      onDropdownAction();
    }, 200);
  }, [inputRef, onSelectAsset, onSelectNft, onDropdownAction]);

  const selectAsset = useCallback(
    (address: AddressOrEth | '', chainId: ChainId) => {
      onSelectAsset(address, chainId);
      setInputValue('');
    },
    [onSelectAsset],
  );

  useEffect(() => {
    if (dropdownClosed) {
      setDropdownVisible(false);
    }
  }, [dropdownClosed]);

  const inputVisible = useMemo(() => !asset && !nft, [asset, nft]);
  const onFocusTokenInput = useCallback(() => {
    if (!dropdownVisible) {
      onDropdownAction();
    }
  }, [dropdownVisible, onDropdownAction]);

  const inputActionButton = (
    <InputActionButton
      showClose={!!asset || !!nft}
      onClose={onCloseDropdown}
      onDropdownAction={onDropdownAction}
      dropdownVisible={dropdownVisible}
      testId={`input-wrapper-close-${'token-input'}`}
    />
  );

  const CenterComponent = useMemo(() => {
    if (inputVisible) {
      return (
        <Box as={motion.div} layout="position">
          <Input
            testId="token-input"
            value={inputValue}
            placeholder={'Token'}
            onChange={onInputValueChange}
            height="32px"
            variant="transparent"
            style={{ paddingLeft: 0, paddingRight: 0 }}
            innerRef={inputRef}
            tabIndex={0}
            onFocus={onFocusTokenInput}
          />
        </Box>
      );
    } else if (asset) {
      return (
        <Stack space="8px">
          <TextOverflow
            size="16pt"
            weight="semibold"
            color={`${asset ? 'label' : 'labelTertiary'}`}
          >
            {asset?.name ?? i18n.t('send.input_token_placeholder')}
          </TextOverflow>

          {asset && (
            <Text as="p" size="12pt" weight="semibold" color="labelTertiary">
              {handleSignificantDecimals(
                asset?.balance.amount,
                asset?.decimals,
              )}{' '}
              {i18n.t('send.tokens_input.available')}
            </Text>
          )}
        </Stack>
      );
    } else if (nft) {
      return (
        <Stack space="8px">
          <TextOverflow size="16pt" weight="semibold" color={'label'}>
            {parseNftName(nft?.name, nft?.id)}
          </TextOverflow>

          <TextOverflow
            as="p"
            size="12pt"
            weight="semibold"
            color="labelTertiary"
            maxWidth={240}
          >
            {`${nft.collection.name} #${nft.id}`}
          </TextOverflow>
        </Stack>
      );
    }

    return null;
  }, [
    asset,
    nft,
    inputValue,
    inputVisible,
    onFocusTokenInput,
    onInputValueChange,
  ]);

  return (
    <DropdownInputWrapper
      zIndex={zIndex || 1}
      dropdownHeight={376 - (testnetMode ? TESTNET_MODE_BAR_HEIGHT : 0)}
      testId={'token-input'}
      leftComponent={
        nft ? (
          <NFTIcon asset={nft} size={36} badge={true} />
        ) : (
          <AssetContextMenu asset={asset}>
            <CoinIcon asset={asset ?? undefined} />
          </AssetContextMenu>
        )
      }
      centerComponent={<Box width="full">{CenterComponent}</Box>}
      rightComponent={
        asset ? (
          <CursorTooltip
            align="end"
            arrowAlignment="right"
            arrowCentered
            text={i18n.t('tooltip.clear_token')}
            textWeight="bold"
            textSize="12pt"
            textColor="labelSecondary"
            arrowDirection={'up'}
          >
            {inputActionButton}
          </CursorTooltip>
        ) : (
          inputActionButton
        )
      }
      dropdownComponent={
        <Box>
          {!!filteredAssets?.length && (
            <Stack space="8px">
              <Box paddingHorizontal="20px">
                <Inline alignHorizontal="justify">
                  <Inline space="4px" alignVertical="center">
                    <Symbol
                      symbol="circlebadge.2.fill"
                      color="labelTertiary"
                      weight="semibold"
                      size={14}
                    />
                    <Text size="14pt" weight="semibold" color="labelTertiary">
                      {i18n.t('send.tokens_input.tokens')}
                    </Text>
                  </Inline>
                  <TokenSortMenu
                    asset={asset}
                    setSortDropdownOpen={setSortDropdownOpen}
                    sortDropdownOpen={sortDropdownOpen}
                    sortMethod={sortMethod}
                    setSortMethod={setSortMethod}
                  />
                </Inline>
              </Box>
              <Box>
                {filteredAssets?.map((asset, i) => (
                  <Box
                    paddingHorizontal="8px"
                    key={`${asset?.uniqueId}-${i}`}
                    onClick={() => selectAsset(asset.address, asset.chainId)}
                    testId={`token-input-asset-${asset?.uniqueId}`}
                  >
                    <RowHighlightWrapper>
                      <Box marginHorizontal="-8px">
                        <AssetRow asset={asset} />
                      </Box>
                    </RowHighlightWrapper>
                  </Box>
                ))}
              </Box>
            </Stack>
          )}
          <Box>
            {!!filteredCollections?.length && (
              <Stack space="8px">
                <Box paddingHorizontal="20px" paddingTop="20px">
                  <Inline alignHorizontal="justify">
                    <Inline space="4px" alignVertical="center">
                      <Symbol
                        symbol="circlebadge.2.fill"
                        color="labelTertiary"
                        weight="semibold"
                        size={14}
                      />
                      <Text size="14pt" weight="semibold" color="labelTertiary">
                        {i18n.t('send.tokens_input.nfts')}
                      </Text>
                    </Inline>
                    <NFTSortMenu
                      setSortDropdownOpen={setSortNFTDropdownOpen}
                      sortDropdownOpen={sortNFTDropdownOpen}
                      sortMethod={nftSortMethod}
                      setSortMethod={setNftSortMethod}
                    />
                  </Inline>
                </Box>
                <Box paddingTop="12px" paddingHorizontal="8px">
                  {filteredCollections?.map((collection) => {
                    return (
                      <NFTCollectionSection
                        displayMode="list"
                        key={collection.collection_id}
                        onAssetClick={(nft) => onSelectNft(nft)}
                        collection={collection}
                        isLast={false}
                      />
                    );
                  })}
                </Box>
              </Stack>
            )}
            {!filteredCollections?.length && (
              <Box alignItems="center" style={{ paddingTop: 119 }}>
                <Box paddingHorizontal="44px">
                  <Stack space="16px">
                    <Text
                      color="label"
                      size="26pt"
                      weight="bold"
                      align="center"
                    >
                      {'👻'}
                    </Text>

                    <Text
                      color="labelTertiary"
                      size="20pt"
                      weight="semibold"
                      align="center"
                    >
                      {i18n.t('send.tokens_input.nothing_found')}
                    </Text>
                  </Stack>
                </Box>
              </Box>
            )}
          </Box>
        </Box>
      }
      dropdownVisible={dropdownVisible}
      borderVisible={!asset}
    />
  );
});
