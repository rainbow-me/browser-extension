import {
  BACKEND_NETWORKS_QUERY,
  CUSTOM_NETWORKS_QUERY,
} from '~/core/resources/networks/queries';
import { BackendNetworks, CustomNetworks, Networks } from '~/core/types/chains';

async function fetchBackendNetworks(): Promise<BackendNetworks> {
  const response = await fetch('https://metadata.p.rainbow.me/v1/graph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: BACKEND_NETWORKS_QUERY,
      variables: { device: 'BX', includeTestnets: true },
    }),
  });

  const { data } = await response.json();
  return data;
}

async function fetchCustomNetworks(): Promise<CustomNetworks> {
  const response = await fetch('https://metadata.p.rainbow.me/v1/graph', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: CUSTOM_NETWORKS_QUERY,
      variables: { device: 'BX', includeTestnets: true },
    }),
  });

  const { data } = await response.json();
  return data;
}

export async function fetchNetworks(): Promise<Networks> {
  const [backendNetworks, customNetworks] = await Promise.all([
    fetchBackendNetworks(),
    fetchCustomNetworks(),
  ]);

  return {
    backendNetworks,
    customNetworks,
  };
}
