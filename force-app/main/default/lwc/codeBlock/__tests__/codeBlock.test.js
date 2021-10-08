import { createElement } from "lwc";
import CodeBlock from "c/codeBlock";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";

const codeBlock = require("./data/codeBlock.json");

describe("c-code-block", () => {
  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("generates codeblock", () => {
    const LANGUAGE = "Typescript";
    const element = createElement("c-code-block", {
      is: CodeBlock
    });
    element.language = LANGUAGE;
    element.codeBlockContent = codeBlock;
    document.body.appendChild(element);
    // Validation that the loadScript and loadStyle promises
    // are called once.
    expect(loadScript.mock.calls.length).toBe(1);
    expect(loadStyle.mock.calls.length).toBe(1);
  });
});
