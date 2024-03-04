import { i18n } from '~/core/languages';
import {
  Network as APINetwork,
  PaymentMethod,
  PaymentMethodConfig,
} from '~/core/resources/f2c/types';
import { ChainId } from '~/core/types/chains';

const paymentMethodConfig: {
  [key in PaymentMethod]: PaymentMethodConfig;
} = {
  [PaymentMethod.DebitCard]: {
    name: i18n.t('buy.payment_methods.card'),
    symbol: 'creditcard',
    symbolSize: 13,
  },
  [PaymentMethod.CreditCard]: {
    name: i18n.t('buy.payment_methods.card'),
    symbol: 'creditcard',
    symbolSize: 13,
  },
  [PaymentMethod.Bank]: {
    name: i18n.t('buy.payment_methods.bank'),
    symbol: 'building.columns',
    symbolSize: 12.5,
  },
  [PaymentMethod.ApplePay]: {
    name: i18n.t('buy.payment_methods.apple_pay'),
    textIcon: '',
  },
  [PaymentMethod.GooglePay]: {
    name: i18n.t('buy.payment_methods.google_pay'),
    symbol: 'creditcard',
    symbolSize: 13,
  },
};

export function getPaymentMethodConfigs(
  paymentMethods: { type: PaymentMethod }[],
) {
  const methods: PaymentMethodConfig[] = [];
  const types = paymentMethods.map((method) => method.type);
  const debit = types.includes(PaymentMethod.DebitCard);
  const credit = types.includes(PaymentMethod.CreditCard);
  const bank = types.includes(PaymentMethod.Bank);
  const apple = types.includes(PaymentMethod.ApplePay);
  const google = types.includes(PaymentMethod.GooglePay);

  // Card first
  if (debit || credit)
    methods.push(paymentMethodConfig[PaymentMethod.DebitCard]);

  // Then bank
  if (bank) methods.push(paymentMethodConfig[PaymentMethod.Bank]);

  // And if no card, then show platform specific ones if available
  if (!(debit || credit) && (apple || google)) {
    if (apple) methods.push(paymentMethodConfig[PaymentMethod.ApplePay]);

    if (google) methods.push(paymentMethodConfig[PaymentMethod.GooglePay]);
  }

  return methods;
}

export function convertAPINetworkToChainId(
  network: APINetwork,
): ChainId | undefined {
  const networkMap = {
    [APINetwork.Ethereum]: ChainId.mainnet,
    [APINetwork.Arbitrum]: ChainId.arbitrum,
    [APINetwork.Optimism]: ChainId.optimism,
    [APINetwork.Polygon]: ChainId.polygon,
    [APINetwork.Base]: ChainId.base,
    [APINetwork.BSC]: ChainId.bsc,
    [APINetwork.Avalanche]: ChainId.avalanche,
  };

  // @ts-expect-error networkMap only accounts for supported chains
  return networkMap[network] ?? undefined;
}
