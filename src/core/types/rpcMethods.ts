export enum rpcMethods {
  eth_chainId = 'eth_chainId',
  eth_accounts = 'eth_accounts',
  eth_sendTransaction = 'eth_sendTransaction',
  eth_signTransaction = 'eth_signTransaction',
  personal_sign = 'personal_sign',
  eth_signTypedData = 'eth_signTypedData',
  eth_signTypedData_v3 = 'eth_signTypedData_v3',
  eth_signTypedData_v4 = 'eth_signTypedData_v4',
  eth_getCode = 'eth_getCode',
  wallet_addEthereumChain = 'wallet_addEthereumChain',
  wallet_switchEthereumChain = 'wallet_switchEthereumChain',
  eth_requestAccounts = 'eth_requestAccounts',
  eth_blockNumber = 'eth_blockNumber',
  eth_call = 'eth_call',
  eth_estimateGas = 'eth_estimateGas',
  personal_ecRecover = 'personal_ecRecover',
  eth_gasPrice = 'eth_gasPrice',
  eth_getBlockByNumber = 'eth_getBlockByNumber',
  eth_getBalance = 'eth_getBalance',
  eth_getTransactionByHash = 'eth_getTransactionByHash',
}

export type RPCMethod = keyof typeof rpcMethods | string;
