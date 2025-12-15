import { useForm, useStore } from '@tanstack/react-form';
import { useCallback, useEffect, useMemo } from 'react';

import { i18n } from '~/core/languages';
import { useNetworkStore } from '~/core/state/networks/networks';
import { usePopupInstanceStore } from '~/core/state/popupInstances';
import { Box, Button, Inline, Stack, Text } from '~/design-system';
import { Form } from '~/entries/popup/components/Form/Form';
import { FormInput } from '~/entries/popup/components/Form/FormInput';
import { triggerToast } from '~/entries/popup/components/Toast/Toast';
import { WarningBanner } from '~/entries/popup/components/WarningBanner';
import { useRainbowNavigate } from '~/entries/popup/hooks/useRainbowNavigate';
import { ROUTES } from '~/entries/popup/urls';

import { Checkbox } from '../../../components/Checkbox/Checkbox';

import {
  NewNetworkFormValues,
  buildChainObject,
  newNetworkSchema,
  useRpcValidation,
} from './shared';

export function NewNetworkForm() {
  const navigate = useRainbowNavigate();

  const addCustomChain = useNetworkStore((state) => state.addCustomChain);
  const getChain = useNetworkStore((state) => state.getChain);

  const { customNetworkDrafts, saveCustomNetworkDraft } =
    usePopupInstanceStore();
  const savedDraft = customNetworkDrafts['new'];

  const form = useForm({
    defaultValues: {
      name: savedDraft?.name ?? '',
      rpcUrl: '',
      symbol: savedDraft?.symbol ?? '',
      explorerUrl: savedDraft?.explorerUrl ?? '',
      testnet: savedDraft?.testnet ?? false,
      active: true,
    } as NewNetworkFormValues,
    validators: {
      onChange: newNetworkSchema,
    },
    onSubmit: async ({ value }) => {
      const chainId = chainMetadata?.chainId;
      if (!chainId) return;

      const chain = buildChainObject({
        chainId,
        name: value.name,
        symbol: value.symbol,
        rpcUrl: value.rpcUrl,
        explorerUrl: value.explorerUrl,
        testnet: value.testnet,
      });

      addCustomChain(chainId, chain, value.rpcUrl, value.active);
      triggerToast({
        title: i18n.t('settings.networks.custom_rpc.network_added'),
        description: i18n.t(
          'settings.networks.custom_rpc.network_added_correctly',
          { networkName: value.name },
        ),
      });

      // Clear draft
      saveCustomNetworkDraft('new', {});

      // Go back 2 levels: NewNetworkForm → List → Networks
      navigate(-2);
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

  // Check if the RPC's chainId matches an existing network
  const existingNetwork = useMemo(() => {
    if (!chainMetadata?.chainId) return null;
    return getChain(chainMetadata.chainId);
  }, [chainMetadata?.chainId, getChain]);

  // Save draft on form changes
  useEffect(() => {
    const unsubscribe = form.store.subscribe(() => {
      const values = form.store.state.values;
      saveCustomNetworkDraft('new', {
        name: values.name,
        symbol: values.symbol,
        explorerUrl: values.explorerUrl,
        testnet: values.testnet,
      });
    });
    return unsubscribe;
  }, [form.store, saveCustomNetworkDraft]);

  // Navigate to RPCs page with pending RPC when user wants to add to existing network
  const handleAddRpcToExistingNetwork = useCallback(() => {
    if (!existingNetwork) return;

    // Replace current page with RPCs, include pending RPC info
    navigate(ROUTES.SETTINGS__NETWORKS__RPCS, {
      state: {
        chainId: existingNetwork.id,
        pendingRpc: { rpcUrl: form.store.state.values.rpcUrl },
      },
      replace: true,
    });
  }, [existingNetwork, navigate, form.store.state.values.rpcUrl]);

  const formCanSubmit = useStore(form.store, (state) => state.canSubmit);
  const canSubmit =
    formCanSubmit && !existingNetwork && !!chainMetadata?.chainId;

  return (
    <Box paddingHorizontal="20px">
      <Stack space="20px">
        <Form>
          <form.Field name="name">
            {(field) => (
              <FormInput
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder={i18n.t(
                  'settings.networks.custom_rpc.network_name',
                )}
                value={field.state.value}
                borderColor={
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                    ? 'red'
                    : 'transparent'
                }
                spellCheck={false}
                tabIndex={1}
                testId="network-name-field"
              />
            )}
          </form.Field>

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
                  chainMetadataIsError
                    ? 'red'
                    : 'transparent'
                }
                loading={chainMetadataIsFetching}
                spellCheck={false}
                tabIndex={2}
                testId="custom-network-rpc-url"
              />
            )}
          </form.Field>

          <form.Field name="symbol">
            {(field) => (
              <FormInput
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder={i18n.t('settings.networks.custom_rpc.symbol')}
                value={field.state.value}
                borderColor={
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                    ? 'red'
                    : 'transparent'
                }
                spellCheck={false}
                tabIndex={3}
                testId="custom-network-symbol"
              />
            )}
          </form.Field>

          <form.Field name="explorerUrl">
            {(field) => (
              <FormInput
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder={i18n.t(
                  'settings.networks.custom_rpc.block_explorer_url',
                )}
                value={field.state.value}
                borderColor={
                  field.state.meta.isTouched &&
                  field.state.meta.errors.length > 0
                    ? 'red'
                    : 'transparent'
                }
                spellCheck={false}
                tabIndex={4}
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

          <form.Field name="testnet">
            {(field) => (
              <Box padding="10px">
                <Inline alignHorizontal="justify" alignVertical="center">
                  <Text
                    align="center"
                    weight="semibold"
                    size="12pt"
                    color="labelSecondary"
                  >
                    {i18n.t('settings.networks.custom_rpc.testnet')}
                  </Text>
                  <Checkbox
                    testId="testnet-toggle"
                    borderColor="accent"
                    onClick={() => field.handleChange(!field.state.value)}
                    selected={field.state.value}
                  />
                </Inline>
              </Box>
            )}
          </form.Field>

          {existingNetwork && (
            <WarningBanner
              message={i18n.t(
                'settings.networks.custom_rpc.network_already_exists',
                { networkName: existingNetwork.name },
              )}
              action={{
                label: i18n.t('settings.networks.custom_rpc.add_rpc_instead'),
                onClick: handleAddRpcToExistingNetwork,
              }}
              color="orange"
            />
          )}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => {
              const isDisabled = !canSubmit || isSubmitting;
              return (
                <Inline alignHorizontal="right">
                  <Button
                    onClick={() => form.handleSubmit()}
                    color={isDisabled ? 'labelQuaternary' : 'accent'}
                    height="36px"
                    tabIndex={6}
                    variant={isDisabled ? 'disabled' : 'raised'}
                    width="full"
                    testId="add-custom-network-button"
                    disabled={isDisabled}
                  >
                    {i18n.t('settings.networks.custom_rpc.add_network')}
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
