import { createElement } from "lwc";
import ErrorPanel from "c/errorPanel";

describe("c-error-panel", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("displays a default friendly message", () => {
    const MESSAGE = "An error has occurred";

    // Create initial element
    const element = createElement("c-error-panel", {
      is: ErrorPanel
    });
    document.body.appendChild(element);

    const messageEl = element.shadowRoot.querySelector("h3");
    expect(messageEl.textContent).toBe(MESSAGE);
  });

  it("displays a custom friendly message", () => {
    const MESSAGE = "Errors are bad";

    // Create initial element
    const element = createElement("c-error-panel", {
      is: ErrorPanel
    });
    element.friendlyMessage = MESSAGE;
    document.body.appendChild(element);

    const messageEl = element.shadowRoot.querySelector("h3");
    expect(messageEl.textContent).toBe(MESSAGE);
  });

  it("displays reduced errors", () => {
    const MESSAGE = { message: "An error has ocurred" };

    // Create initial element
    const element = createElement("c-error-panel", {
      is: ErrorPanel
    });
    element.error = MESSAGE;
    element.type = "inlineMessage";
    document.body.appendChild(element);

    const messageEl = element.shadowRoot.querySelector("p");
    expect(messageEl.textContent).toBe(MESSAGE.message);
  });

  it("displays no error details when no errors are passed as parameters", () => {
    // Create initial element
    const element = createElement("c-error-panel", {
      is: ErrorPanel
    });
    document.body.appendChild(element);

    const inputEl = element.shadowRoot.querySelector("lightning-input");
    expect(inputEl).toBeNull();
  });
});
