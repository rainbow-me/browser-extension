import buildTimeNetworks from 'static/data/networks.json';
import { UserChainsState } from '~/core/state/userChains';
import { RainbowChainsState } from '~/core/state/rainbowChains';
import { RainbowChainAssetsState } from '~/core/state/rainbowChainAssets';
import { FavoritesState } from '~/core/state/favorites';

export const networks = buildTimeNetworks;
export const userChains: UserChainsState['userChains'] = {
  "1": true,
  "10": true,
  "56": true,
  "100": true,
  "137": true,
  "324": true,
  "1625": true,
  "1996": true,
  "8453": false,
  "33139": false,
  "42161": false,
  "43114": true,
  "57073": true,
  "59144": true,
  "81457": true,
  "534352": true,
  "7777777": true,
  "666666666": true
};
export const userChainsOrder: UserChainsState['userChainsOrder'] = [534352, 7777777];
export const rainbowChains: RainbowChainsState['rainbowChains'] = {};
export const rainbowChainAssets: RainbowChainAssetsState['rainbowChainAssets'] = {};
export const favorites: FavoritesState['favorites'] = {
  "1": [
      "eth",
      "0x6b175474e89094c44da98b954eedeac495271d0f",
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
      "0x23b608675a2b2fb1890d3abbd85c5775c51691d5"
  ],
  "10": [
      "0x0000000000000000000000000000000000000000",
      "0x4200000000000000000000000000000000000042",
      "0x4200000000000000000000000000000000000006",
      "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      "0x7f5c764cbc14f9669b88837ca1490cca17c31607",
      "0x68f180fcce6836688e9084f035309e29bf0a2095"
  ],
  "56": [
      "0x0000000000000000000000000000000000000000",
      "0x6b175474e89094c44da98b954eedeac495271d0f",
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  ],
  "137": [
      "0x0000000000000000000000000000000000001010",
      "0x7ceb23fd6bc0add59e62ac25578270cff1b9f619",
      "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063",
      "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
      "0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6"
  ],
  "8453": [
      "0x0000000000000000000000000000000000000000",
      "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      "0x6b175474e89094c44da98b954eedeac495271d0f",
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
  ],
  "33139": [
      "0x0000000000000000000000000000000000000000",
      "0x48b62137edfa95a428d35c09e44256a739f6b557",
      "0xcF800F4948D16F23333508191B1B1591daF70438",
      "0xA2235d059F80e176D931Ef76b6C51953Eb3fBEf4"
  ],
  "42161": [
      "0x0000000000000000000000000000000000000000",
      "0xda10009cbd5d07dd0cecc66161fc93d7c9000da1",
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8",
      "0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f",
      "0xd803b242d32d71618d0646531c0cc4a5d26d1598"
  ],
  "43114": [
      "0x0000000000000000000000000000000000000000",
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
      "0x6b175474e89094c44da98b954eedeac495271d0f",
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
      "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599"
  ],
  "57073": [
      "0x0000000000000000000000000000000000000000",
      "0x4200000000000000000000000000000000000006"
  ],
  "81457": [
      "0x0000000000000000000000000000000000000000",
      "0x4300000000000000000000000000000000000004",
      "0x4300000000000000000000000000000000000003"
  ],
  "7777777": [
      "0x0000000000000000000000000000000000000000",
      "0x4200000000000000000000000000000000000006"
  ],
  "666666666": [
      "0x0000000000000000000000000000000000000000"
  ]
}
