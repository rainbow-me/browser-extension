import { ChainId } from '../types/chains';

export const proxyRpcEndpoint = (endpoint: string, chainId: ChainId) => {
  if (
    endpoint !== 'http://127.0.0.1:8545' &&
    endpoint !== 'http://localhost:8545' &&
    !endpoint.includes('http://10.') &&
    !endpoint.includes('http://192.') &&
    !endpoint.includes('http://172.')
  ) {
    return `${process.env.RPC_PROXY_BASE_URL}/${chainId}/${
      process.env.RPC_PROXY_API_KEY
    }?custom_rpc=${encodeURIComponent(endpoint)}`;
  }
  return endpoint;
};
