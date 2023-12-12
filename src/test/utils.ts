import { ParsedAsset, ParsedUserAsset, UniqueId } from '~/core/types/assets';
import { ChainId, ChainName } from '~/core/types/chains';
import { UniqueAsset } from '~/core/types/nfts';

export const TEST_ADDRESS_1 = '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266';
export const TEST_PK_1 =
  '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80';
export const TEST_ADDRESS_2 = '0x70997970c51812dc3a010c7d01b50e0d17dc79c8';
export const TEST_PK_2 =
  '0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d';
export const TEST_ADDRESS_3 = '0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc';
export const TEST_PK_3 =
  '0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a';

export const RAINBOW_WALLET_ADDRESS =
  '0x7a3d05c70581bd345fe117c06e45f9669205384f';

export const ETH_MAINNET_ASSET = {
  address: 'eth',
  balance: { amount: '10000', display: '10,000.00 ETH' },
  chainId: 1,
  chainName: 'mainnet' as ChainName,
  colors: { primary: '#808088', fallback: '#E8EAF5' },
  decimals: 18,
  icon_url: '',
  isNativeAsset: true,
  mainnetAddress: undefined,
  name: 'Ethereum',
  native: {
    balance: { amount: '16341800', display: '$16,341,800.00' },
    price: { change: '0.15%', amount: 1634.18, display: '$1,634.18' },
  },
  price: {
    value: 1634.18,
    relative_change_24h: 0.14646492502099484,
  },
  symbol: 'ETH',
  uniqueId: 'eth_1',
} satisfies ParsedUserAsset;

export const DAI_MAINNET_ASSET = {
  address: '0x6b175474e89094c44da98b954eedeac495271d0f',
  balance: { amount: '0', display: '0 DAI' },
  chainId: 1,
  chainName: 'mainnet' as ChainName,
  colors: { primary: '#808088', fallback: '#E8EAF5' },
  decimals: 18,
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633496/assets/ethereum/0x6b175474e89094c44da98b954eedeac495271d0f.png',
  isNativeAsset: false,
  mainnetAddress: undefined,
  name: 'DAI',
  native: {
    balance: { amount: '0', display: '$0' },
    price: { change: '0.15%', amount: 1634.18, display: '$1,634.18' },
  },
  price: {
    value: 1634.18,
    relative_change_24h: 0.14646492502099484,
  },
  symbol: 'DAI',
  uniqueId: '0x6b175474e89094c44da98b954eedeac495271d0f_1',
} satisfies ParsedUserAsset;

export const USDC_MAINNET_ASSET = {
  address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  balance: { amount: '0', display: '0 USDC' },
  chainId: 1,
  chainName: ChainName.mainnet,
  colors: { primary: '#2775CA' },
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633498/assets/ethereum/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.png',
  isNativeAsset: false,
  mainnetAddress: undefined,
  name: 'USD Coin',
  native: {
    balance: { amount: '0', display: '$0' },
    price: {
      amount: 1.000587633346778,
      change: '-1.34%',
      display: '$1.00',
    },
  },
  price: {
    value: 1.000587633346778,
    relative_change_24h: -1.3378856946931859,
  },
  symbol: 'USDC',
  uniqueId: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48_1' as UniqueId,
  decimals: 6,
} satisfies ParsedUserAsset;

export const OPTIMISM_MAINNET_ASSET = {
  address: '0x0000000000000000000000000000000000000000',
  balance: { amount: '10000', display: '10,000.00 ETH' },
  chainId: 10,
  chainName: 'optimism' as ChainName,
  colors: { primary: '#808088', fallback: '#E8EAF5' },
  decimals: 18,
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668565116/assets/ethereum/eth.png',
  isNativeAsset: true,
  mainnetAddress: 'eth',
  name: 'Ethereum',
  native: {
    balance: { amount: '16341800', display: '$16,341,800.00' },
    price: { change: '0.15%', amount: 1634.18, display: '$1,634.18' },
  },
  price: {
    value: 1634.18,
    relative_change_24h: 0.14646492502099484,
  },
  symbol: 'ETH',
  uniqueId: 'eth_10',
} satisfies ParsedUserAsset;

export const ENS_MAINNET_ASSET = {
  address: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
  chainId: 1,
  chainName: ChainName.mainnet,
  colors: { primary: '#6E9BF8' },
  isNativeAsset: false,
  name: 'Ethereum Name Service',
  native: {
    price: { change: '0.64%', amount: 13.984137272000002, display: '$13.98' },
  },
  price: {
    relative_change_24h: 0.6397137281285907,
    value: 13.984137272000002,
  },
  symbol: 'ENS',
  uniqueId: '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72_1',
  decimals: 18,
} satisfies ParsedAsset;

export const USDC_ARBITRUM_ASSET = {
  address: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
  chainId: ChainId.arbitrum,
  chainName: ChainName.arbitrum,
  colors: { primary: '#2775CA' },
  isNativeAsset: false,
  mainnetAddress: undefined,
  name: 'USD Coin',
  native: {
    price: {
      amount: 1.000587633346778,
      change: '-1.34%',
      display: '$1.00',
    },
  },
  price: {
    value: 1.000587633346778,
    relative_change_24h: -1.3378856946931859,
  },
  symbol: 'USDC',
  uniqueId: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8_1' as UniqueId,
  decimals: 6,
} satisfies ParsedAsset;

export const WETH_MAINNET_ASSET = {
  address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  chainId: 1,
  chainName: 'mainnet' as ChainName,
  colors: { primary: '#25292E', fallback: '#B6B6B7' },
  decimals: 18,
  icon_url:
    'https://rainbowme-res.cloudinary.com/image/upload/v1668633499/assets/ethereum/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2.png',
  isNativeAsset: false,
  mainnetAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  name: 'Wrapped Ether',
  native: {
    price: {
      change: '-4.93%',
      amount: 1996.9499999999998,
      display: '$1,996.95',
    },
  },
  price: {
    value: 1997.0000000000002,
    relative_change_24h: -4.92966127918878,
  },
  symbol: 'WETH',
  uniqueId: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2_1',
} satisfies ParsedAsset;

export const NFTS_TEST_DATA = {
  nfts: [
    {
      asset_contract: {
        address: '0x6171f829e107f70b58d67594c6b62a7d3eb7f23b',
        name: 'Rainbow World',
        schema_name: 'ERC721',
        symbol: 'RBWRLD',
        deployed_by: '0x2B70937AeaCf490b48e1973bD2A40Ba1233569f9',
      },
      background: null,
      collection: {
        description:
          'Generative. Interactive. Customizable. Enter the Character Creator to bring your Citizen to life at [https://adworld.game/create](https://adworld.game/create)',
        discord_url: 'https://discord.gg/adworld',
        external_url: 'https://adworld.game',
        image_url:
          'https://i.seadn.io/gcs/files/600f3a5b99c5c525550c907de03cd9a8.gif?auto=format&w=3840',
        name: 'Rainbow World',
        slug: 'rainbow-world-2',
        twitter_username: 'AdWorldGame',
        collection_id: '46ce3ffab75609b0af7ff4d791236d9f',
      },
      description:
        'Bring your citizen to life at [adworld.game](https://adworld.game/create)',
      external_link: null,
      familyImage:
        'https://i.seadn.io/gcs/files/600f3a5b99c5c525550c907de03cd9a8.gif?auto=format&w=3840',
      familyName: 'Rainbow World',
      fullUniqueId: 'base_0x6171f829e107f70b58d67594c6b62a7d3eb7f23b_296',
      id: '296',
      image_original_url:
        'https://storage.googleapis.com/rainbow_world/296/output_45.png',
      image_preview_url:
        'https://lh3.googleusercontent.com/ICZJsSKEfLTquCvn1o-W7wD75EdtCksjf3bMtm2IQsYdw7K8-_de9gGQBXJE09fHy33OtBBrgWqMUAfX2ve6ZsW200JnLrX-m3s=s1000',
      image_thumbnail_url:
        'https://lh3.googleusercontent.com/ICZJsSKEfLTquCvn1o-W7wD75EdtCksjf3bMtm2IQsYdw7K8-_de9gGQBXJE09fHy33OtBBrgWqMUAfX2ve6ZsW200JnLrX-m3s=s1000',
      image_url:
        'https://cdn.simplehash.com/assets/d4171c85078b61288c0367e21b9dfb608d0143faae09efc75f74ac35a83f21ee.png',
      isPoap: false,
      isSendable: true,
      lastSalePaymentToken: 'ETH',
      lowResUrl:
        'https://lh3.googleusercontent.com/ICZJsSKEfLTquCvn1o-W7wD75EdtCksjf3bMtm2IQsYdw7K8-_de9gGQBXJE09fHy33OtBBrgWqMUAfX2ve6ZsW200JnLrX-m3s=s1000',
      marketplaceCollectionUrl: 'https://opensea.io/collection/rainbow-world-2',
      marketplaceId: 'opensea',
      marketplaceName: 'OpenSea',
      name: 'Citizen 297',
      network: 'base',
      permalink:
        'https://opensea.io/assets/base/0x6171f829e107f70b58d67594c6b62a7d3eb7f23b/296',
      predominantColor: '#bc9248',
      traits: [
        {
          trait_type: 'Body',
          value: 'AlpineMiki',
          display_type: null,
        },
        {
          trait_type: 'Face',
          value: 'CoreyBarlage',
          display_type: null,
        },
        {
          trait_type: 'Gloves',
          value: 'AllNighter',
          display_type: null,
        },
        {
          trait_type: 'Bottom',
          value: 'ThornPants',
          display_type: null,
        },
        {
          trait_type: 'Shoes',
          value: 'TokiBear',
          display_type: null,
        },
        {
          trait_type: 'Top',
          value: 'BatAnthemInCMajor',
          display_type: null,
        },
        {
          trait_type: 'Background',
          value: 'RainbowFieldForever',
          display_type: null,
        },
        {
          trait_type: 'Material',
          value: 'Orange',
          display_type: null,
        },
      ],
      uniqueId: '0x6171f829e107f70b58d67594c6b62a7d3eb7f23b_296',
      urlSuffixForAsset: '0x6171f829e107f70b58d67594c6b62a7d3eb7f23b/296',
      video_url: null,
      video_properties: null,
      audio_url: null,
      audio_properties: null,
      model_url: null,
      model_properties: null,
      last_sale: {
        from_address: '0x87eDc43c1DA8294627ACc99759b27D2fbF46c52c',
        to_address: '0x5e087b61Aad29559E31565079FCdAbe384B44614',
        quantity: 1,
        quantity_string: '1',
        timestamp: '2023-09-12T02:59:17',
        transaction:
          '0x9b2294288e7b1bec133c09755a3b1fcc943d8424224b219f464d3c6c40f65d78',
        marketplace_id: 'opensea',
        marketplace_name: 'OpenSea',
        is_bundle_sale: false,
        payment_token: {
          payment_token_id: 'base.native',
          name: 'Ether',
          symbol: 'ETH',
          address: null,
          decimals: 18,
        },
        unit_price: 17900000000000000,
        total_price: 17900000000000000,
        unit_price_usd_cents: 2787,
      },
    },
    {
      asset_contract: {
        address: '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85',
        schema_name: 'ERC721',
        deployed_by: '0x4Fe4e666Be5752f1FdD210F4Ab5DE2Cc26e3E0e8',
      },
      background: null,
      collection: {
        description:
          'Ethereum Name Service (ENS) domains are secure domain names for the decentralized world. ENS domains provide a way for users to map human readable names to blockchain and non-blockchain resources, like Ethereum addresses, IPFS hashes, or website URLs. ENS domains can be bought and sold on secondary markets.',
        discord_url: null,
        external_url: 'https://ens.domains',
        image_url:
          'https://lh3.googleusercontent.com/yXNjPUCCTHyvYNarrb81ln31I6hUIaoPzlGU8kki-OohiWuqxfrIkMaOdLzcO4iGuXcvE5mgCZ-ds9tZotEJi3hdkNusheEK_w2V',
        name: 'ENS',
        slug: 'ens',
        twitter_username: 'ensdomains',
        collection_id: 'e34baafc65deb66d52d11be5d44f523e',
      },
      description: 'testmar27.eth, an ENS name.',
      external_link: 'https://app.ens.domains/name/testmar27.eth',
      familyImage:
        'https://lh3.googleusercontent.com/yXNjPUCCTHyvYNarrb81ln31I6hUIaoPzlGU8kki-OohiWuqxfrIkMaOdLzcO4iGuXcvE5mgCZ-ds9tZotEJi3hdkNusheEK_w2V',
      familyName: 'ENS',
      fullUniqueId:
        'mainnet_0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85_17627305285561126799416501961378146331191582482615029650457618209605971899862',
      id: '17627305285561126799416501961378146331191582482615029650457618209605971899862',
      image_original_url:
        'https://metadata.ens.domains/mainnet/0x57f1887a8BF19b14fC0dF6Fd9B2acc9Af147eA85/0x26f8b383da3c46bc50adeccd5094a701a79ccf02ce75838eb5bbb2eea17475d6/image',
      image_preview_url:
        'https://lh3.googleusercontent.com/O_dtxR4ggdzoCNEAZ89s7w5eBiu8rP5TELBQcuFZyIHc-raU2qj48LSkJmEKeN64JaGa7m9X5EFYUreCCJBlx9lXW0rgjrZUL0E=s1000',
      image_thumbnail_url:
        'https://lh3.googleusercontent.com/O_dtxR4ggdzoCNEAZ89s7w5eBiu8rP5TELBQcuFZyIHc-raU2qj48LSkJmEKeN64JaGa7m9X5EFYUreCCJBlx9lXW0rgjrZUL0E=s1000',
      image_url:
        'https://cdn.simplehash.com/assets/8329e91e6b7af8b380e19ad0315c055f54a850a20ec791ab0aa131ed4b83450b.svg',
      isPoap: false,
      isSendable: true,
      lowResUrl:
        'https://lh3.googleusercontent.com/O_dtxR4ggdzoCNEAZ89s7w5eBiu8rP5TELBQcuFZyIHc-raU2qj48LSkJmEKeN64JaGa7m9X5EFYUreCCJBlx9lXW0rgjrZUL0E=s1000',
      marketplaceCollectionUrl: 'https://opensea.io/collection/ens',
      marketplaceId: 'opensea',
      marketplaceName: 'OpenSea',
      name: 'testmar27.eth',
      network: 'mainnet',
      permalink:
        'https://opensea.io/assets/ethereum/0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/17627305285561126799416501961378146331191582482615029650457618209605971899862',
      predominantColor: '#5b99f3',
      traits: [
        {
          trait_type: 'Created Date',
          value: '1679945795000',
          display_type: 'date',
        },
        {
          trait_type: 'Length',
          value: '9',
          display_type: 'number',
        },
        {
          trait_type: 'Segment Length',
          value: '9',
          display_type: 'number',
        },
        {
          trait_type: 'Character Set',
          value: 'alphanumeric',
          display_type: 'string',
        },
        {
          trait_type: 'Registration Date',
          value: '1679945795000',
          display_type: 'date',
        },
        {
          trait_type: 'Expiration Date',
          value: '1711481795000',
          display_type: 'date',
        },
      ],
      uniqueId: 'testmar27.eth',
      urlSuffixForAsset:
        '0x57f1887a8bf19b14fc0df6fd9b2acc9af147ea85/17627305285561126799416501961378146331191582482615029650457618209605971899862',
      video_url: null,
      video_properties: null,
      audio_url: null,
      audio_properties: null,
      model_url: null,
      model_properties: null,
      last_sale: null,
    },
  ],
  nextPage: null,
} as { nfts: UniqueAsset[]; nextPage: null };

export async function delay(ms: number) {
  // eslint-disable-next-line no-promise-executor-return
  return new Promise((resolve) => setTimeout(resolve, ms));
}
