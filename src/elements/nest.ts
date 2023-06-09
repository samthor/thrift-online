import type { AppNodeElement } from './node.js';

/**
 * Creates several horizontal columns.
 */
export class AppNestElement extends HTMLElement {
  #main: HTMLElement;

  constructor() {
    super();

    const root = this.attachShadow({ mode: 'open' });

    root.innerHTML = `
<style>
main {
  border: 1px solid #ccc;
  width: 100%;
  height: 100%;
  display: flex;
  overflow: auto;
  align-items: stretch;

  & section {
    border-right: 1px solid #ddd;
    width: 400px;
    padding: 4px;
    box-sizing: border-box;
  }
}
</style>
<main></main>
`;
    this.#main = root.querySelector('main')!;
  }

  setSectionCount(count: number) {
    while (this.#main.children.length > count) {
      this.#main.lastElementChild!.remove();
    }

    while (this.#main.children.length < count) {
      const node = document.createElement('section');
      this.#main.append(node);
    }
  }

  setSection(sec: number, nodes: AppNodeElement[]) {
    const el = this.#main.children[sec];
    el.innerHTML = '';
    el.append(...nodes);
  }
}

customElements.define('app-nest', AppNestElement);
