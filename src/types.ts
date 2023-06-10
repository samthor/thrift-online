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

/**
 * Type and value pair read from Thrift.
 */
export type ParsedValue =
  | {
      type: AppType.STRUCT;
      fields: ParsedFieldValue[];
    }
  | {
      type: AppType.LIST | AppType.SET;
      etype?: AppType;
      items: ParsedValue[];
    }
  | {
      type: AppType.MAP;
      ktype?: AppType;
      vtype?: AppType;
      entries: { key: ParsedValue; value: ParsedValue }[];
    }
  | {
      type: AppType.BOOL;
      value: boolean;
    }
  | {
      type: AppType.BYTES | AppType.UUID;
      value: Uint8Array;
    }
  | {
      type: AppType.BYTE | AppType.I08 | AppType.I16 | AppType.I32 | AppType.I64 | AppType.DOUBLE;
      value: number;
    }
  | {
      // should never really happen
      type: AppType.VOID;
      value: undefined;
    };

/**
 * The type of fields in {@link AppType.STRUCT}, as they have a varint field id.
 */
export type ParsedFieldValue = { fid: number } & ParsedValue;


const inverse = new Map<AppType, string>();

Object.entries(AppType).forEach(([name, type]) => {
  inverse.set(type as AppType, name);
});

export function lookupType(type?: AppType): string {
  return type && inverse.get(type) || '?';
}
