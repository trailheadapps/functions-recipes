window.functionData = {
  getData: function () {
    return [
      {
        name: "01_Intro_ProcessLargeData",
        label: "Process Large Data Volumes",
        subtitle: "Introduction",
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
            deployment: "functions_recipes.processlargedatajs",
            language: "JavaScript",
            files: [
              {
                name: "index.js",
                body: `{{{source.processLargeDataJS_Function}}}`
              },
              {
                name: "index.test.js",
                body: `{{{source.processLargeDataJS_Test}}}`
              }
            ]
          },
          {
            name: "01_Intro_ProcessLargeData_Java",
            deployment: "functions_recipes.processlargedatajava",
            language: "Java",
            files: [
              {
                name: "ProcessLargeDataFunction.java",
                body: `{{{source.processLargeDataJava_Function}}}`
              },
              {
                name: "FunctionInput.java",
                body: `{{{source.processLargeDataJava_Input}}}`
              },
              {
                name: "FunctionOutput.java",
                body: `{{{source.processLargeDataJava_Output}}}`
              },
              {
                name: "JsonResponse.java",
                body: `{{{source.processLargeDataJava_Response}}}`
              },
              {
                name: "School.java",
                body: `{{{source.processLargeDataJava_School}}}`
              },
              {
                name: "FunctionTest.java",
                body: `{{{source.processLargeDataJava_Test}}}`
              }
            ]
          }
        ]
      },
      {
        name: "02_InvocationEvent",
        label: "Invocation Event",
        subtitle: "Invocation Event",
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
            deployment: "functions_recipes.invocationeventjs",
            language: "JavaScript",
            files: [
              {
                name: "index.js",
                body: `{{{source.invocationEventJS_Function}}}`
              },
              {
                name: "index.test.js",
                body: `{{{source.invocationEventJS_Test}}}`
              }
            ]
          }
        ]
      },
      {
        name: "03_Context_DataApiQuery",
        label: "Data API Query",
        subtitle: "Context",
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
                body: `{{{source.dataApiQueryJS_Function}}}`
              },
              {
                name: "index.test.js",
                body: `{{{source.dataApiQueryJS_Test}}}`
              }
            ]
          }
        ]
      },
      {
        name: "03_Context_OrgInfo",
        label: "OrgInfo",
        subtitle: "Context",
        description:
          "Returns the Salesforce Org information attached to the context.",
        functions: [
          {
            name: "03_Context_OrgInfo_TypeScript",
            deployment: "functions_recipes.orginfots",
            language: "TypeScript",
            files: [
              {
                name: "index.ts",
                body: `{{{source.orgInfoTS_Function}}}`
              },
              {
                name: "index.test.ts",
                body: `{{{source.orgInfoTS_Test}}}`
              }
            ]
          }
        ]
      },
      {
        name: "03_Context_SalesforceSDK",
        label: "SalesforceSDK",
        subtitle: "Context",
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
            deployment: "functions_recipes.salesforcesdkjs",
            language: "JavaScript",
            files: [
              {
                name: "index.js",
                body: `{{{source.salesforceSDKJS_Function}}}`
              },
              {
                name: "index.test.js",
                body: `{{{source.salesforceSDKJS_Test}}}`
              }
            ]
          },
          {
            name: "03_Context_SalesforceSDK_Java",
            deployment: "functions_recipes.salesforcesdkjava",
            language: "Java",
            files: [
              {
                name: "SalesforceSDKFunction.java",
                body: `{{{source.salesforceSDKJava_Function}}}`
              },
              {
                name: "Account.java",
                body: `{{{source.salesforceSDKJava_Account}}}`
              },
              {
                name: "FunctionInput.java",
                body: `{{{source.salesforceSDKJava_Input}}}`
              },
              {
                name: "FunctionOutput.java",
                body: `{{{source.salesforceSDKJava_Output}}}`
              },
              {
                name: "FunctionTest.java",
                body: `{{{source.salesforceSDKJava_Test}}}`
              }
            ]
          }
        ]
      },
      {
        name: "03_Context_UnitOfWork",
        label: "UnitOfWork",
        subtitle: "Context",
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
            deployment: "functions_recipes.unitofworkjs",
            language: "JavaScript",
            files: [
              {
                name: "index.js",
                body: `{{{source.unitOfWorkJS_Function}}}`
              },
              {
                name: "index.test.js",
                body: `{{{source.unitOfWorkJS_Test}}}`
              }
            ]
          },
          {
            name: "03_Context_UnitOfWork_Java",
            deployment: "functions_recipes.unitofworkjava",
            language: "Java",
            files: [
              {
                name: "UnitOfWorkFunction.java",
                body: `{{{source.unitOfWorkJava_Function}}}`
              },
              {
                name: "FunctionInput.java",
                body: `{{{source.unitOfWorkJava_Input}}}`
              },
              {
                name: "FunctionOutput.java",
                body: `{{{source.unitOfWorkJava_Output}}}`
              },
              {
                name: "Cases.java",
                body: `{{{source.unitOfWorkJava_Cases}}}`
              },
              {
                name: "FunctionTest.java",
                body: `{{{source.unitOfWorkJava_Test}}}`
              }
            ]
          }
        ]
      },
      {
        name: "04_Logger",
        label: "Logger",
        subtitle: "Logging",
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
            deployment: "functions_recipes.loggerjs",
            language: "JavaScript",
            files: [
              {
                name: "index.js",
                body: `{{{source.loggerJS_Function}}}`
              },
              {
                name: "index.test.js",
                body: `{{{source.loggerJS_Test}}}`
              }
            ]
          }
        ]
      },
      {
        name: "05_Environment_JS",
        label: "Environment",
        subtitle: "Environment Variables",
        description:
          "Returns the derivate password hash using pbkdf2 getting the salt from the Environment.",
        instructions:
          'Run: <code>sf env var set PASSWORD_SALT="a random passphrase" -e compute-env-alias</code> to set the necessary configuration value.',
        inputs: [{ label: "Password", name: "password", type: "text" }],
        functions: [
          {
            name: "05_Environment_JS",
            deployment: "functions_recipes.environmentjs",
            language: "JavaScript",
            files: [
              {
                name: "index.js",
                body: `{{{source.environmentJS_Function}}}`
              },
              {
                name: "index.test.js",
                body: `{{{source.environmentJS_Test}}}`
              }
            ]
          }
        ]
      },
      {
        name: "06_Data_Postgres",
        label: "Heroku Postgres",
        subtitle: "Heroku Data",
        description:
          "Connects to a PostgreSQL instance, stores the invocation ID, and returns a list of previous invocations.",
        instructions:
          "Make sure you have attached the Heroku Postgres database to your compute environment.",
        inputs: [{ label: "Limit", name: "limit", type: "number" }],
        functions: [
          {
            name: "06_Data_Postgres_JS",
            deployment: "functions_recipes.postgresjs",
            language: "JavaScript",
            files: [
              {
                name: "index.js",
                body: `{{{source.postgresJS_Function}}}`
              },
              {
                name: "db.js",
                body: `{{{source.postgresJS_DB}}}`
              },
              {
                name: "index.test.js",
                body: `{{{source.postgresJS_Test}}}`
              }
            ]
          },
          {
            name: "06_Data_Postgres_Java",
            deployment: "functions_recipes.postgresjava",
            language: "Java",
            files: [
              {
                name: "PostgresJavaFunction.java",
                body: `{{{source.postgresJava_Function}}}`
              },
              {
                name: "FunctionInput.java",
                body: `{{{source.postgresJava_Input}}}`
              },
              {
                name: "Invocations.java",
                body: `{{{source.postgresJava_Output}}}`
              },
              {
                name: "Invocation.java",
                body: `{{{source.postgresJava_Invocation}}}`
              },
              {
                name: "InvocationsManager.java",
                body: `{{{source.postgresJava_Manager}}}`
              },
              {
                name: "Environment.java",
                body: `{{{source.postgresJava_Environment}}}`
              },
              {
                name: "FunctionTest.java",
                body: `{{{source.postgresJava_Test}}}`
              }
            ]
          }
        ]
      },
      {
        name: "06_Data_Redis",
        label: "Heroku Data for Redis",
        subtitle: "Heroku Data",
        description:
          "Connects to a Redis instance, stores the invocation ID, and returns a list of previous invocations.",
        instructions:
          "Make sure you have attached the Heroku Data for Redis instance to your compute environment.",
        inputs: [{ label: "Limit", name: "limit", type: "number" }],
        functions: [
          {
            name: "06_Data_Redis_JS",
            deployment: "functions_recipes.redisjs",
            language: "JavaScript",
            files: [
              {
                name: "index.js",
                body: `{{{source.redisJS_Function}}}`
              },
              {
                name: "db.js",
                body: `{{{source.redisJS_DB}}}`
              },
              {
                name: "index.test.js",
                body: `{{{source.redisJS_Test}}}`
              }
            ]
          },
          {
            name: "06_Data_Redis_Java",
            deployment: "functions_recipes.redisjava",
            language: "Java",
            files: [
              {
                name: "RedisJavaFunction.java",
                body: `{{{source.redisJava_Function}}}`
              },
              {
                name: "FunctionInput.java",
                body: `{{{source.redisJava_Input}}}`
              },
              {
                name: "Invocations.java",
                body: `{{{source.redisJava_Output}}}`
              },
              {
                name: "InvocationsManager.java",
                body: `{{{source.redisJava_Manager}}}`
              },
              {
                name: "Environment.java",
                body: `{{{source.redisJava_Environment}}}`
              },
              {
                name: "FunctionTest.java",
                body: `{{{source.redisJava_Test}}}`
              }
            ]
          }
        ]
      }
    ];
  }
};
