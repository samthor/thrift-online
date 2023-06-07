import { ThriftType } from './lib/thrift/types.js';

const inverse = new Map<ThriftType, string>();

Object.entries(ThriftType).forEach(([name, type]) => {
  inverse.set(type as ThriftType, name);
});

export function lookupType(type: ThriftType): string {
  return inverse.get(type) ?? '?';
}
