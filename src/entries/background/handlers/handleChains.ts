import { fetchBackendChains } from '~/core/resources/chains/backendChains';

export async function handleChains() {
  const backendChains = await fetchBackendChains({ hash: 'backend' });
  console.log('-- backendChains', backendChains);
}
