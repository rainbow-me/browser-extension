import { Address } from 'viem';

export const HARDWARE_WALLETS = {
  MOCK_ACCOUNT: {
    accountsToImport: [
      {
        address: '0x2419EB3D5E048f50D386f6217Cd5033eBfc36b83' as Address,
        index: 0,
      },
      {
        address: '0x37bD75826582532373D738F83b913C97447b0906' as Address,
        index: 1,
      },
    ],
    deviceId: 'lol',
    accountsEnabled: 2,
  },
};
