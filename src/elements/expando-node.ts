export class AppExpandoNodeElement extends HTMLElement {

  constructor() {
    super();

    const root = this.attachShadow({ mode: 'open' });
    
  }

}

customElements.define('app-expando-node', AppExpandoNodeElement);