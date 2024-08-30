import { AppNestElement } from './nest.js';
import { AppType, ParsedValue } from '../types.js';
import { AppViewerElement } from './viewer.js';
import { setVirtualChild } from '../lib/vmap.js';

export class AppDecoderElement extends HTMLElement {
  #main: AppNestElement;
  #setValue: (v: string) => void;

  #root: ParsedValue = {
    type: AppType.LIST,
    items: [],
  };

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
<app-viewer></app-viewer>
`;

    const inputElement = root.querySelector('textarea')!;
    const offsetElement = root.querySelector('input')!;
    const viewerElement = root.querySelector('app-viewer') as AppViewerElement;

    viewerElement.addEventListener('upgrade', (e) => {
      const ce = e as CustomEvent<{ from: ParsedValue; to: ParsedValue }>;

      setVirtualChild(ce.detail.from, ce.detail.to);
      this.#main.requestUpdate('root');
      // this.#rerender();
    });

    const nestElement = root.querySelector('app-nest') as AppNestElement;
    this.#main = nestElement;
    this.#main.root = this.#root;

    const update = () => {
      if (this.#root.type !== AppType.LIST) {
        throw '??';
      }
      this.#root.items = [
        { type: AppType.STRING, value: inputElement.value.substring(offsetElement.valueAsNumber) },
      ];
      this.#main.requestUpdate('root');
    };

    this.#setValue = (v: string) => {
      inputElement.value = v;
      update();
    };

    this.#main.addEventListener('choice', (e) => {
      const ce = e as CustomEvent<ParsedValue>;
      viewerElement.node = ce.detail;
    });

    inputElement.addEventListener('change', update);
    offsetElement.addEventListener('change', update);
  }

  set value(v: string) {
    this.#setValue(v);
  }
}

customElements.define('app-decoder', AppDecoderElement);
