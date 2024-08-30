import { type ParsedValue, AppType } from '../types.js';

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

const virtualChildren = new WeakMap<ParsedValue, ParsedValue>();

export function setVirtualChild(from: ParsedValue, to: ParsedValue) {
  virtualChildren.set(from, to);
}

export function iterateValue(
  pv: ParsedValue,
): { value: ParsedValue; key: string | number | undefined }[] {
  if ('value' in pv) {
    const v = virtualChildren.get(pv);
    if (v) {
      return [{ value: v, key: undefined }];
    }

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
