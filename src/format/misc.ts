import { base64ToBytes } from 'thorish';

export function convertToBuffer(raw: string): Uint8Array | undefined {
  raw = raw.trim().replaceAll('-', '/').replaceAll('_', '+').replace(/=*$/, '');

  try {
    return base64ToBytes(raw);
  } catch (e) {
    // ignore
  }

  // try parsing hex
  // TODO

  const x = [];
  x.flat();
}
