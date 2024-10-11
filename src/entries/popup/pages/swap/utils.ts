import { Source, configureSDK } from '@rainbow-me/swaps';

import Logo0x from 'static/assets/aggregators/0x.png';
import Logo1Inch from 'static/assets/aggregators/1inch.png';
import LogoRainbow from 'static/assets/aggregators/rainbow.png';
import { i18n } from '~/core/languages';

const IS_TESTING = process.env.IS_TESTING === 'true';

IS_TESTING && configureSDK({ apiBaseUrl: 'http://127.0.0.1:3001' });

export const aggregatorInfo = {
  auto: { logo: LogoRainbow, name: i18n.t('swap.aggregators.rainbow') },
  [Source.Aggregator0x]: { logo: Logo0x, name: Source.Aggregator0x },
  [Source.Aggregator1inch]: { logo: Logo1Inch, name: Source.Aggregator1inch },
};
