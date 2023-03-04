export const isValidUrl = (url?: string) => {
  try {
    if (url) {
      const urlObject = new URL(url ?? '');
      if (urlObject.protocol === 'http:' || urlObject.protocol === 'https:')
        return true;
    }
  } catch (e) {
    //
  }
  return false;
};
