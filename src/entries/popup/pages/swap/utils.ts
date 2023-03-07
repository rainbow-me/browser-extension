import { Source } from '@rainbow-me/swaps';

import Logo0x from 'static/assets/aggregators/0x.png';
import Logo1Inch from 'static/assets/aggregators/1inch.png';
import LogoRainbow from 'static/assets/aggregators/rainbow.png';
import { i18n } from '~/core/languages';

export const aggregatorInfo = {
  auto: { logo: LogoRainbow, name: i18n.t('swap.aggregators.rainbow') },
  [Source.Aggregator0x]: { logo: Logo0x, name: Source.Aggregator0x },
  [Source.Aggregotor1inch]: { logo: Logo1Inch, name: Source.Aggregotor1inch },
};
