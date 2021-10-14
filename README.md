# Functions Recipes

[![CI Workflow](https://github.com/trailheadapps/functions-recipes/workflows/CI/badge.svg)](https://github.com/trailheadapps/functions-recipes/actions?query=workflow%3ACI) [![codecov](https://codecov.io/gh/trailheadapps/functions-recipes/branch/main/graph/badge.svg)](https://codecov.io/gh/trailheadapps/functions-recipes) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

![Functions Icon](images/functions_icon.png)

## Introduction

Salesforce Functions lets you use the Salesforce Platform for building event-driven, elastically scalable apps and experiences. Salesforce Functions is designed to boost developer productivity by reducing your infrastructure responsibilities and enabling you to build and integrate Functions-as-a-Service (FaaS) apps using the languages and tools of your choice.

**Functions Recipes** is a library of examples to help you getting started with Salesforce Functions and get used to their main features.

To learn more about Salesforce Functions please visit the [documentation center](https://developer.salesforce.com/docs/platform/functions/overview).

## Getting Started

You can use Functions both locally and deployed to a Salesforce Organization, if you don't have access to a Functions Enabled Org, you can still use the examples in this repository, please refer to the [Local Development](#local-development) section for more information.

### Prerequisites

Please refer to the [Install Prerequisites](https://sfdc.co/functions-install-guide) for detailed information about the necessary tools to start developing Salesforce Functions.

## Salesforce Org Setup and Deployment

For more information about how to configure your organization for Salesforce Functions, please refer to the [documentation](http://sfdc.co/functions-org-config)

**Prerequisite: Functions Enabled Org**

1. If you haven't already done so, authorize with your org and provide it with an alias (**fnrecipesorg** in the command below):

```
sfdx auth:web:login -d -a fnrecipesorg
```

2. Clone the functions-recipes repository:

```
git clone https://github.com/trailheadapps/functions-recipes
cd functions-recipes
```

3. Create a scratch org and provide it with an alias (**functions_recipes** in the command below):

```sh
sfdx force:org:create -s -f config/project-scratch-def.json -a functions_recipes
```

## Salesforce Functions Deployment

For more information about how to deploy Functions to a Compute Environment and connect it to an org, please refer to to the [documentation](https://developer.salesforce.com/docs/platform/functions/guide/deploy)

1. Login to your Salesforce Functions account:

```
sf login functions
```

2. Create a **Compute Environment** to deploy the functions and connected it to your org:

```sh
sf env create compute --connected-org=functions_recipes --alias=recipes_env
```

3. Deploy the functions

```sh
sf deploy functions --connected-org=functions_recipes
```

4. Push source app to the scratch org:

```sh
sfdx force:source:push -f
```

5. Assign the **FunctionsRecipes** permission set to the default user:

```sh
sfdx force:user:permset:assign -n FunctionsRecipes
```

6. Assign the **Functions** permission set to the default user:

```sh
sfdx force:user:permset:assign -n Functions
```

7. Open the **Functions Recipes** App

```sh
sfdx force:org:open -p "/lightning/n/Functions"
```

8. Activate the **Functions Recipes** Theme (Optional)

```sh
sfdx force:org:open -p "/lightning/setup/ThemingAndBranding/home"
```

## Functions Recipes App

After deploying both the Salesforce app and the functions, you can open the Salesforce org and navigate to the **Functions Recipes** application:

From there you'll be able to explore the source code and invoke the deployed functions.

![Screenshot](images/screenshot.png)

## Local Development

Each individual function can be started and invoked locally using the Salesforce CLI, you can refer to each individual **README** for instructions on how to start and invoke each function locally.

### Available Recipes

1. Introduction to Functions
   - [ProcessLargeData (Node.js)](functions/01_Intro_ProcessLargeData_JS)
   - [ProcessLargeData (Java)](functions/01_Intro_ProcessLargeData_Java)
1. `InvocationEvent`
   - [InvocationEvent (Node.js)](functions/02_InvocationEvent_JS)
1. `Context`
   - [DataApiQuery (Node.js)](functions/03_Context_DataApiQuery_JS)
   - [OrgInfo (Node.js / TypeScript)](functions/03_Context_OrgInfo_TypeScript)
   - [SalesforceSDK (Node.js)](functions/03_Context_SalesforceSDK_JS)
   - [SalesforceSDK (Java)](functions/03_Context_SalesforceSDK_Java)
   - [UnitOfWork (Node.js)](functions/03_Context_UnitOfWork_JS)
   - [UnitOfWork (Java)](functions/03_Context_UnitOfWork_Java)
1. Logging
   - [Logger (Node.js)](functions/04_Logger_JS)
1. Environment Variables
   - [Environment (Node.js)](functions/05_Environment_JS)
