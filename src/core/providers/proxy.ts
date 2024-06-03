import { defaultRPC } from '../references/chains';
import { ChainId } from '../types/chains';

export const proxyRpcEndpoint = (endpoint: string, chainId: ChainId) => {
  if (
    endpoint &&
    endpoint !== 'http://127.0.0.1:8545' &&
    endpoint !== 'http://localhost:8545' &&
    !endpoint.includes('http://10.') &&
    !endpoint.includes('http://192.168') &&
    !endpoint.match(/http:\/\/172.(1[6-9]|2[0-9]|3[0-1])./)
  ) {
    if (defaultRPC[chainId] === endpoint) {
      console.log(
        'proxy 1',
        `${process.env.RPC_PROXY_BASE_URL}/${chainId}/${process.env.RPC_PROXY_API_KEY}`,
      );
      return `${process.env.RPC_PROXY_BASE_URL}/${chainId}/${process.env.RPC_PROXY_API_KEY}`;
    }
    console.log(
      'proxy 2',
      `${process.env.RPC_PROXY_BASE_URL}/${chainId}/${
        process.env.RPC_PROXY_API_KEY
      }?custom_rpc=${encodeURIComponent(endpoint)}`,
    );
    return `${process.env.RPC_PROXY_BASE_URL}/${chainId}/${
      process.env.RPC_PROXY_API_KEY
    }?custom_rpc=${encodeURIComponent(endpoint)}`;
  }
  return endpoint;
};

export const proxyBackendNetworkRpcEndpoint = (endpoint: string) => {
  return `${endpoint}${process.env.RPC_PROXY_API_KEY}`;
};
