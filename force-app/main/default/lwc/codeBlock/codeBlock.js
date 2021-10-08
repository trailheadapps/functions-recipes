/* global Prism:readonly */
import { LightningElement, api, track } from "lwc";
import { loadScript, loadStyle } from "lightning/platformResourceLoader";
import highlight from "@salesforce/resourceUrl/highlight";

export default class CodeBlock extends LightningElement {
  @api
  set language(value) {
    this._language = value.toLowerCase();
    this.highlightCodeSegment();
  }
  get language() {
    return this._language;
  }

  @api
  set codeBlockContent(value) {
    this._codeBlockContent = value;
    if (this.prismInitialized === true) {
      this.highlightCodeSegment();
    }
  }
  get codeBlockContent() {
    return this._codeBlockContent;
  }

  prismInitialized = false;
  @track _codeBlockContent;

  prism;

  renderedCallback() {
    this.loadPrism();
  }

  loadPrism() {
    this.prismInitialized = true;
    if (this.prism === undefined) {
      Promise.all([
        loadStyle(this, highlight + "/highlight/prism.css"),
        loadScript(this, highlight + "/highlight/prism.js")
      ])
        .then(() => {
          this.error = undefined;
          this.prism = Prism;
          this.highlightCodeSegment();
        })
        .catch((error) => {
          this.error = error;
        });
    } else {
      this.highlightCodeSegment();
    }
  }

  highlightCodeSegment() {
    if (this.prism) {
      let codeBlockEl = this.template.querySelector("pre");
      // eslint-disable-next-line
      if (codeBlockEl.innerHTML !== "") {
        // eslint-disable-next-line
        codeBlockEl.innerHTML = "";
        codeBlockEl.classList.remove("language-javascript");
      }
      codeBlockEl.classList.add("line-numbers");
      const codeEl = document.createElement("code");
      codeEl.classList.add(`language-${this._language}`);
      if (this._language === "java") {
        this._codeBlockContent = this._codeBlockContent
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
      }
      // eslint-disable-next-line
      codeEl.innerHTML = this._codeBlockContent;
      codeBlockEl.appendChild(codeEl);
      this.prism.highlightAllUnder(codeBlockEl);
    }
  }
}
