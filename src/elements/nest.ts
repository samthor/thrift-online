import { LitElement, css, html } from 'lit';
import { iterateValue } from '../lib/vmap.js';
import { AppType, ParsedValue } from '../types.js';
import { customElement, property } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';

const parentMap = new WeakMap<ParsedValue, ParsedValue>();

/**
 * Find the path from the selected node to the root.
 */
function pathFrom(selected: ParsedValue | undefined, root: ParsedValue) {
  const path: ParsedValue[] = [];
  while (selected !== root && selected !== undefined) {
    path.unshift(selected);
    selected = parentMap.get(selected);
  }

  if (selected === root) {
    path.unshift(root);
    return path;
  }
  return [root];
}

/**
 * Creates several horizontal columns. Renders a single item which is descended into the tree.
 */
@customElement('app-nest')
export class AppNestElement extends LitElement {
  static styles = css`
    #wrap {
      position: relative;

      & > #border {
        content: '';
        position: absolute;
        border: 1px solid red;
        border-radius: 2px;
        inset: 0;
        pointer-events: none;
      }
    }

    main {
      width: 100%;
      height: 100%;
      display: flex;
      overflow: auto;
      align-items: stretch;
      --section-width: 280px;
      border: 1px solid transparent;
      border-right: 0;
      box-sizing: border-box;

      & section {
        padding: 4px;
        box-sizing: border-box;
        border-right: 1px solid blue;
        width: var(--section-width);
        min-width: var(--section-width);
      }
    }
  `;

  @property()
  root: ParsedValue = { type: AppType.VOID, value: undefined };

  /**
   * Always show the path from selected to the root item. Assume this is root if undefined.
   */
  #selected: ParsedValue | undefined;

  #choiceHandler(ce: CustomEvent<ParsedValue>) {
    this.#selected = ce.detail;
    this.requestUpdate();
  }

  render() {
    const path = pathFrom(this.#selected, this.root);

    const sections = repeat(path, (p) => {
      const items = iterateValue(p);

      // Iterate possible choices and store for later parent check.
      // This is a lazy non-tree.
      items.forEach((i) => parentMap.set(i.value, p));

      const nodes = repeat(
        items,
        (i) => i.key,
        (i) => {
          return html`<app-node .value=${i.value} .key=${i.key}></app-node>`;
        },
      );

      return html`<section>${nodes}</section>`;
    });

    return html`
      <div id="wrap">
        <main @choice=${this.#choiceHandler}>${sections}</main>
        <div id="border"></div>
      </div>
    `;
  }

  updated() {
    const mainElement = this.renderRoot.querySelector('main')!;

    // This combo ensures the right-most is view, but then makes sure the entire prior is visible
    // (placing in center).
    const le = mainElement.lastElementChild;
    le?.scrollIntoView();
    le?.previousElementSibling?.scrollIntoView({ inline: 'center' });
  }
}
