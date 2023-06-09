export class AppValueElement extends HTMLElement {
  #value: number | Uint8Array | boolean | undefined;
  #render: () => void;

  constructor() {
    super();

    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
<style>
  :host {
    display: block;
  }
  main {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-family: monospace;
  }
</style>
<main></main>
    `;
    const mainEl = root.querySelector('main')!;

    this.#render = () => {
      if (this.#value instanceof Uint8Array) {
        const byteString = [...this.#value].map((v) => v.toString(16).padStart(2, '0'));
        mainEl.textContent = byteString.join(' ');
      } else if (this.#value === undefined) {
        mainEl.textContent = '';
      } else {
        mainEl.textContent = String(this.#value);
      }
    };
  }

  set value(v: number | Uint8Array | boolean | undefined) {
    this.#value = v;
    this.#render();
  }
}

customElements.define('app-value', AppValueElement);
