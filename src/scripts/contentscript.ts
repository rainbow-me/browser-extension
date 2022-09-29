import Storage from '../utils/storage';

window.addEventListener(
  'message',
  event => {
    if (event.source != window) {
      return;
    }

    if (event.data.type && event.data.type == 'TO_RAINBOW_PROVIDER') {
      // Decide if we can answer or we need to ask the bg based on the RPC method
      switch (event.data.payload.method) {
        default:
          chrome.runtime.sendMessage(event.data.payload, function (response) {
            window.postMessage(
              {
                type: 'FROM_RAINBOW_PROVIDER',
                id: event.data.id,
                payload: response,
              },
              '*'
            );
          });
      }
    }
  },
  false
);

function injectCode(src: string) {
  const script = document.createElement('script');
  script.src = src;
  script.onload = function () {
    console.log('rainbow inpage script injected');
    console.log('OKKKK');
    script.remove();
  };

  try {
    (document.head || document.documentElement).appendChild(script);
  } catch (e) {
    console.log('error injecting provider', e);
  }
}

const init = async function () {
  const shouldInject = (await Storage.get('inject')) === true;
  if (shouldInject) {
    injectCode(chrome.runtime.getURL('/provider.js'));
  }
};

init();
