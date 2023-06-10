import { TCompactProtocolReaderBuffer } from '../lib/thrift/reader.js';
import { ThriftType } from '../lib/thrift/types.js';
import { ParsedValue, readType } from '../reader.js';
import { AppNestElement } from './nest.js';
import { convertToBuffer } from '../lib/source.js';
import { AppType } from '../typemap.js';

export class AppDecoderElement extends HTMLElement {
  #main: AppNestElement;
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
</style>
<label>
  <span>Offset</span>
  <input type="number" value="0" />
</label>
<textarea></textarea>
<app-nest></app-nest>
`;

    const inputElement = root.querySelector('textarea')!;
    const offsetElement = root.querySelector('input')!;

    const nestElement = root.querySelector('app-nest') as AppNestElement;
    this.#main = nestElement;

    const update = () => {
      this.#rerender(inputElement.value, offsetElement.valueAsNumber);
    };

    this.#setValue = (v: string) => {
      inputElement.value = v;
      update();
    };

    inputElement.addEventListener('change', update);
    offsetElement.addEventListener('change', update);
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
    const out = readType(reader, ThriftType.STRUCT);

    // TODO: proxy for "master list"
    const listItem: ParsedValue = {
      type: AppType.LIST,
      items: [out],
    };
    this.#main.root = listItem;
  }

  set value(v: string) {
    this.#setValue(v);
  }
}

customElements.define('app-decoder', AppDecoderElement);
