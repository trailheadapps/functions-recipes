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

  it('sends "next" event on button click', () => {
    const element = createElement("c-functions-recipes-navigation", {
      is: FunctionsRecipesNavigation
    });
    element.selectedFunction = "home";
    element.definition = functionsDefinition;
    document.body.appendChild(element);

    // Mock handlers for child events
    const selectItem = jest.fn();

    // Add event listener to catch events
    element.addEventListener("navselect", selectItem);

    // Click the navigation button
    const nextButtonEls = element.shadowRoot.querySelectorAll(
      "lightning-vertical-navigation-item"
    );
    nextButtonEls[0].click();

    // Return a promise to wait for any asynchronous DOM updates. Jest
    // will automatically wait for the Promise chain to complete before
    // ending the test and fail the test if the promise rejects.
    return Promise.resolve().then(() => {
      // Validate if mocked events got fired
      expect(selectItem.mock.calls.length).toBe(1);
    });
  });
});
