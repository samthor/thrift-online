import type { TCompactProtocolReader } from '../lib/thrift/reader.js';
import { ThriftType } from '../lib/thrift/types.js';
import { AppType, ParsedFieldValue, ParsedValue } from '../types.js';

/**
 * Read a known type from the {@link TCompactProtocolReader}. Thrift types typically start with
 * {@link ThriftType.STRUCT}. Recursive, reads whole object.
 */
export function readThrift(r: TCompactProtocolReader, type: ThriftType): ParsedValue {
  switch (type) {
    case ThriftType.BOOL:
      return { type: AppType.BOOL, value: r.readBool() };

    case ThriftType.BYTE:
      return { type: AppType.BYTE, value: r.readByte() };

    case ThriftType.I16:
      return { type: AppType.I16, value: r.readI16() };

    case ThriftType.I32:
      return { type: AppType.I32, value: r.readI32() };

    case ThriftType.I64:
      return { type: AppType.I64, value: r.readI64() };

    case ThriftType.DOUBLE:
      return { type: AppType.DOUBLE, value: r.readDouble() };

    case ThriftType.BYTES:
      return { type: AppType.BYTES, value: r.readBinary() };

    case ThriftType.UUID:
      return { type: AppType.UUID, value: r.readUuid() };

    case ThriftType.STRUCT: {
      r.readStructBegin();
      const fields: ParsedFieldValue[] = [];

      for (;;) {
        const f = r.readFieldBegin();
        if (f.ftype === 0) {
          break;
        }

        const value = readThrift(r, f.ftype);
        fields.push({ fid: f.fid, ...value });
      }

      r.readStructEnd();
      return { type: AppType.STRUCT, fields };
    }

    case ThriftType.SET:
    case ThriftType.LIST: {
      const items: ParsedValue[] = [];

      const info = r.readListBegin();
      for (let i = 0; i < info.size; ++i) {
        items.push(readThrift(r, info.etype));
      }
      r.readListEnd();
      return {
        items,
        type: type === ThriftType.SET ? AppType.SET : AppType.LIST,
        etype: fromThriftType(info.etype),
      };
    }

    case ThriftType.MAP: {
      const entries: { key: ParsedValue; value: ParsedValue }[] = [];

      const info = r.readMapBegin();
      for (let i = 0; i < info.size; ++i) {
        const key = readThrift(r, info.ktype);
        const value = readThrift(r, info.vtype);
        entries.push({ key, value });
      }

      return {
        entries,
        ktype: fromThriftType(info.ktype),
        vtype: fromThriftType(info.vtype),
        type: AppType.MAP,
      };
    }
  }

  r.skip(type);
  return { type: AppType.VOID, value: undefined };
}

function fromThriftType(t: ThriftType): AppType {
  return thriftToAppType.get(t)!;
}

const thriftToAppType = new Map<ThriftType, AppType>([
  [ThriftType.BOOL, AppType.BOOL],
  [ThriftType.BYTE, AppType.BYTE],
  [ThriftType.BYTES, AppType.BYTES],
  [ThriftType.DOUBLE, AppType.DOUBLE],
  [ThriftType.I16, AppType.I16],
  [ThriftType.I32, AppType.I32],
  [ThriftType.I64, AppType.I64],
  [ThriftType.LIST, AppType.LIST],
  [ThriftType.MAP, AppType.MAP],
  [ThriftType.SET, AppType.SET],
  [ThriftType.STRUCT, AppType.STRUCT],
  [ThriftType.UUID, AppType.UUID],
]);
