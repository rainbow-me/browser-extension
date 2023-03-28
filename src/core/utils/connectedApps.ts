export const getDappHost = (url: string) => {
  const host = new URL(url).host;
  if (host.indexOf('www.') === 0) {
    return host.replace('www.', '');
  }
  return host;
};

export const getDappHostname = (url: string) => {
  const urlObject = new URL(url);
  let hostname;
  const subdomains = urlObject.hostname.split('.');
  if (subdomains.length === 2) {
    hostname = urlObject.hostname;
  } else {
    hostname = `${subdomains[subdomains.length - 2]}.${
      subdomains[subdomains.length - 1]
    }`;
  }
  return hostname;
};

export const getConnectedAppIcon = (host: string) =>
  `https://icons.duckduckgo.com/ip3/${host}.ico`;
