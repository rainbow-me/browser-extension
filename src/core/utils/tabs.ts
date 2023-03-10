export const POPUP_URL = `chrome-extension://${chrome.runtime.id}/popup.html`;
export const WELCOME_URL = `chrome-extension://${chrome.runtime.id}/popup.html#/welcome`;
export const getProfileUrl = (address?: string) =>
  `https://rainbow.me/${address}`;
export const getExplorerUrl = (explorer: string, address?: string) =>
  `https://${explorer}/address/${address}`;

export const goToNewTab = ({
  url,
  index,
  active,
}: {
  url?: string;
  index?: number;
  active?: boolean;
}) => {
  chrome.tabs.create({
    url,
    index,
    active,
  });
};
