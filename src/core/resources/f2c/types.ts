import { SymbolName } from '~/design-system/styles/designTokens';

export enum FiatProviderName {
  Ramp = 'ramp',
  Coinbase = 'coinbase',
  Moonpay = 'moonpay',
}

export enum Network {
  Ethereum = 'ethereum',
  Polygon = 'polygon',
  Optimism = 'optimism',
  Arbitrum = 'arbitrum',
  Avalanche = 'avalanche',
  Base = 'base',
  BSC = 'bsc',
}

export enum PaymentMethod {
  Bank = 'bank',
  DebitCard = 'debit_card',
  CreditCard = 'credit_card',
  ApplePay = 'apple_pay',
  GooglePay = 'google_pay',
}

export enum FiatCurrency {
  EUR = 'EUR',
  GBP = 'GBP',
  USD = 'USD',
}

export enum CalloutType {
  Rate = 'rate',
  InstantAvailable = 'instant_available',
  PaymentMethods = 'payment_methods',
  Networks = 'networks',
  FiatCurrencies = 'fiat_currencies',
}

export type ProviderConfig = {
  id: FiatProviderName;
  enabled: boolean;
  metadata: {
    accentColor: string;
    accentForegroundColor: string;
    paymentMethods: { type: PaymentMethod }[];
    networks: Network[];
    instantAvailable: boolean;
    fiatCurrencies: FiatCurrency[];
  };
  content: {
    title: string;
    description: string;
    callouts: (
      | {
          type: CalloutType.Rate;
          value: string;
        }
      | {
          type: CalloutType.InstantAvailable;
          value?: string;
        }
      | {
          type: CalloutType.PaymentMethods;
          methods: { type: PaymentMethod }[];
        }
      | {
          type: CalloutType.Networks;
          networks: Network[];
        }
      | {
          type: CalloutType.FiatCurrencies;
          currencies: FiatCurrency[];
        }
    )[];
  };
};

export type PaymentMethodConfig = {
  name: string;
  textIcon?: string;
  symbol?: SymbolName;
  symbolSize?: number;
} & ({ textIcon: string } | { symbol: SymbolName; symbolSize: number });
