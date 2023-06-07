import { TCompactProtocolReader, TCompactProtocolReaderBuffer } from './lib/thrift/reader.js';
import { base64ToBytes } from 'thorish';
import { lookupType } from './typemap.js';
import { ThriftType } from './lib/thrift/types.js';
import { readStruct } from './reader.js';

export class AppDecoderElement extends HTMLElement {
  #main: HTMLElement;
  #setValue: (v: string) => void;

  constructor() {
    super();

    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
<style>
textarea {
  resize: none;
  width: 100%;
  font: inherit;
}
main {
  font-family: monospace;
  white-space: pre;
}
</style>
<label>
  <span>Offset</span>
  <input type="number" value="0" />
<label>
<textarea></textarea>
<main></main>
`;

    const inputElement = root.querySelector('textarea')!;
    const offsetElement = root.querySelector('input')!;

    const update = () => {
      console.time('render');
      this.#rerender(inputElement.value, offsetElement.valueAsNumber);
      console.timeEnd('render');
    };

    this.#setValue = (v: string) => {
      inputElement.value = v;
      update();
    };

    inputElement.addEventListener('change', update);
    offsetElement.addEventListener('change', update);

    this.#main = root.querySelector('main')!;
  }

  #rerender(raw: string, offset: number) {
    this.#main.textContent = '';

    // check for formats
    let buf = convertToBuffer(raw);
    if (!buf) {
      console.warn('Could not convert');
      return;
    }

    const reader = new TCompactProtocolReaderBuffer(buf, offset);
    // this only works if we're in a field area to start with

    const out = readStruct(reader);

    if (out.type === ThriftType.DOUBLE) {
      console.info(out.value);
    }

    this.#main.textContent = JSON.stringify(out, undefined, 2);
  }

  set value(v: string) {
    this.#setValue(v);
  }
}

function convertToBuffer(raw: string): Uint8Array | undefined {
  raw = raw.trim().replaceAll('-', '/').replaceAll('_', '+').replace(/=*$/, '');

  try {
    return base64ToBytes(raw);
  } catch (e) {
    // ignore
  }

  // try parsing hex
  // TODO
}

function renderType(reader: TCompactProtocolReader, type: ThriftType) {
  const node = document.createElement('li');

  switch (type) {
    case ThriftType.STRUCT: {
    }
  }
}

customElements.define('app-decoder', AppDecoderElement);
