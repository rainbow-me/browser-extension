import { Storage } from '~/core/storage';

export async function setupInpage() {
  const shouldInject = (await Storage.get('inject')) === true;
  if (!shouldInject) return;

  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('/inpage.js');
  script.onload = function () {
    console.log('rainbow inpage script injected');
    script.remove();
  };

  try {
    (document.head || document.documentElement).appendChild(script);
  } catch (e) {
    console.log('error injecting inpage', e);
  }
}
