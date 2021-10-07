import { LightningElement, api } from "lwc";
import invoke from "@salesforce/apex/GenericFunctionInvoker.invoke";

export default class FunctionsRecipesRunModal extends LightningElement {
  @api selectedFunction;
  @api selectedIndex;
  payload = {};
  result;
  loading = false;
  error;

  connectedCallback() {
    if (!this.selectedFunction.inputs) {
      this.invokeFunction();
    }
  }

  invokeFunction() {
    this.loading = true;
    invoke({
      functionName:
        this.selectedFunction.functions[this.selectedIndex].deployment,
      payload: JSON.stringify(this.payload)
    })
      .then((result) => {
        this.result = JSON.stringify(JSON.parse(result), null, 2);
        this.error = undefined;
        this.loading = false;
      })
      .catch((error) => {
        this.loading = false;
        this.error = error;
        this.result = undefined;
      });
  }

  handleClose() {
    this.dispatchEvent(new CustomEvent("closemodal"));
  }

  handleChange(event) {
    this.payload[event.target.name] = event.target.value;
  }

  get modalWidth() {
    if (this.results) {
      return "width:80%;min-width:80%;max-width:80%;";
      // eslint-disable-next-line
    } else {
      // eslint-disable-next-line
      return "width:50%;min-width:50%;max-width:50%;";
    }
  }
}
