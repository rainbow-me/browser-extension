import { i18n } from '~/core/languages';
import { ChainId } from '~/core/types/chains';
import { chainNameFromChainId } from '~/core/utils/chains';

import { ChainBadge } from './ChainBadge/ChainBadge';
import {
  ExplainerSheet,
  ExplainerSheetProps,
} from './ExplainerSheet/ExplainerSheet';

type SideChain = Exclude<
  ChainId,
  ChainId.mainnet | ChainId.goerli | ChainId.hardhat | ChainId.hardhatOptimism
>;
export const isSideChain = (chainId: ChainId): chainId is SideChain =>
  [
    ChainId.arbitrum,
    ChainId.polygon,
    ChainId.optimism,
    ChainId.bsc,
    ChainId.avalanche,
  ].includes(chainId);

export const getSideChainExplainerParams = (
  chainId: SideChain,
  onDismiss: VoidFunction,
) => {
  const chainName = chainNameFromChainId(chainId);
  return {
    title: i18n.t(`explainers.sidechains.${chainName}.title`),
    description: [
      i18n.t(`explainers.sidechains.${chainName}.description_1`),
      i18n.t(`explainers.sidechains.${chainName}.description_2`),
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
