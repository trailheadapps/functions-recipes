window.functionData = (function () {
  return {
    getData: function () {
      return [
        {
          name: "01_Intro_ProcessLargeData",
          label: "Process Large Data Volumes",
          subtitle: "Process Large Data Volumes",
          description:
            "From a large JSON payload calculates the distance between a supplied point of origin cordinate and the data, sorts it, and returns the nearest x results.",
          inputs: [
            { label: "Latitude", name: "latitude", type: "text" },
            { label: "Longitude", name: "longitude", type: "text" },
            { label: "Length", name: "length", type: "text" }
          ],
          functions: [
            {
              name: "01_Intro_ProcessLargeData_JS",
              label: "Process Large Data - JavaScript",
              deployment: "functions_recipes.processlargedatajs",
              language: "JavaScript",
              files: [
                {
                  name: "index.js",
                  label: "Index",
                  path: "/",
                  body: `{{{source.processLargeDataJS_Function}}}`
                }
              ]
            },
            {
              name: "01_Intro_ProcessLargeData_Java",
              label: "Process Large Data - Java",
              deployment: "functions_recipes.processlargedatajava",
              language: "Java",
              files: [
                {
                  name: "ProcessLargeDataFunction.java",
                  label: "Process Large Data Function",
                  path: "/",
                  body: `{{{source.processLargeDataJava_Function}}}`
                },
                {
                  name: "FunctionInput.java",
                  label: "Function Input",
                  path: "/",
                  body: `{{{source.processLargeDataJava_Input}}}`
                },
                {
                  name: "FunctionOutput.java",
                  label: "Function Output",
                  path: "/",
                  body: `{{{source.processLargeDataJava_Output}}}`
                },
                {
                  name: "JavaResponse.java",
                  label: "Java Response",
                  path: "/",
                  body: `{{{source.processLargeDataJava_Response}}}`
                },
                {
                  name: "School.java",
                  label: "School",
                  path: "/",
                  body: `{{{source.processLargeDataJava_School}}}`
                }
              ]
            }
          ]
        },
        {
          name: "02_InvocationEvent",
          label: "Invocation Event",
          subtitle: "Functions Recipes",
          description: "Receives a payload and returns information about it.",
          inputs: [
            {
              type: "text",
              name: "name",
              label: "Name"
            },
            {
              type: "number",
              name: "year",
              label: "Year"
            }
          ],
          functions: [
            {
              name: "02_InvocationEvent_JS",
              label: "Invocation Event - JavaScript",
              deployment: "functions_recipes.invocationeventjs",
              language: "JavaScript",
              files: [
                {
                  name: "index.js",
                  label: "Invocation Event",
                  body: `{{{source.invocationEventJS_Function}}}`
                }
              ]
            }
          ]
        },
        {
          name: "03_Context_DataApiQuery",
          label: "Data API Query",
          subtitle: "Functions Recipes",
          description: "Returns accounts and its contacts by keyword.",
          inputs: [{ label: "Keyword", name: "keyword", type: "text" }],
          functions: [
            {
              name: "03_Context_DataApiQuery_JS",
              label: "Context - Data API Query - JavaScript",
              deployment: "functions_recipes.dataapiqueryjs",
              language: "JavaScript",
              files: [
                {
                  name: "index.js",
                  label: "Invocation Event",
                  body: `{{{source.dataApiQueryJS_Function}}}`
                }
              ]
            }
          ]
        },
        {
          name: "03_Context_OrgInfo",
          label: "OrgInfo",
          subtitle: "Functions Recipes",
          description:
            "Returns the Salesforce Org information attached to the context.",
          functions: [
            {
              name: "03_Context_OrgInfo_TypeScript",
              label: "Context - OrgInfo - TypeScript",
              deployment: "functions_recipes.orginfots",
              language: "TypeScript",
              files: [
                {
                  name: "index.ts",
                  label: "Index",
                  body: `{{{source.orgInfoTS_Function}}}`
                }
              ]
            }
          ]
        },
        {
          name: "03_Context_SalesforceSDK",
          label: "SalesforceSDK",
          subtitle: "Functions Recipes",
          description:
            "Receives a payload containing account details, and creates the record. It then uses a SOQL query to return the newly created Account.",
          inputs: [
            { label: "Name", name: "name", type: "text" },
            { label: "Account Number", name: "accountNumber", type: "text" },
            { label: "Industry", name: "industry", type: "text" },
            { label: "Type", name: "type", type: "text" },
            { label: "Website", name: "website", type: "text" }
          ],
          functions: [
            {
              name: "03_Context_SalesforceSDK_JS",
              label: "Context - SalesforceSDK - JavaScript",
              deployment: "functions_recipes.salesforcesdkjs",
              language: "JavaScript",
              files: [
                {
                  name: "index.js",
                  label: "Salesforce SDK",
                  body: `{{{source.salesforceSDKJS_Function}}}`
                }
              ]
            },
            {
              name: "03_Context_SalesforceSDK_Java",
              label: "Context - SalesforceSDK - Java",
              deployment: "functions_recipes.salesforcesdkjava",
              language: "Java",
              files: [
                {
                  name: "SalesforceSDKFunction.java",
                  label: "Salesforce SDK",
                  body: `{{{source.salesforceSDKJava_Function}}}`
                },
                {
                  name: "Account.java",
                  label: "Salesforce SDK",
                  body: `{{{source.salesforceSDKJava_Account}}}`
                },
                {
                  name: "FunctionInput.java",
                  label: "Salesforce SDK",
                  body: `{{{source.salesforceSDKJava_Input}}}`
                },
                {
                  name: "FunctionOutput.java",
                  label: "Salesforce SDK",
                  body: `{{{source.salesforceSDKJava_Output}}}`
                }
              ]
            }
          ]
        },
        {
          name: "03_Context_UnitOfWork",
          label: "UnitOfWork",
          subtitle: "Functions Recipes",
          description:
            "Receives a payload containing Account, Contact, and Case details and uses the Unit of Work pattern to assign the corresponding values to to its Record while maintaining the relationships. It then commits the unit of work and returns the Record Id's for each object.",
          inputs: [
            { label: "First Name", name: "firstName", type: "text" },
            { label: "Last Name", name: "lastName", type: "text" },
            { label: "Account Name", name: "accountName", type: "text" },
            { label: "Website", name: "website", type: "text" },
            { label: "Subject", name: "subject", type: "text" },
            { label: "Description", name: "description", type: "text" }
          ],
          functions: [
            {
              name: "03_Context_UnitOfWork_JS",
              label: "Context - UnitOfWork - JavaScript",
              deployment: "functions_recipes.unitofworkjs",
              language: "JavaScript",
              files: [
                {
                  name: "index.js",
                  label: "UnitOfWork",
                  body: `{{{source.unitOfWorkJS_Function}}}`
                }
              ]
            },
            {
              name: "03_Context_UnitOfWork_Java",
              label: "UnitOfWork - Java",
              deployment: "functions_recipes.unitofworkjava",
              language: "Java",
              files: [
                {
                  name: "UnitOfWorkFunction.java",
                  label: "UnitOfWork",
                  body: `{{{source.unitOfWorkJava_Function}}}`
                },
                {
                  name: "FunctionInput.java",
                  label: "Salesforce SDK",
                  body: `{{{source.unitOfWorkJava_Input}}}`
                },
                {
                  name: "FunctionOutput.java",
                  label: "UnitOfWork",
                  body: `{{{source.unitOfWorkJava_Output}}}`
                },
                {
                  name: "Cases.java",
                  label: "UnitOfWork",
                  body: `{{{source.unitOfWorkJava_Cases}}}`
                }
              ]
            }
          ]
        },
        {
          name: "04_Logger",
          label: "Logger",
          subtitle: "Functions Recipes",
          description:
            "Generates an amount of log messages every number of seconds.",
          instructions:
            "Run: <code>sf env log tail -e compute-env-alias</code> to retrieve logs after invoking the function.",
          inputs: [
            { label: "Amount", name: "amount", type: "number" },
            { label: "Timeout", name: "timeout", type: "number" }
          ],
          functions: [
            {
              name: "04_Logger_JS",
              label: "Logger - JavaScript",
              deployment: "functions_recipes.loggerjs",
              language: "JavaScript",

              files: [
                {
                  name: "index.js",
                  label: "Logger",
                  body: `{{{source.loggerJS_Function}}}`
                }
              ]
            }
          ]
        },
        {
          name: "05_Environment_JS",
          label: "Environment",
          subtitle: "Functions Recipes",
          description:
            "Returns the derivate password hash using pbkdf2 getting the salt from the Environment.",
          instructions:
            'Run: <code>sf env var set PASSWORD_SALT="a random passphrase" -e compute-env-alias</code> to set the necessary configuration value.',
          inputs: [{ label: "Password", name: "password", type: "text" }],
          functions: [
            {
              name: "05_Environment_JS",
              label: "Environment",
              deployment: "functions_recipes.environmentjs",
              language: "JavaScript",
              files: [
                {
                  name: "index.js",
                  label: "Environment",
                  body: `{{{source.environmentJS_Function}}}`
                }
              ]
            }
          ]
        }
      ];
    }
  };
})();
