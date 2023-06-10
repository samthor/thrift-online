import type { ParsedValue } from '../reader.js';
import { AppType } from '../typemap.js';

const vmap = new WeakMap<
  ParsedValue,
  {
    listeners: Set<() => void>;
  }
>();

export function registerValue(
  pv: ParsedValue,
  listener: (pv: ParsedValue) => void,
  { signal }: { signal: AbortSignal },
) {
  if (signal.aborted) {
    return;
  }

  let entry = vmap.get(pv);
  if (entry === undefined) {
    entry = { listeners: new Set() };
    vmap.set(pv, entry);
  }

  const uniqueListener = () => listener(pv);
  entry.listeners.add(uniqueListener);

  signal.addEventListener('abort', () => {
    entry?.listeners.delete(uniqueListener);
    entry = undefined;
  });
}

/**
 * Wraps up behavior of our entire data tree.
 *
 * Gives all nodes a unique numeric ID. Root node is zero.
 */
export class DataTree {
  treeFor(node: number) {
    return [];
  }
}

export function iterateValue(pv: ParsedValue) {
  if ('value' in pv) {
    return [];
  }

  switch (pv.type) {
    case AppType.LIST:
    case AppType.SET: {
      return pv.items.map((pv, i) => {
        return { value: pv, key: i };
      });
    }

    case AppType.STRUCT: {
      return pv.fields.map((pv, i) => {
        return { value: pv, key: pv.fid };
      });
    }

    case AppType.MAP:
      // TODO: map probably generates 2x values
      throw new Error(`TODO: iterate MAP`);
  }

  return [];
}
