const DEFAULT_HD_PATH = "m/44'/60'/0'/0";
const DEFAULT_LEDGER_LIVE_PATH = "m/44'/60'";
const LEGACY_LEDGER_PATH = "m/44'/60'/0'";

export const getHDPathForVendorAndType = (
  index: number,
  vendor?: 'Ledger' | 'Trezor',
  type?: 'legacy',
) => {
  switch (vendor) {
    case 'Ledger':
      switch (type) {
        case 'legacy':
          return `${LEGACY_LEDGER_PATH}/${index}`;
        default:
          return `${DEFAULT_LEDGER_LIVE_PATH}/${index}'/0/0`;
      }
    case 'Trezor':
      return `${DEFAULT_HD_PATH}/${index}`;
    default:
      return `${DEFAULT_HD_PATH}/${index}`;
  }
};
