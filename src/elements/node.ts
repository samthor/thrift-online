import { AppType, lookupType, ParsedValue } from '../types.js';
import { AppValueElement } from './value.js';

const icons = {
  number: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M296.693-157.001q-21.384 0-33.307-15.653-11.923-15.654-7.077-36.038l27.077-108.309H191q-21 0-34.115-15.961-13.115-15.961-7.269-37.345 4.615-13.539 15.731-23.115 11.115-9.577 25.653-9.577h114.386l38-154.002H231q-21 0-34.115-15.961-13.115-15.961-7.269-37.345 4.615-13.539 15.731-23.115 11.115-9.577 25.653-9.577h134.386l31.923-128.308q4.231-13.923 15.538-22.808 11.308-8.884 25.846-8.884 21.384 0 33.307 15.653 11.923 15.654 7.077 36.038L452-642.999h138l31.923-128.308q4.231-13.923 15.538-22.808 11.308-8.884 25.846-8.884 21.384 0 33.307 15.653 11.923 15.654 7.077 36.038l-27.077 108.309H769q21 0 34.115 15.961 13.115 15.961 7.269 37.345-4.615 13.539-15.731 23.115-11.115 9.577-25.653 9.577H654.614l-38 154.002H729q21 0 34.115 15.961 13.115 15.961 7.269 37.345-4.615 13.539-15.731 23.115-11.115 9.577-25.653 9.577H594.614l-31.923 128.308q-4.231 13.923-15.538 22.808-11.308 8.884-25.846 8.884-21.384 0-33.307-15.653-11.923-15.654-7.077-36.038L508-317.001H370l-31.923 128.308q-4.231 13.923-15.538 22.808-11.308 8.884-25.846 8.884ZM392-402.999h138l38-154.002H430l-38 154.002Z"/></svg>`,
  string: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M690.077-277.001q-29.538 0-44.422-24.192-14.884-24.191-2.115-49.498l40.077-86.31h-80.618q-36.538 0-61.268-24.73-24.73-24.73-24.73-61.268v-114.002q0-36.538 24.73-61.268 24.73-24.73 61.268-24.73h114.002q36.538 0 61.268 24.73 24.73 24.73 24.73 61.268v167.308q0 10.846-3 21.5t-6.846 20.884l-57.538 121.77q-6.077 13.154-18.231 20.846-12.153 7.692-27.307 7.692Zm-360 0q-29.538 0-44.422-24.192-14.884-24.191-2.115-49.498l40.077-86.31h-80.618q-36.538 0-61.268-24.73-24.73-24.73-24.73-61.268v-114.002q0-36.538 24.73-61.268 24.73-24.73 61.268-24.73h114.002q36.538 0 61.268 24.73 24.73 24.73 24.73 61.268v167.308q0 10.846-3 21.5t-6.846 20.884l-57.538 121.77q-6.077 13.154-18.231 20.846-12.153 7.692-27.307 7.692Z"/></svg>`,
  struct: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M438.001-178.23v-275.54L194-596.539v270.615q0 3.078 1.539 5.77 1.538 2.693 4.615 4.616L438.001-178.23Zm84.998 0 235.847-137.308q3.077-1.923 4.615-4.616 1.539-2.692 1.539-5.77v-269.615L522.999-454.77v276.54ZM480-528.461 719.001-667.23 486.154-801.538q-3.077-1.923-6.154-1.923t-6.154 1.923L240.999-667.23 480-528.461ZM157.155-238.847q-23.077-12.846-36.115-35.808-13.039-22.961-13.039-49.653v-310.384q0-26.692 13.039-49.653 13.038-22.962 36.115-35.808l273.691-157.076q23.077-12.846 49.154-12.846t49.154 12.846l272.691 157.076q23.077 12.846 36.115 35.808 13.039 22.961 13.039 49.653v310.384q0 26.692-13.039 49.653-13.038 22.962-36.115 35.808L529.154-81.771Q506.077-68.925 480-68.925T430.846-81.77L157.155-238.847ZM480-480Z"/></svg>`,
  list: `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M322.335-268.231q20.05 0 34.203-14.181 14.154-14.181 14.154-34.231 0-20.05-14.181-34.203Q342.331-365 322.281-365q-20.05 0-34.204 14.181-14.153 14.18-14.153 34.23 0 20.05 14.18 34.204 14.181 14.154 34.231 14.154Zm0-163.385q20.05 0 34.203-14.18 14.154-14.181 14.154-34.231 0-20.05-14.181-34.204-14.18-14.153-34.23-14.153-20.05 0-34.204 14.18-14.153 14.181-14.153 34.231 0 20.05 14.18 34.204 14.181 14.153 34.231 14.153Zm0-165.384q20.05 0 34.203-14.181 14.154-14.18 14.154-34.23 0-20.05-14.181-34.204-14.18-14.154-34.23-14.154-20.05 0-34.204 14.181-14.153 14.181-14.153 34.231 0 20.05 14.18 34.203Q302.285-597 322.335-597Zm158.511 324.384h161.693q17.749 0 30.374-12.629t12.625-30.384q0-17.756-12.625-30.371-12.625-12.615-30.374-12.615H480.846q-17.75 0-30.375 12.629-12.625 12.628-12.625 30.384 0 17.755 12.625 30.37 12.625 12.616 30.375 12.616Zm0-165.385h161.693q17.749 0 30.374-12.628 12.625-12.629 12.625-30.384 0-17.756-12.625-30.371-12.625-12.615-30.374-12.615H480.846q-17.75 0-30.375 12.628-12.625 12.629-12.625 30.384 0 17.756 12.625 30.371 12.625 12.615 30.375 12.615Zm0-163.384h161.693q17.749 0 30.374-12.629 12.625-12.628 12.625-30.384 0-17.755-12.625-30.37-12.625-12.616-30.374-12.616H480.846q-17.75 0-30.375 12.629t-12.625 30.384q0 17.756 12.625 30.371 12.625 12.615 30.375 12.615ZM212.309-114.001q-41.308 0-69.808-28.5-28.5-28.5-28.5-69.808v-535.382q0-41.308 28.5-69.808 28.5-28.5 69.808-28.5h535.382q41.308 0 69.808 28.5 28.5 28.5 28.5 69.808v535.382q0 41.308-28.5 69.808-28.5 28.5-69.808 28.5H212.309Zm0-85.999h535.382q4.616 0 8.463-3.846 3.846-3.847 3.846-8.463v-535.382q0-4.616-3.846-8.463-3.847-3.846-8.463-3.846H212.309q-4.616 0-8.463 3.846-3.846 3.847-3.846 8.463v535.382q0 4.616 3.846 8.463 3.847 3.846 8.463 3.846ZM200-760V-200-760Z"/></svg>`,
};

function iconForType(type: AppType) {
  switch (type) {
    case AppType.BYTE:
    case AppType.I16:
    case AppType.I32:
    case AppType.I64:
    case AppType.DOUBLE:
    case AppType.NUMBER:
      return icons.number;
    case AppType.BYTES:
      return icons.string;
    case AppType.STRUCT:
      return icons.struct;
    case AppType.LIST:
    case AppType.SET:
      return icons.list;
  }
}

/**
 * Selectable node in a list view rendering a single value from the source data and its key, i.e.,
 * something like a JSON index or whatever.
 *
 * This is intended to be a pure view, no real state or interaction with global stuff.
 *
 * TODO: contain metadata e.g., note and "use as type"
 * TODO: allow some kind of "view line" button, rather than simple select
 */
export class AppNodeElement extends HTMLElement {
  #key: string | number | undefined;
  #v: ParsedValue = { type: AppType.VOID, value: undefined };
  #render: () => void;

  constructor() {
    super();

    const root = this.attachShadow({ mode: 'open' });
    root.innerHTML = `
<style>
main {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 2px;
  height: 28px;
  border-radius: 4px;
  overflow: hidden;
  white-space: nowrap;
  border: 2px solid transparent;

  &:hover {
    background: var(--light-color-hover, #00f1);
  }

  &:focus {
    outline: 0;
    border-color: #0002;
  }
}
#icon {
  width: 24px;
  height: 24px;
}
#icon svg {
  display: block;
  fill: currentColor;
}
#value-holder {
  overflow: hidden;
  white-space: nowrap;
  display: block;
  opacity: 0.8;

  & .text {
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>
<main tabindex="-1">
  <div id="icon"></div>
  <div id="key" class="text"></div>
  <div style="flex-grow: 1"></div>
  <span id="value-holder"></span>
</main>
    `;

    const iconEl = root.getElementById('icon')!;
    const keyEl = root.getElementById('key')!;
    const valueHolderEl = root.getElementById('value-holder')!;

    const mainEl = root.querySelector('main')!;
    mainEl.addEventListener('focus', () => {
      this.dispatchEvent(
        new CustomEvent('choice', { composed: true, bubbles: true, detail: this.#v }),
      );
      mainEl.tabIndex = 0;
    });
    mainEl.addEventListener('blur', () => {
      mainEl.tabIndex = -1;
    });

    this.#render = () => {
      let keyString = 'unknown';
      if (this.#key !== undefined) {
        keyString = String(this.#key);
        keyEl.classList.remove('unknown');
      } else {
        keyEl.classList.add('unknown');
      }
      keyEl.textContent = keyString;

      // set icon
      const iconHtml = iconForType(this.#v.type);
      if (iconHtml) {
        iconEl.innerHTML = iconHtml;
      } else {
        iconEl.textContent = '';
      }

      valueHolderEl.textContent = '';
      if ('value' in this.#v) {
        const v = new AppValueElement();
        v.value = this.#v.value;
        valueHolderEl.append(v);
        return;
      }

      let text = '';
      switch (this.#v.type) {
        case AppType.LIST:
        case AppType.SET:
          text = `${lookupType(this.#v.type)}<${lookupType(this.#v.etype)}>, ${
            this.#v.items.length
          } items`;
          break;

        case AppType.STRUCT:
          text = `STRUCT, ${this.#v.fields.length} fields`;
          break;

        case AppType.MAP:
          text =
            `MAP<${lookupType(this.#v.ktype)}, ${lookupType(this.#v.vtype)}>` +
            `, ${this.#v.entries.length} fields`;
          break;
      }

      if (!text) {
        return;
      }
      const textNode = Object.assign(document.createElement('div'), {
        className: 'text',
        textContent: text,
      });
      valueHolderEl.append(textNode);
    };
  }

  set key(key: string | number | undefined) {
    this.#key = key;
    this.#render();
  }

  set value(v: ParsedValue) {
    this.#v = v;
    this.#render();
  }
}

customElements.define('app-node', AppNodeElement);
