import { i18n } from '~/core/languages';
import { RAINBOW_LEARN_URL } from '~/core/references/links';
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

  // FIXME: https://linear.app/rainbow/issue/BACK-1452/provide-locale-copy-from-the-backendnetworks-for-explainers-so-that-we
  const specificChains = {
    [ChainId.polygon]: 'polygon',
    [ChainId.bsc]: 'bsc',
    [ChainId.avalanche]: 'avalanche',
    [ChainId.blast]: 'blast',
    [ChainId.degen]: 'degen',
    [ChainId.apechain]: 'apechain',
    [ChainId.sanko]: 'sanko',
    [ChainId.gravity]: 'gravity',
    [ChainId.berachain]: 'berachain',
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
        url: `${RAINBOW_LEARN_URL}/layer-2-and-layer-3-networks`,
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
      url: `${RAINBOW_LEARN_URL}/layer-2-and-layer-3-networks`,
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
