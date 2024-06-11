export const INVALID_REFERRAL_CODE_ERROR = 'INVALID_REFERRAL_CODE';
export const EXISTING_USER_ERROR = 'EXISTING_USER';

export type CATEGORY_TYPE =
  | 'rainbow-swaps'
  | 'metamask-swaps'
  | 'rainbow-bridges'
  | 'nft-collections'
  | 'historic-balance'
  | 'bonus';

export type CATEGORY_DISPLAY_TYPE = 'USD_AMOUNT' | 'NFT_COLLECTION' | 'BONUS';

export interface USER_POINTS_CATEGORY {
  data: {
    usd_amount: number;
    total_collections: number;
    owned_collections: number;
  };
  type: CATEGORY_TYPE;
  display_type: CATEGORY_DISPLAY_TYPE;
  earnings: {
    total: number;
  };
}

export interface USER_POINTS_ONBOARDING {
  earnings: {
    total: number;
  };
  categories: USER_POINTS_CATEGORY[];
}

export const POINTS_MOCK_DATA = {
  error: null,
  meta: {
    distribution: {
      next: 1718137200,
    },
    status: 'ONGOING',
    rewards: {
      total: '5652850000000000000',
    },
  },
  leaderboard: {
    stats: {
      total_users: 113645,
      total_points: 807221192,
      rank_cutoff: 750,
    },
    accounts: [
      {
        address: '0x52c717ce5a6b483a890bcdc3114ff140e679b43f',
        earnings: {
          total: 2363329,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xa7564fe6b182109f03af2d6d95c85abbe7ecb571',
        earnings: {
          total: 2224132,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x000000236c4916f5d00f9964af6c7018cf720000',
        earnings: {
          total: 2098000,
        },
        ens: 'cl0wn.eth',
        avatarURL: 'https://euc.li/cl0wn.eth',
      },
      {
        address: '0xff3edc21c7ea01ebbf24083421076f39fec9465d',
        earnings: {
          total: 2040165,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x09c41efc1c7e2c2a11bb153ef39affeaff2cedcd',
        earnings: {
          total: 1711635,
        },
        ens: 'jianan.eth',
        avatarURL:
          'https://lh3.googleusercontent.com/GGLNV9OpdGa1OsEV76Yhk0l9wad1cxpzlVNzeoWd0yTfToAt2YtECZ9qbIWZHzccxvy2TfCjy7dUs0SkmwC0tqzGbFlsO0TV_Q',
      },
      {
        address: '0x81ba93b26bce8ca5d649b6607df15e6d45462d8f',
        earnings: {
          total: 1406554,
        },
        ens: 'bravonaver.eth',
        avatarURL:
          'https://lh3.googleusercontent.com/XDYQn-xzMrJaXDjwYvU4PY8J5ilNkeKTAgabqCu-GQvsbUQhiyBn1RsVJK183NZb7rUbEJB6x7sz-kuc7A0fOge0SnC50ttBmjfp',
      },
      {
        address: '0x657143820ee59b5f0da0de12bd199674178777cd',
        earnings: {
          total: 1335724,
        },
        ens: 'ionspired.eth',
        avatarURL: 'https://euc.li/ionspired.eth',
      },
      {
        address: '0xd0057c59a091eec3c825ff73f7065020baee3680',
        earnings: {
          total: 1274103,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x6888e153ccf88d9e98dc24e1e9c3b99a58558fad',
        earnings: {
          total: 1132422,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x1718cbbb004d7efcb7855b0da7bb9e3d4c999566',
        earnings: {
          total: 1074501,
        },
        ens: 'dreamcorp.eth',
        avatarURL:
          'https://lh3.googleusercontent.com/fU8gh5-DddvNuW1DMw-xZSQxu7eh---YfASVSU5hyLV7vVeiehGVGe9XfvkTo9W-8HsqNujEbrd2y4avQTbJu0cJ-0kIE9OrkpU',
      },
      {
        address: '0xdb0937f8a4242360c2e989f139e105917ac7458b',
        earnings: {
          total: 1054225,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xce8a6e74bd865b238b4a9545ceb150a0007721d2',
        earnings: {
          total: 1046788,
        },
        ens: 'storyai.eth',
        avatarURL:
          'https://lh3.googleusercontent.com/yqfU_F39ijd_Afsq_J1HifhsyiXCY6-hGei4WBaMa4Be20wCSRE7IihzmyzjHS6m4mX8raSFwjYVZ5bgMmmUrJs56h2tot09Xg',
      },
      {
        address: '0x14e4bbedbd5e50defd20ced827cf375938ae003a',
        earnings: {
          total: 1039619,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xc99c3bedd99c8923a0f0b3a3b0a9dfe2d352288a',
        earnings: {
          total: 1002114,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x380e5b655d459a0cfa6fa2dfbbe586bf40dcfd7f',
        earnings: {
          total: 942999,
        },
        ens: 'quantized.eth',
        avatarURL:
          'https://lh3.googleusercontent.com/Zb_aR74rnjvR00WUWxp--KrTH5KvhWdidPeTV_N8SndwgxdCXcID2s4SV09DsCe3LmGzIsFITVi_g_tEFfJVdj0zZpCeX0kg2g',
      },
      {
        address: '0x762d625e42db0ceab060ffd16543181090276653',
        earnings: {
          total: 935345,
        },
        ens: '0458.eth',
        avatarURL: '',
      },
      {
        address: '0x7714e66394882e96ee3f97298334d05466ac3831',
        earnings: {
          total: 932733,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x8724915826d3c8e475064ecf5aab65a70af4b985',
        earnings: {
          total: 903142,
        },
        ens: 'unappeasable.eth',
        avatarURL: '',
      },
      {
        address: '0x974745335b2b716bdc66a1ddce373ccff1d1a58e',
        earnings: {
          total: 900837,
        },
        ens: 'metafluffies.eth',
        avatarURL:
          'https://ipfs.io/ipfs/bafkreicxcjfae5yquvdydo4zallwybe2jd4zkl4albmnyrnk2cql6t4tk4',
      },
      {
        address: '0xec28220ab6d26d5945ff90fe172637d4f4ff2e23',
        earnings: {
          total: 898677,
        },
        ens: 'newstuffold.eth',
        avatarURL: '',
      },
      {
        address: '0x51523910f2d67f9ff5bce6423188ff57be6eb722',
        earnings: {
          total: 898488,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x271d8e39108990e89de0aef49275a194269b58c5',
        earnings: {
          total: 860698,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xbd09ad7784b988cdf8227695b4c576a4a9de9658',
        earnings: {
          total: 829844,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x44684f94dbed38894f3d6c469ed7913af3b8e0c0',
        earnings: {
          total: 825169,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x3679e7c37fe48243f4cd41c0c0ae78828840d366',
        earnings: {
          total: 817797,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x1b381b31b932947d1a2a9c9153fd3f8d6af67dd4',
        earnings: {
          total: 816750,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xbfed92a0a4a4731d8160f272f210fd349d4893cb',
        earnings: {
          total: 811501,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xeef697ac272b913ce523f1364253f90c8a8c005f',
        earnings: {
          total: 788171,
        },
        ens: 'pogych.eth',
        avatarURL:
          'https://lh3.googleusercontent.com/OMaZioYUqTHRyQRtBk3-aZi1i-M9eyG8vALHiCdmhEFEwsLDiInzvCIPgwWc1Ho5JnTUCPc9EARM50JAgEbzd-gHA9HRjb02v1o',
      },
      {
        address: '0xbbbc35dfac3a00a03a8fde3540eca4f0e15c5e64',
        earnings: {
          total: 779152,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x59ce70c8fe74ab5e8ae34edca1767cdc1434152d',
        earnings: {
          total: 778017,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x4076dc883750f40484298e8a300bf1e50d031787',
        earnings: {
          total: 725585,
        },
        ens: 'cyberpapi.eth',
        avatarURL:
          'https://rainbow.mypinata.cloud/ipfs/QmeCJFNead7pihAyNFHnr2FC3cLcw7f73BAtfSBHsPBrGb',
      },
      {
        address: '0x2d85d096737a1655c46495255db01e1b937f29c5',
        earnings: {
          total: 704578,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x696b8158f2a1474e29875d127502b7d3f30730a6',
        earnings: {
          total: 696041,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x9be0871ed7fb016028e92aabc4a652dab60b1626',
        earnings: {
          total: 691777,
        },
        ens: 'blockchain-institute.eth',
        avatarURL:
          'https://lh3.googleusercontent.com/FF5fGm0ITwGbwwIFst7w-XIbj1_z_2xFq76WGlegRrfvzNT9O6sUIL7oMrjqT3zGYn8XkGxN3mykeEt8zXCtt0K9bdM7E8Rk1A',
      },
      {
        address: '0x794e1431a250172bfdbb2f5930095fd531859d67',
        earnings: {
          total: 669548,
        },
        ens: 'jhamar.eth',
        avatarURL:
          'https://lh3.googleusercontent.com/gMwxdpn3Zg3JDLGWLSTWl7Tq5pDysjrVVEaN_C23snNIsRtZlRZG3fYGXU87y217d0A2SXC089AAo5LoSg1OtLH1SL_Oab1z4Q',
      },
      {
        address: '0xb29372607ba364b13d937e9854ace285ca34a9ea',
        earnings: {
          total: 662720,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x3ae15da69ea798a538061e70decc83bbdcfc9314',
        earnings: {
          total: 644219,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xc02624affa30299fa164e7176a37610835a923a7',
        earnings: {
          total: 626789,
        },
        ens: 'jeffscottward.eth',
        avatarURL: '',
      },
      {
        address: '0x49a7936cf4ae66c1596005999bd772b06c0763fb',
        earnings: {
          total: 622821,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x537f3d84d0708cec8f2e0ad464745f6b2e216fd4',
        earnings: {
          total: 619519,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xd778731093289566ebf037dfc7b04d91230b8513',
        earnings: {
          total: 619105,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xa6bc1579fc0debeccfd9c09ed58e46b486e6deaf',
        earnings: {
          total: 606374,
        },
        ens: 'polkadoters.eth',
        avatarURL: '',
      },
      {
        address: '0x64171c5ae2848cec2cd92dde571f12a363f0b916',
        earnings: {
          total: 604391,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x242ce8b13b34ff3a110fdabff9392e5816d040d0',
        earnings: {
          total: 602488,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x8f7f6e924b83f38489a0967a7dc55b95372187e2',
        earnings: {
          total: 596524,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xc3048079040c993818021e955b62102094cd4d03',
        earnings: {
          total: 566045,
        },
        ens: 'syedshah.eth',
        avatarURL:
          'https://lh3.googleusercontent.com/9k_9fxsVo0WNMd3MgXqnaMZJHnc1-IiQNajyAfBNZOsR2o0L-NQaL--Hz1C0qa4B1BRzbMKG3KAZNvjfgHG2hfv38hB3GE05Pg',
      },
      {
        address: '0x46242b3f4e10d6901b9cc317b99c6403a77dcb34',
        earnings: {
          total: 565481,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x60808732c46928b183b89f2fcc9bd3206eba140f',
        earnings: {
          total: 552919,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x95f6915a3839c284bac794a85032555aa0b56226',
        earnings: {
          total: 543109,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x91ff632b7d0f59c1383e00d6287f9a0a6c3243f0',
        earnings: {
          total: 541179,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x8dc6e6682b56e8792543103aa0892be12a7c7dd7',
        earnings: {
          total: 527423,
        },
        ens: 'dominostra.eth',
        avatarURL: '',
      },
      {
        address: '0xe837c3ba79b1e4e2fd69ec747b0e7231b1dc2591',
        earnings: {
          total: 517907,
        },
        ens: 'nupdoong.eth',
        avatarURL: '',
      },
      {
        address: '0x3ef8a3cfb11bcc8911fc8124554c8f18a453f2d4',
        earnings: {
          total: 513790,
        },
        ens: 'shithappens.eth',
        avatarURL: 'https://euc.li/shithappens.eth',
      },
      {
        address: '0x4b3382abb9ff228ea8c0f57f90b03d22538e496a',
        earnings: {
          total: 512943,
        },
        ens: '✨🔴w🔴✨.eth',
        avatarURL: '',
      },
      {
        address: '0xf4f2c62770c398008171e76a559e1eaebf6151a9',
        earnings: {
          total: 510534,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x5b8ce4b3e7a74befbbad1954f9a2f1c1257ea84a',
        earnings: {
          total: 508924,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xc027a5b987227d06838b6e4fddfbd1fbd993aa04',
        earnings: {
          total: 499618,
        },
        ens: 'jor4di8.eth',
        avatarURL: '',
      },
      {
        address: '0xa9087f06fd2e11836193882cd9c3bc9b5c8453e3',
        earnings: {
          total: 497424,
        },
        ens: 'irrestrainable.eth',
        avatarURL: '',
      },
      {
        address: '0x2c4b47668ea298ef4ef98956774ea590e130cefa',
        earnings: {
          total: 488709,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xbe8fe12b9eb1ca2a593e6c070c71c294b6fe9f00',
        earnings: {
          total: 474909,
        },
        ens: 'poseidon.eth',
        avatarURL: '',
      },
      {
        address: '0x81eb4a92d31be8223e04c0d2c6428f15686ebeac',
        earnings: {
          total: 465118,
        },
        ens: 'testingens.eth',
        avatarURL: '',
      },
      {
        address: '0xf578b20020678ea4d5ee3700a03e7da6eacc6303',
        earnings: {
          total: 462555,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x493e9e927724c354ea2b1f53f8750e98e9df3933',
        earnings: {
          total: 458127,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x3ec6732676db7996c1b34e64b0503f941025cb63',
        earnings: {
          total: 456963,
        },
        ens: 'elizab.eth',
        avatarURL:
          'https://lh3.googleusercontent.com/DCG9Zd8PQxVDtk7gaFwDrKBFLpHUdIq9xzADkxCcUjI60NJCp6DWZlVnHvKx9TiMMtrG4nlQxVeUUgaL2tyX0AgpYtq6N3RLRg',
      },
      {
        address: '0x107cd74419dfc9ff01975e652597c5a4b6706460',
        earnings: {
          total: 446666,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x02c29a0c85a0f899ac7e86e286ae3590be8ad1e2',
        earnings: {
          total: 446419,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xa9f65a8a1829f68607e4223f349545861216543c',
        earnings: {
          total: 446058,
        },
        ens: 'freemejankari.eth',
        avatarURL: '',
      },
      {
        address: '0x3e2daba02b8b09879ed9b517bf4603a3dd9c410f',
        earnings: {
          total: 443504,
        },
        ens: '1723.eth',
        avatarURL:
          'https://ipfs.decentralized-content.com/ipfs/bafkreifdu7jngup24cfch6q6myiaznxpc5kfkvsvcu2rv6okn5ivfwb3le',
      },
      {
        address: '0x05df1b811133f90ab1112203d561e908061eda04',
        earnings: {
          total: 443478,
        },
        ens: 'magicmeme.eth',
        avatarURL: '',
      },
      {
        address: '0xa937f63ba1d69fd7e022fd50628b6d8fcfbde52d',
        earnings: {
          total: 441624,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xbe525d35a9270c199bc8d08e5beb403c221f18e5',
        earnings: {
          total: 439746,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x23613e0594e5929371162bd3ed02040d46bb549a',
        earnings: {
          total: 437884,
        },
        ens: 'ionterested.eth',
        avatarURL: 'https://euc.li/ionterested.eth',
      },
      {
        address: '0xc03d7825d2b3ec9d73d581802ab49301c4ebb4d5',
        earnings: {
          total: 435302,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x9b2cf71aacf0e7192d17e1a0d8fdd942f0b6402e',
        earnings: {
          total: 424278,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x7b23e38fbd0e677a1d1f72fe29a1aea9fd83ade8',
        earnings: {
          total: 418784,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x8fc54e3d572012099f3f48369657d58f653e92e4',
        earnings: {
          total: 418528,
        },
        ens: 'timmboslice.eth',
        avatarURL:
          'https://rainbow.mypinata.cloud/ipfs/QmcT6hvqkhSxb1DHgQb2URTDhUoCwgaizatoPua99Y97JV',
      },
      {
        address: '0x0e2149e503eac0936f2880915a5f8a9936f6bd14',
        earnings: {
          total: 415410,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x49379efae465c8d420357142477c09386cc1e764',
        earnings: {
          total: 413302,
        },
        ens: 'trysomecorn.eth',
        avatarURL: '',
      },
      {
        address: '0x63f42bfc17b6ff3a7f487c406b8e006d0d4970c3',
        earnings: {
          total: 413031,
        },
        ens: '🐹🐹🐹🐹.eth',
        avatarURL: '',
      },
      {
        address: '0xe4b70143ece236abc5644d79d67e2498a9e9a740',
        earnings: {
          total: 412515,
        },
        ens: 'x7575.eth',
        avatarURL: '',
      },
      {
        address: '0xb2bc05a1c1344a5344796a9282cafddcd2cfc67a',
        earnings: {
          total: 404484,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xf51c3c054afa0c8042a46c3e53a5ec542e96e4f4',
        earnings: {
          total: 400676,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xa7335b93acef9a799e4c2a8dc559292f222d055c',
        earnings: {
          total: 399426,
        },
        ens: 'yoann.eth',
        avatarURL:
          'https://rainbow.mypinata.cloud/ipfs/QmYsQ4uZGqssYjqRTg8HD8dxe3Jh8xvBhQYsnp4Vfmyx96',
      },
      {
        address: '0x89808c49f858b86e80b892506cf11606fb25fcdc',
        earnings: {
          total: 397416,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xc53197e821fd28708c0d5a73e00df3167f4e6c85',
        earnings: {
          total: 390614,
        },
        ens: 'mrhammn.eth',
        avatarURL: '',
      },
      {
        address: '0x39cf3fed04caccfc22f790c1d0a2331c4438e73f',
        earnings: {
          total: 375232,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x7aa335dd4b35a47e4ac23e6b9201893665c3c12d',
        earnings: {
          total: 373526,
        },
        ens: 'yieldofdreams.eth',
        avatarURL: '',
      },
      {
        address: '0xb0af2b368c51fa50117c2978390dc3fda1691a52',
        earnings: {
          total: 373352,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xce31aebc49f1604892d7c4aa7b858c2d765b6aa4',
        earnings: {
          total: 369945,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x826d8e0a4ee2107b5639be1b36eb7a214d33bc47',
        earnings: {
          total: 353779,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x969795b513895365160bc18f0861760add9dc3ee',
        earnings: {
          total: 352713,
        },
        ens: 'lvrgd.eth',
        avatarURL: 'https://euc.li/lvrgd.eth',
      },
      {
        address: '0xcbb8cf019a716684771515e4e95ad0fa304f29da',
        earnings: {
          total: 351315,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xd89060fab2714efba71881b9b9ca08878e8e5389',
        earnings: {
          total: 351126,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x6b9b3aed32d37adba2fc5f557c1831193c5e6264',
        earnings: {
          total: 351028,
        },
        ens: '0xgenz.eth',
        avatarURL: '',
      },
      {
        address: '0x648626445a9ac8c7506b67332e4802ab18405d26',
        earnings: {
          total: 348680,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0xc6f0db27f628c23e029ee1c1013fe21b2453eff7',
        earnings: {
          total: 341940,
        },
        ens: 'fixie.eth',
        avatarURL: '',
      },
      {
        address: '0xaa13d35dbd73dbea26d00e85d105f5d2c5f55b1c',
        earnings: {
          total: 334778,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x6c4a157bdda348cd8afc93e425bc4f0aeebd745c',
        earnings: {
          total: 329644,
        },
        ens: 'mahdiali.eth',
        avatarURL: '',
      },
      {
        address: '0xd7ac0f44a74fa25e2b4aed169b324ff7020aed7f',
        earnings: {
          total: 326522,
        },
        ens: '',
        avatarURL: '',
      },
      {
        address: '0x9f8f604c0370e5d74dd9dc67cfed03e25682a912',
        earnings: {
          total: 314924,
        },
        ens: 'hamdy.eth',
        avatarURL: '',
      },
    ],
  },
  user: {
    referralCode: 'KJBNU3',
    earnings_by_type: [
      {
        type: 'referral',
        earnings: {
          total: 0,
        },
      },
      {
        type: 'retroactive',
        earnings: {
          total: 6840,
        },
      },
      {
        type: 'transaction',
        earnings: {
          total: 204,
        },
      },
      {
        type: 'redemption',
        earnings: {
          total: 0,
        },
      },
    ],
    earnings: {
      total: 7044,
    },
    rewards: {
      total: '50000000000000',
      claimable: '50000000000000',
      claimed: '0',
    },
    stats: {
      position: {
        unranked: false,
        current: 17905,
      },
      referral: {
        total_referees: 0,
        qualified_referees: 0,
      },
      last_airdrop: {
        position: {
          unranked: false,
          current: 17831,
        },
        earnings: {
          total: 7044,
        },
        differences: [
          {
            type: 'retroactive',
            group_id: 'general',
            earnings: {
              total: 0,
            },
          },
          {
            type: 'transaction',
            group_id: 'general',
            earnings: {
              total: 0,
            },
          },
        ],
      },
      last_period: {
        position: {
          unranked: true,
          current: -1,
        },
        earnings: {
          total: 0,
        },
      },
    },
  },
};

export const CLAIM_MOCK_DATA = {
  claimUserRewards: {
    error: null,
    chainID: 10,
    uoHash:
      '0x0edba9b7e5abb9a48db607fa66f6ff60aa1b342ef728c028782e6215b986e01e',
    txHash:
      '0x73b0f5615698f0e2f34628267940a4fabcb17c44ff9da4b99b6c493dfca52e57',
  },
};

export const CLAIM_MOCK_DATA_WITH_ERROR = {
  claimUserRewards: {
    error: {
      type: 'ALREADY_CLAIMED',
      message: 'user already claimed',
    },
    chainID: 0,
    uoHash: '',
    txHash: '',
  },
};
