import { LightningElement, api } from "lwc";
import invoke from "@salesforce/apex/GenericFunctionInvoker.invoke";

export default class FunctionsRecipesRunModal extends LightningElement {
  @api functionInputs = [];
  @api functionName;
  payload = {};
  result;

  invokeFunction() {
    invoke({ functionName: `functions_recipes.${this.functionName}` })
      .then((result) => {
        this.result = result;
        this.error = undefined;
      })
      .catch((error) => {
        this.error = error;
        this.result = undefined;
      });
  }

  handleChange(event) {
    this.payload[event.target.name] = event.target.value;
  }
}
