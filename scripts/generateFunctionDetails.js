"use strict";

const fs = require("fs");
const path = require("path");
const Handlebars = require("handlebars");
const templateSrc = fs.readFileSync(
  path.join(__dirname, "./template/functionDetails.template.js"),
  "utf8"
);
const template = Handlebars.compile(templateSrc);

const sourceMap = {
  processLargeDataJS_Function: loadJS("01_Intro_ProcessLargeData_JS"),
  processLargeDataJava_Function: loadJava(
    "01_Intro_ProcessLargeData_Java",
    "ProcessLargeDataFunction.java"
  ),
  processLargeDataJava_Input: loadJava(
    "01_Intro_ProcessLargeData_Java",
    "FunctionInput.java"
  ),
  processLargeDataJava_Output: loadJava(
    "01_Intro_ProcessLargeData_Java",
    "FunctionOutput.java"
  ),
  processLargeDataJava_Response: loadJava(
    "01_Intro_ProcessLargeData_Java",
    "JsonResponse.java"
  ),
  processLargeDataJava_School: loadJava(
    "01_Intro_ProcessLargeData_Java",
    "School.java"
  ),
  invocationEventJS_Function: loadJS("02_InvocationEvent_JS"),
  dataApiQueryJS_Function: loadJS("03_Context_DataApiQuery_JS"),
  orgInfoTS_Function: loadTS("03_Context_OrgInfo_TypeScript"),
  salesforceSDKJS_Function: loadJS("03_Context_SalesforceSDK_JS"),
  salesforceSDKJava_Function: loadJava(
    "03_Context_SalesforceSDK_Java",
    "SalesforceSDKFunction.java"
  ),
  salesforceSDKJava_Input: loadJava(
    "03_Context_SalesforceSDK_Java",
    "FunctionInput.java"
  ),
  salesforceSDKJava_Output: loadJava(
    "03_Context_SalesforceSDK_Java",
    "FunctionOutput.java"
  ),
  salesforceSDKJava_Account: loadJava(
    "03_Context_SalesforceSDK_Java",
    "Account.java"
  ),
  unitOfWorkJS_Function: loadJS("03_Context_UnitOfWork_JS"),
  unitOfWorkJava_Function: loadJava(
    "03_Context_UnitOfWork_Java",
    "UnitOfWorkFunction.java"
  ),
  unitOfWorkJava_Input: loadJava(
    "03_Context_UnitOfWork_Java",
    "FunctionInput.java"
  ),
  unitOfWorkJava_Output: loadJava(
    "03_Context_UnitOfWork_Java",
    "FunctionOutput.java"
  ),
  unitOfWorkJava_Cases: loadJava("03_Context_UnitOfWork_Java", "Cases.java"),
  loggerJS_Function: loadJS("04_Logger_JS"),
  environmentJS_Function: loadJS("05_Environment_JS")
};

function loadJS(name) {
  const filename = path.join(__dirname, `../functions/${name}/index.js`);
  return escapeJS(fs.readFileSync(filename, "utf8"));
}

function loadTS(name) {
  const filename = path.join(__dirname, `../functions/${name}/index.ts`);
  return escapeJS(fs.readFileSync(filename, "utf8"));
}

function loadJava(name, file) {
  const filename = path.join(
    __dirname,
    `../functions/${name}/src/main/java/com/salesforce/functions/recipes/${file}`
  );
  return fs.readFileSync(filename, "utf8");
}

function escapeJS(str) {
  return str.replace(/\${/g, "\\${").replace(/`/g, "\\`");
}

console.log("*** Generating functionDetails.js file from source");
const output = template({ source: sourceMap });
const outputFilename = path.join(
  __dirname,
  "..",
  "force-app/main/default/staticresources/functionDetails.js"
);
fs.writeFileSync(path.join(outputFilename), output, "utf-8");
console.log("*** Success");
