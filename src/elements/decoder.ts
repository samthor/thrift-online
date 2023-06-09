import { TCompactProtocolReaderBuffer } from '../lib/thrift/reader.js';
import { ThriftType } from '../lib/thrift/types.js';
import { readType } from '../reader.js';
import { AppNodeElement } from './node.js';
import { AppNestElement } from './nest.js';
import { convertToBuffer } from '../lib/source.js';

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
main {
  font-size: 13px;
  max-width: 400px;
  overflow: hidden;
}
tr > :first-child {
  padding-left: calc(var(--depth) * 0.5em);
}
table {
  border-collapse: collapse;
  width: 500px;
}
table thead th {
  font-weight: 500;
  text-align: left;
  padding: 0.5em 0;
}
table tbody th {
  font-weight: inherit;
  white-space: nowrap;
  text-align: left;
  padding: 0.5em 0;
}

:where(.type--list, .type--set) .type {
  opacity: 0.33;
}

table tbody tr {
  border-top: 1px solid #0011;
}
table tbody tr:nth-child(2n) {
  background: #0000ff08;
}

.flex {
  display: flex;
  align-items: center;
  gap: 0.5ch;
}

.chip {
  border-radius: 1000px;
  background: gray;
  color: white;
  padding: 4px 8px;
  font-size: 0.7em;
  font-weight: 400;
  display: inline-block;
  min-width: 1em;
  text-align: center;
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
    if (out.type !== ThriftType.STRUCT) {
      throw new Error(`invalid`);
    }

    const nodes = out.fields.map((x) => {
      const node = new AppNodeElement();
      node.value = x;
      node.key = x.fid;

      node.addEventListener('choice', () => {
        console.info('chose node', x);

        if (x.type === ThriftType.STRUCT) {
          const nodes = x.fields.map((x) => {
            const node = new AppNodeElement();
            node.value = x;
            node.key = x.fid;
            return node;
          });
          this.#main.setSectionCount(2);
          this.#main.setSection(1, nodes);
        } else {
          this.#main.setSectionCount(1);
        }


      });

      return node;
    });

    this.#main.setSectionCount(1);
    this.#main.setSection(0, nodes);
  }

  set value(v: string) {
    this.#setValue(v);
  }
}

customElements.define('app-decoder', AppDecoderElement);
