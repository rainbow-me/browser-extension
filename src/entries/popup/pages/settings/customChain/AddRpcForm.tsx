import { useForm, useStore } from '@tanstack/react-form';
import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { Chain } from 'viem';

import { i18n } from '~/core/languages';
import { useNetworkStore } from '~/core/state/networks/networks';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Form } from '~/entries/popup/components/Form/Form';
import { FormInput } from '~/entries/popup/components/Form/FormInput';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { Checkbox } from '../../../components/Checkbox/Checkbox';

import {
  AddRpcFormValues,
  addRpcSchema,
  buildChainObject,
  useRpcValidation,
} from './shared';

export function AddRpcForm() {
  const {
    state: { chain, networkName, rpcUrl: initialRpcUrl },
  }: { state: { chain: Chain; networkName?: string; rpcUrl?: string } } =
    useLocation();
  const navigate = useRainbowNavigate();

  const addCustomChain = useNetworkStore((state) => state.addCustomChain);

  const form = useForm({
    defaultValues: {
      rpcUrl: initialRpcUrl ?? '',
      active: true,
    } as AddRpcFormValues,
    validators: {
      onChange: addRpcSchema,
    },
    onSubmit: async ({ value }) => {
      const chainObj = buildChainObject({
        chainId: chain.id,
        name: chain.name,
        symbol: chain.nativeCurrency.symbol,
        rpcUrl: value.rpcUrl,
        explorerUrl: chain.blockExplorers?.default?.url,
        testnet: chain.testnet,
      });

      addCustomChain(chain.id, chainObj, value.rpcUrl, value.active);
      triggerToast({
        title: i18n.t('settings.networks.custom_rpc.network_added'),
        description: i18n.t(
          'settings.networks.custom_rpc.network_added_correctly',
          { networkName: chain.name },
        ),
      });

      // If we came from redirect flow (has initialRpcUrl), navigate explicitly to RPCs
      // If we came from direct "Add RPC" button, just go back
      if (initialRpcUrl) {
        navigate(ROUTES.SETTINGS__NETWORKS__RPCS, {
          state: { chainId: chain.id },
          replace: true,
        });
      } else {
        navigate(-1);
      }
    },
  });

  const rpcUrl = useStore(form.store, (state) => state.values.rpcUrl);

  const {
    data: chainMetadata,
    isFetching: chainMetadataIsFetching,
    isError: chainMetadataIsError,
  } = useRpcValidation(rpcUrl);

  // Show toast on RPC error
  useEffect(() => {
    if (chainMetadataIsError) {
      triggerToast({
        title: i18n.t('settings.networks.custom_rpc.cant_connect'),
        description: i18n.t('settings.networks.custom_rpc.rpc_not_responding'),
      });
    }
  }, [chainMetadataIsError]);

  // Validate that the RPC chainId matches the expected chain
  const isChainIdMismatch =
    chainMetadata?.chainId && chainMetadata.chainId !== chain.id;

  useEffect(() => {
    if (isChainIdMismatch) {
      triggerToast({
        title: i18n.t('settings.networks.custom_rpc.cant_connect'),
        description: i18n.t('settings.networks.custom_rpc.chain_id_mismatch', {
          chainId: chainMetadata?.chainId,
          networkName: chain.name,
        }),
      });
    }
  }, [isChainIdMismatch, chainMetadata?.chainId, chain.name]);

  const formCanSubmit = useStore(form.store, (state) => state.canSubmit);
  const canSubmit =
    formCanSubmit && !!chainMetadata?.chainId && !isChainIdMismatch;

  return (
    <Box paddingHorizontal="20px">
      <Stack space="20px">
        <Form>
          <form.Field name="rpcUrl">
            {(field) => (
              <FormInput
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder={i18n.t('settings.networks.custom_rpc.rpc_url')}
                value={field.state.value}
                borderColor={
                  (field.state.meta.isTouched &&
                    field.state.meta.errors.length > 0) ||
                  chainMetadataIsError ||
                  isChainIdMismatch
                    ? 'red'
                    : 'transparent'
                }
                loading={chainMetadataIsFetching}
                spellCheck={false}
                tabIndex={1}
                testId="custom-network-rpc-url"
              />
            )}
          </form.Field>

          <form.Field name="active">
            {(field) => (
              <Box padding="10px">
                <Inline alignHorizontal="justify" alignVertical="center">
                  <Text
                    align="center"
                    weight="semibold"
                    size="12pt"
                    color="labelSecondary"
                  >
                    {i18n.t('settings.networks.custom_rpc.active')}
                  </Text>
                  <Checkbox
                    borderColor="accent"
                    onClick={() => field.handleChange(!field.state.value)}
                    selected={field.state.value}
                  />
                </Inline>
              </Box>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => {
              const isDisabled = !canSubmit || isSubmitting;
              return (
                <Inline alignHorizontal="right">
                  <Button
                    onClick={() => form.handleSubmit()}
                    color={isDisabled ? 'labelQuaternary' : 'accent'}
                    height="36px"
                    tabIndex={2}
                    variant={isDisabled ? 'disabled' : 'raised'}
                    width="full"
                    testId="add-rpc-button"
                    disabled={isDisabled}
                  >
                    {i18n.t('settings.networks.custom_rpc.add_network_rpc', {
                      networkName: networkName || chain?.name,
                    })}
                  </Button>
                </Inline>
              );
            }}
          </form.Subscribe>
        </Form>
      </Stack>
    </Box>
  );
}
