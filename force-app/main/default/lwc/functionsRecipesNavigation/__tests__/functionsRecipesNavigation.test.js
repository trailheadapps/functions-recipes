import { createElement } from "lwc";
import FunctionsRecipesNavigation from "c/functionsRecipesNavigation";
const functionsDefinition = require("./data/functionsDefinition.json");

describe("c-functions-recipes-navigation", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("sets the navigation items", () => {
    const element = createElement("c-functions-recipes-navigation", {
      is: FunctionsRecipesNavigation
    });
    element.selectedFunction = "home";
    element.definition = functionsDefinition;
    document.body.appendChild(element);
    const navigationItems = element.shadowRoot.querySelector(
      "lightning-vertical-navigation-item"
    );
    expect(navigationItems).not.toBeNull();
  });
});
