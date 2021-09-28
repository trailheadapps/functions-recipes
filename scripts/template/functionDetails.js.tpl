window.functionData = (function () {
  return {
    getData: function () {
      return [
        {
          name: "01_Intro_ProcessLargeData",
          label: "Process Large Data Volumes",
          subtitle: "Process Large Data Volumes",
          description:
            "This function takes a large JSON payload, calculates the distance between a supplied cordinate and the data, sorts it, and returns the nearest x results.",
          inputs: [
            {label: "Latitude", name: "latitude", type:"text"},{label: "Longitude", name: "longitude", type:"text"},{label: "Length", name:"length", type:"text"}
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
          description:
            "Detects a payload type and returns information about it.",
          inputs: [
            {
              type: "text",
              label: "type"
            },
            {
              type: "text",
              label: "key"
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
          description:
            "The exported method is the entry point for your code when the function is invoked.",
          functions: [
            {
              name: "03_Context_DataApiQuery_JS",
              label: "Context - Data API Query - JavaScript",
              language: "JavaScript",
              inputs: [
                {
                  type: "number",
                  label: "latitude"
                },
                {
                  type: "number",
                  label: "longitude"
                },
                {
                  type: "number",
                  label: "length"
                }
              ],
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
              language: "TypeScript",
              inputs: [
                {
                  type: "number",
                  label: "latitude"
                },
                {
                  type: "number",
                  label: "longitude"
                },
                {
                  type: "number",
                  label: "length"
                }
              ],
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
            "This function takes a payload containing account details, and creates the record. It then uses a SOQL query to return the newly created Account.",
          functions: [
            {
              name: "03_Context_SalesforceSDK_JS",
              label: "Context - SalesforceSDK - JavaScript",
              language: "JavaScript",
              inputs: [
                {
                  type: "number",
                  label: "latitude"
                },
                {
                  type: "number",
                  label: "longitude"
                },
                {
                  type: "number",
                  label: "length"
                }
              ],
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
              language: "Java",
              inputs: [
                {
                  type: "number",
                  label: "latitude"
                },
                {
                  type: "number",
                  label: "longitude"
                },
                {
                  type: "number",
                  label: "length"
                }
              ],
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
            "This function takes a payload containing Account, Contact, and Case details and uses the Unit of Work pattern to assign the corresponding values to to its Record while maintaining the relationships. It then commits the unit of work and returns the Record Id's for each object.",
          functions: [
            {
              name: "03_Context_UnitOfWork_JS",
              label: "Context - UnitofWork - JavaScript",
              language: "JavaScript",
              inputs: [
                {
                  type: "number",
                  label: "latitude"
                },
                {
                  type: "number",
                  label: "longitude"
                },
                {
                  type: "number",
                  label: "length"
                }
              ],
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
              language: "Java",
              inputs: [
                {
                  type: "number",
                  label: "latitude"
                },
                {
                  type: "number",
                  label: "longitude"
                },
                {
                  type: "number",
                  label: "length"
                }
              ],
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
          functions: [
            {
              name: "04_Logger_JS",
              label: "Logger - JavaScript",
              language: "JavaScript",
              inputs: [
                {
                  type: "number",
                  label: "latitude"
                },
                {
                  type: "number",
                  label: "longitude"
                },
                {
                  type: "number",
                  label: "length"
                }
              ],
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
          functions: [
            {
              name: "05_Environment_JS",
              label: "Environment",
              language: "JavaScript",
              inputs: [
                {
                  type: "number",
                  label: "latitude"
                },
                {
                  type: "number",
                  label: "longitude"
                },
                {
                  type: "number",
                  label: "length"
                }
              ],
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
