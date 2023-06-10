export enum AppType {
  STRUCT = 1, // with numeric fieldId
  LIST,
  SET,
  MAP,
  OBJECT, // string keys

  // primitive types
  BOOL,
  BYTE, // could be called U08
  I08,
  I16,
  I32,
  I64,
  DOUBLE,
  NUMBER, // broad "number" when unknown

  BYTES,
  UUID, // 16-byte thingo

  VOID,
}

const inverse = new Map<AppType, string>();

Object.entries(AppType).forEach(([name, type]) => {
  inverse.set(type as AppType, name);
});

export function lookupType(type?: AppType): string {
  return type && inverse.get(type) || '?';
}
