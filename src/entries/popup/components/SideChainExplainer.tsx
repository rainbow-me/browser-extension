import { i18n } from '~/core/languages';
import { ChainId, chainIdToNameMapping } from '~/core/types/chains';

import { ChainBadge } from './ChainBadge/ChainBadge';
import {
  ExplainerSheet,
  ExplainerSheetProps,
} from './ExplainerSheet/ExplainerSheet';

const excludedChains: ChainId[] = [
  ChainId.mainnet,
  ChainId.hardhat,
  ChainId.hardhatOptimism,
];

export const isSideChain = (chainId: ChainId): boolean => {
  return !excludedChains.includes(chainId);
};

export const getSideChainExplainerParams = (
  chainId: ChainId,
  onDismiss: VoidFunction,
) => {
  const chainName = chainIdToNameMapping[chainId];
  const specificChains = {
    [ChainId.polygon]: 'polygon',
    [ChainId.bsc]: 'bsc',
    [ChainId.avalanche]: 'avalanche',
    [ChainId.blast]: 'blast',
    [ChainId.degen]: 'degen',
    [ChainId.apechain]: 'apechain',
    // add new chains here with unique i18n explainer keys
  };

  const capitalizeString = (str: string) => str[0].toUpperCase() + str.slice(1);

  const chainTypeKey = specificChains[chainId];

  const basePath = chainTypeKey
    ? `explainers.sidechains.specific.${chainTypeKey}`
    : 'explainers.sidechains.layer_two';

  if (!chainName)
    return {
      title: i18n.t(`explainers.sidechains.specific.custom_network.title`),
      description: [
        i18n.t(`explainers.sidechains.specific.custom_network.description_1`),
        i18n.t(`explainers.sidechains.specific.custom_network.description_2`),
      ] as string[],
      header: { icon: <ChainBadge chainId={chainId} size="45" /> },
      linkButton: {
        url: 'https://learn.rainbow.me/a-beginners-guide-to-layer-2-networks',
        label: i18n.t(`explainers.sidechains.link_button_label`),
      },
      actionButton: {
        label: i18n.t('explainers.sidechains.action_label'),
        variant: 'tinted',
        labelColor: 'blue',
        action: onDismiss,
      },
    } as const;
  return {
    title: i18n.t(`${basePath}.title`, {
      chainName: capitalizeString(chainName),
    }),
    description: [
      i18n.t(`${basePath}.description_1`, {
        chainName: capitalizeString(chainName),
      }),
      i18n.t(`${basePath}.description_2`),
    ] as string[],
    header: { icon: <ChainBadge chainId={chainId} size="45" /> },
    linkButton: {
      url: 'https://learn.rainbow.me/a-beginners-guide-to-layer-2-networks',
      label: i18n.t(`explainers.sidechains.link_button_label`),
    },
    actionButton: {
      label: i18n.t('explainers.sidechains.action_label'),
      variant: 'tinted',
      labelColor: 'blue',
      action: onDismiss,
    },
  } as const;
};

export function SideChainExplainerSheet({
  chainId,
  onDismiss,
  ...props
}: {
  chainId: ChainId;
  onDismiss: VoidFunction;
  show: boolean;
} & Partial<ExplainerSheetProps>) {
  if (!isSideChain(chainId)) return null;
  const params = getSideChainExplainerParams(chainId, onDismiss);
  // eslint-disable-next-line react/jsx-props-no-spreading
  return <ExplainerSheet {...params} {...props} />;
}
