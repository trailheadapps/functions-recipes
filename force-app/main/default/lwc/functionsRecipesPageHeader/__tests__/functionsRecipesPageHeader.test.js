import { createElement } from "lwc";
import FunctionsRecipesPageHeader from "c/functionsRecipesPageHeader";

describe("c-functions-recipes-page-header", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("renders the header", () => {
    const element = createElement("c-functions-recipes-page-header", {
      is: FunctionsRecipesPageHeader
    });
    element.title = "test";
    element.subtitle = "subtitle";
    document.body.appendChild(element);
    const header = element.shadowRoot.querySelector(".slds-page-header");
    expect(header).not.toBeNull();
  });
});
