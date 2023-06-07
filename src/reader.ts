import type { TCompactProtocolReader } from './lib/thrift/reader.js';
import { ThriftType } from './lib/thrift/types.js';

export type ParsedValue =
  | {
      type: ThriftType.STRUCT;
      fields: ParsedFieldValue[];
    }
  | {
      type: ThriftType.LIST | ThriftType.SET;
      etype: ThriftType;
      items: ParsedValue[];
    }
  | {
      type: ThriftType.MAP;
      ktype: ThriftType;
      vtype: ThriftType;
      entries: { key: ParsedValue; value: ParsedValue }[];
    }
  | {
      type: ThriftType.BOOL;
      value: boolean;
    }
  | {
      type: ThriftType.BYTES | ThriftType.UUID;
      value: Uint8Array;
    }
  | {
      type: ThriftType.I08 | ThriftType.I16 | ThriftType.I32 | ThriftType.I64 | ThriftType.DOUBLE;
      value: number;
    }
  | {
      // should never really happen
      type: ThriftType.STOP | ThriftType.VOID;
      value: undefined;
    };

export type ParsedFieldValue = { fid: number } & ParsedValue;

export function readStruct(r: TCompactProtocolReader): ParsedValue {
  return readType(r, ThriftType.STRUCT);
}

export function readType(r: TCompactProtocolReader, type: ThriftType): ParsedValue {
  switch (type) {
    case ThriftType.BOOL:
      return { type, value: r.readBool() };

    case ThriftType.BYTE:
      return { type, value: r.readByte() };

    case ThriftType.I16:
      return { type, value: r.readI16() };

    case ThriftType.I32:
      return { type, value: r.readI32() };

    case ThriftType.I64:
      return { type, value: r.readI64() };

    case ThriftType.DOUBLE:
      return { type, value: r.readDouble() };

    case ThriftType.BYTES:
      return { type, value: r.readBinary() };

    case ThriftType.UUID:
      return { type, value: r.readUuid() };

    case ThriftType.STRUCT: {
      r.readStructBegin();
      const fields: ParsedFieldValue[] = [];

      for (;;) {
        const f = r.readFieldBegin();
        if (f.ftype === 0) {
          break;
        }

        const value = readType(r, f.ftype);
        fields.push({ fid: f.fid, ...value });
      }

      r.readStructEnd();
      return { type, fields };
    }

    case ThriftType.SET:
    case ThriftType.LIST: {
      const items: ParsedValue[] = [];

      const info = r.readListBegin();
      for (let i = 0; i < info.size; ++i) {
        items.push(readType(r, info.etype));
      }
      r.readListEnd();
      return { items, type, etype: info.etype };
    }

    case ThriftType.MAP: {
      const entries: { key: ParsedValue; value: ParsedValue }[] = [];

      const info = r.readMapBegin();
      for (let i = 0; i < info.size; ++i) {
        const key = readType(r, info.ktype);
        const value = readType(r, info.vtype);
        entries.push({ key, value });
      }

      return { entries, ...info, type };
    }
  }

  r.skip(type);
  return { type, value: undefined };
}
