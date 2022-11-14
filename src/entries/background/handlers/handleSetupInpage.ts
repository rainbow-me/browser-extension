import { Storage } from '~/core/storage';

export async function handleSetupInpage() {
  const shouldInject = (await Storage.get('inject')) === true;
  if (!shouldInject) return;
  chrome.scripting.registerContentScripts([
    {
      id: 'inpage',
      matches: ['file://*/*', 'http://*/*', 'https://*/*'],
      js: ['inpage.js'],
      runAt: 'document_start',
      world: 'MAIN',
    },
  ]);
}
