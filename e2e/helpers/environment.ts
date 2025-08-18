import browserConfig from '../browsers.json';

// Browser and OS environment types1
type Browser = 'chrome' | 'firefox';
type OS = 'mac' | 'linux';

// Platform browser and OS
export const browser: Browser = (process.env.BROWSER as Browser) || 'chrome';
export const os: OS = (process.env.OS as OS) || 'mac';

// Browser config
const config = browserConfig[os][browser];
export const browserVersion = config.version;
export const browserPath = config.path;
export const browserExtensionScheme = config.extension_scheme;
