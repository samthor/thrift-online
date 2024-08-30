import { LitElement, css, html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { AppType, ParsedValue, lookupType } from '../types.js';
import { repeat } from 'lit/directives/repeat.js';
import { convertToBuffer } from '../format/misc.js';
import { TCompactProtocolReaderBuffer } from '../lib/thrift/reader.js';
import { readThrift } from '../format/thrift.js';
import { ThriftType } from '../lib/thrift/types.js';

@customElement('app-viewer')
export class AppViewerElement extends LitElement {
  static styles = css``;

  @property()
  node: ParsedValue = { type: AppType.VOID, value: undefined };

  render() {
    const options: { label: string; action: string }[] = [];

    // TODO: we can just _check_ these and see if they work
    // only O(1) with any given value (and can "send" it here)

    if (this.node.type === AppType.BYTES) {
      options.push(
        { label: 'Read as UTF-8', action: 'parse-utf8' },
        { label: 'Parse as Thrift Compact Protocol', action: 'parse-thrift' },
      );
    }

    if (this.node.type === AppType.STRING) {
      options.push(
        { label: 'Decode base64', action: 'parse-base64' },
        { label: 'Parse as JSON', action: 'parse-json' },
      );
    }

    return html`<div>Element type=${lookupType(this.node.type)}</div>
      ${options.length
        ? html`
            <div>
              <select>
                ${repeat(options, (o) => html`<option value=${o.action}>${o.label}</option>`)}
              </select>
              <button @click=${this.#enact}>Enact</button>
            </div>
          `
        : ''} `;
  }

  #enact() {
    const selectElement = this.renderRoot.querySelector('select') as HTMLSelectElement;
    const option = selectElement.selectedOptions[0].value;

    let to: ParsedValue | undefined;
    try {
      to = this.#internalEnact(option);
    } catch (e) {
      console.warn('Failed to', option, e);
    }

    if (to) {
      const detail = { from: this.node, to };
      this.dispatchEvent(new CustomEvent('upgrade', { detail }));
    }
  }

  #internalEnact(option: string): ParsedValue | undefined {
    if (this.node.type === AppType.STRING) {
      let raw = this.node.value;

      switch (option) {
        case 'parse-base64': {
          const out = convertToBuffer(raw);
          if (!out) {
            throw new Error(`could not convert`);
          }
          return { type: AppType.BYTES, value: out };
        }
        case 'parse-json': {
          const out = JSON.parse(raw);
          return { type: AppType.STRING, value: out };
        }
      }
    } else if (this.node.type === AppType.BYTES) {
      let raw = this.node.value;

      switch (option) {
        case 'parse-thrift': {
          const reader = new TCompactProtocolReaderBuffer(raw, 0);
          return readThrift(reader, ThriftType.STRUCT);
        }
        case 'parse-utf8': {
          const td = new TextDecoder('utf-8');
          const out = td.decode(raw);
          return { type: AppType.STRING, value: out };
        }
      }
    }
  }
}

// actions that should be possible:
// .. if string or bytes:
//     - create derived "other type" => base64 decode, gzip decode, read as JSON/thrift/etc

// protobuf fixups:
// .. if bytes:
//     - read as repeated list of things (varint, i32, i64)
// .. if a non-list field property:
//     - mark as repeated & indicate is "a list"
// .. if number or similar:
//     - read as zigzag instead
