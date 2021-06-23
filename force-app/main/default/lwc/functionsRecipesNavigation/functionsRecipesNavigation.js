import { LightningElement, api } from "lwc";

export default class FunctionsRecipesNavigation extends LightningElement {
  @api definition;
  @api selectedItem;

  selectItem(event) {
    const name = event.currentTarget.name;
    const selectedEvent = new CustomEvent("navselect", { detail: name });
    this.dispatchEvent(selectedEvent);
  }
}
