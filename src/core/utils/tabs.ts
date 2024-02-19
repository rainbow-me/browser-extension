export const POPUP_URL = chrome.runtime.getURL('/popup.html');
export const WELCOME_URL = `${POPUP_URL}#/welcome`;
export const getProfileUrl = (address?: string) =>
  `https://rainbow.me/${address}`;
export const getExplorerUrl = (explorer: string, address?: string) =>
  `https://${explorer}/address/${address}`;
export const getTxExplorerUrl = (explorer: string, address?: string) =>
  `https://${explorer}/tx/${address}`;

export const goToNewTab = ({
  url,
  index,
  active,
}: {
  url?: string;
  index?: number;
  active?: boolean;
}) => {
  try {
    chrome.tabs.create({
      url,
      index,
      active,
    });
  } catch (e) {
    // Edge sometimes returns `Tab creation is restricted in standalone sidebar mode.
  }
};

export const isNativePopup = async () => {
  return new Promise((resolve) => {
    chrome.tabs?.getCurrent((tab) => resolve(!tab));
  });
};
