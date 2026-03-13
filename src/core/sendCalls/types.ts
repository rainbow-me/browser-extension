export type SendCallsParams = {
  version: string;
  chainId: `0x${string}`;
  from?: `0x${string}`;
  calls: Array<{
    to?: `0x${string}`;
    data?: `0x${string}`;
    value?: `0x${string}`;
  }>;
  id?: `0x${string}`;
  atomicRequired?: boolean;
};
