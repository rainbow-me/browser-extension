export class Storage {
  static set(key: string, value: unknown) {
    return new Promise<void>((resolve) => {
      chrome.storage.local.set({ [key]: value }, function () {
        resolve();
      });
    });
  }

  static get(key: string) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, function (result) {
        resolve(result[key]);
      });
    });
  }

  static remove(key: string) {
    return new Promise<void>((resolve) => {
      chrome.storage.local.remove(key, function () {
        resolve();
      });
    });
  }
}
