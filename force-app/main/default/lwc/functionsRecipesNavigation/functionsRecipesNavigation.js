import { LightningElement, api } from "lwc";

export default class FunctionsRecipesNavigation extends LightningElement {
  @api definition;
  @api selectedItem;
  connectedCallback() {
    console.log(JSON.stringify(this.definition));
    console.log(this.selectedItem);
  }

  selectItem(event) {
    const name = event.currentTarget.name;
    const selectedEvent = new CustomEvent("navselect", { detail: name });
    this.dispatchEvent(selectedEvent);
  }
}
