import { LightningElement, api } from "lwc";
import { NavigationMixin } from "lightning/navigation";

export default class FunctionsRecipesContent extends NavigationMixin(
  LightningElement
) {
  @api
  set selectedFunction(value) {
    this._selectedFunction = value;
    this.normalizeLanguages();
    this.selectedIndex = 0;
  }
  get selectedFunction() {
    return this._selectedFunction;
  }
  @api showHome;

  languages = [];

  selectedLanguage;
  _selectedFunction;

  showRunFunctionModal = false;
  selectedIndex = 0;
  baseURL =
    "https://github.com/trailheadapps/functions-recipes/tree/main/functions/";

  normalizeLanguages() {
    let items = [];
    this._selectedFunction.functions.forEach((item) => {
      items.push({ label: item.language, value: item.language });
    });
    this.languages = items;
    this.selectedLanguage = this.languages[0].value;
  }

  handleChange(event) {
    const value = event.currentTarget.value;
    this.selectedLanguage = value;
    this.selectedIndex = this._selectedFunction.functions.findIndex(
      (item) => item.language === value
    );
  }

  viewSource() {
    const source = this._selectedFunction.functions[this.selectedIndex].name;
    const url = this.baseURL + source;
    // Navigate to a URL
    this[NavigationMixin.Navigate](
      {
        type: "standard__webPage",
        attributes: {
          url: url
        }
      },
      true
    );
  }

  viewDocs() {
    const url =
      "https://developer.salesforce.com/docs/platform/functions/overview";
    this[NavigationMixin.Navigate]({
      type: "standard__webPage",
      attributes: {
        url
      }
    });
  }

  openRunFunctionModal() {
    this.showRunFunctionModal = true;
  }

  closeRunFunctionModal() {
    this.showRunFunctionModal = false;
  }

  get fileset() {
    return this._selectedFunction.functions[this.selectedIndex].files;
  }

  get functionDescription() {
    return this._selectedFunction.description;
  }

  get functionTitle() {
    if (this.showHome) {
      return "Home";
      // eslint-disable-next-line no-else-return
    } else {
      return this._selectedFunction.label;
    }
  }

  get functionName() {
    return this._selectedFunction.name;
  }

  get functionSubTitle() {
    if (this.showHome) {
      return "Get Started";
      // eslint-disable-next-line no-else-return
    } else {
      return this._selectedFunction.subtitle;
    }
  }

  get functionInputs() {
    return this._selectedFunction.functions[this.selectedIndex].inputs;
  }

  get functionFullName() {
    return this._selectedFunction.functions[this.selectedIndex].name;
  }
}
