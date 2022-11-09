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
  // ProcessLargeDataJS
  processLargeDataJS_Function: loadJS("01_Intro_ProcessLargeData_JS"),
  processLargeDataJS_Test: loadJS(
    "01_Intro_ProcessLargeData_JS",
    "test/index.test.js"
  ),
  // ProcessLargeDataJava
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
  processLargeDataJava_Test: loadJava(
    "01_Intro_ProcessLargeData_Java",
    "FunctionTest.java",
    "test"
  ),
  // InvocationEventJS
  invocationEventJS_Function: loadJS("02_InvocationEvent_JS"),
  invocationEventJS_Test: loadJS("02_InvocationEvent_JS", "test/index.test.js"),
  // DataApiQueryJS
  dataApiQueryJS_Function: loadJS("03_Context_DataApiQuery_JS"),
  dataApiQueryJS_Test: loadJS(
    "03_Context_DataApiQuery_JS",
    "test/index.test.js"
  ),
  // OrgInfoTS
  orgInfoTS_Function: loadTS("03_Context_OrgInfo_TypeScript"),
  orgInfoTS_Test: loadTS("03_Context_OrgInfo_TypeScript", "test/index.test.ts"),
  // SalesforceSDKJS
  salesforceSDKJS_Function: loadJS("03_Context_SalesforceSDK_JS"),
  salesforceSDKJS_Test: loadJS(
    "03_Context_SalesforceSDK_JS",
    "test/index.test.js"
  ),
  // SalesforceSDKJava
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
  salesforceSDKJava_Test: loadJava(
    "03_Context_SalesforceSDK_Java",
    "FunctionTest.java",
    "test"
  ),
  // UnitOfWorkJS
  unitOfWorkJS_Function: loadJS("03_Context_UnitOfWork_JS"),
  unitOfWorkJS_Test: loadJS("03_Context_UnitOfWork_JS", "test/index.test.js"),
  // UnitOfWorkJava
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
  unitOfWorkJava_Test: loadJava(
    "03_Context_UnitOfWork_Java",
    "FunctionTest.java",
    "test"
  ),
  // LoggerJS
  loggerJS_Function: loadJS("04_Logger_JS"),
  loggerJS_Test: loadJS("04_Logger_JS", "test/index.test.js"),
  // EnvironmentJS
  environmentJS_Function: loadJS("05_Environment_JS"),
  environmentJS_Test: loadJS("05_Environment_JS", "test/index.test.js"),
  // PostgresJS
  postgresJS_Function: loadJS("06_Data_Postgres_JS"),
  postgresJS_DB: loadJS("06_Data_Postgres_JS", "lib/db.js"),
  postgresJS_Test: loadJS("06_Data_Postgres_JS", "test/index.test.js"),
  // PostgresJava
  postgresJava_Function: loadJava(
    "06_Data_Postgres_Java",
    "PostgresJavaFunction.java"
  ),
  postgresJava_Input: loadJava("06_Data_Postgres_Java", "FunctionInput.java"),
  postgresJava_Output: loadJava("06_Data_Postgres_Java", "Invocations.java"),
  postgresJava_Invocation: loadJava("06_Data_Postgres_Java", "Invocation.java"),
  postgresJava_Manager: loadJava(
    "06_Data_Postgres_Java",
    "db/InvocationsManager.java"
  ),
  postgresJava_Environment: loadJava(
    "06_Data_Postgres_Java",
    "utils/Environment.java"
  ),
  postgresJava_Test: loadJava(
    "06_Data_Postgres_Java",
    "FunctionTest.java",
    "test"
  ),
  // RedisJS
  redisJS_Function: loadJS("06_Data_Redis_JS"),
  redisJS_DB: loadJS("06_Data_Redis_JS", "lib/db.js"),
  redisJS_Test: loadJS("06_Data_Redis_JS", "test/index.test.js"),
  // RedisJava
  redisJava_Function: loadJava("06_Data_Redis_Java", "RedisJavaFunction.java"),
  redisJava_Input: loadJava("06_Data_Redis_Java", "FunctionInput.java"),
  redisJava_Output: loadJava("06_Data_Redis_Java", "Invocations.java"),
  redisJava_Manager: loadJava(
    "06_Data_Redis_Java",
    "db/InvocationsManager.java"
  ),
  redisJava_Environment: loadJava(
    "06_Data_Redis_Java",
    "utils/Environment.java"
  ),
  redisJava_Test: loadJava("06_Data_Redis_Java", "FunctionTest.java", "test")
};

function loadJS(name, file = "index.js") {
  const filename = path.join(__dirname, `../functions/${name}/${file}`);
  return escapeJS(fs.readFileSync(filename, "utf8"));
}

function loadTS(name, file = "index.ts") {
  const filename = path.join(__dirname, `../functions/${name}/${file}`);
  return escapeJS(fs.readFileSync(filename, "utf8"));
}

function loadJava(name, file, dir = "main") {
  const filename = path.join(
    __dirname,
    `../functions/${name}/src/${dir}/java/com/salesforce/functions/recipes/${file}`
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
