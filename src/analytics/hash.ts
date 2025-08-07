import { hmac } from '@noble/hashes/hmac';
import { sha256 } from '@noble/hashes/sha256';
import { type Hex, bytesToHex, hexToBytes } from 'viem';

export const hmacSha256 = (keyHex: Hex, dataHex: Hex): Hex => {
  const mac = hmac(sha256, hexToBytes(keyHex), hexToBytes(dataHex));
  return bytesToHex(mac);
};
