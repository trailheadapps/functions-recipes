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
                  body: `import { readFileSync } from "fs";

// Local Schools Database API by Code.org
// License: CC BY-NC-SA 4.0
// Url: https://code.org/learn/find-school/json
// Read Schools JSON Database into memory
const schoolsData = JSON.parse(
  readFileSync(new URL("./data/schools.json", import.meta.url))
);

/**
 * From a large JSON payload calculates the distance between a supplied
 * point of origin cordinate and the data, sorts it, and returns the nearest x results.
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
export default async function (event, context, logger) {
  const data = event.data || {};
  logger.info(
    \`Invoking processlargedatajs Function with payload \${JSON.stringify(data)}\`
  );

  // validate the payload params
  if (!data.latitude || !data.longitude) {
    throw new Error(\`Please provide latitude and longitude\`);
  }

  // Sets 5 if length is not provided, also accepts length = 0
  const length = data.length ?? 5;

  // Iterate through the schools in the file and calculate the distance using the distance function below
  const schools = schoolsData.schools
    .map((school) => {
      return Object.assign({}, school, {
        distance: distance(
          data.latitude,
          data.longitude,
          school.latitude,
          school.longitude
        )
      });
    })
    // Sort schools by distance distance from the provided location
    .sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));

  // Assign the nearest x schools to the results constant based on the length property provided in the payload
  const results = schools.slice(0, length);

  // return the results
  return { schools: results };
}

/**
 * Calculate distance between two geographical points
 *
 * @param {string} latitudeSt:  represents the latitude of the origin point
 * @param {string} longitudeSt:  represents the longitude of the origin point
 * @param {string} latitudeSch:  represents the latitude of the school
 * @param {string} longitudeSch:  represents the longitude of the school
 * ....
 * @returns {number} distance between point a and b
 */
function distance(latitudeSt, longitudeSt, latitudeSch, longitudeSch) {
  if (latitudeSt == latitudeSch && longitudeSt == longitudeSch) {
    return 0;
  } else {
    const radLatitudeSf = (Math.PI * latitudeSt) / 180;
    const radLatitudeSch = (Math.PI * latitudeSch) / 180;
    const theta = longitudeSt - longitudeSch;
    const radTheta = (Math.PI * theta) / 180;
    let dist =
      Math.sin(radLatitudeSf) * Math.sin(radLatitudeSch) +
      Math.cos(radLatitudeSf) * Math.cos(radLatitudeSch) * Math.cos(radTheta);
    if (dist > 1) {
      dist = 1;
    }
    dist = Math.acos(dist);
    dist = (dist * 180) / Math.PI;
    dist = dist * 60 * 1.1515;
    return dist;
  }
}
`
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
                  body: `package com.salesforce.functions.recipes;

import com.google.gson.Gson;
import com.google.gson.stream.JsonReader;
import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.SalesforceFunction;
import java.io.FileReader;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * From a large JSON payload calculates the distance between a supplied point of origin cordinate
 * and the data, sorts it, and returns the nearest x results.
 */
public class ProcessLargeDataFunction implements SalesforceFunction<FunctionInput, FunctionOutput> {
  private static final Logger LOGGER = LoggerFactory.getLogger(ProcessLargeDataFunction.class);

  @Override
  public FunctionOutput apply(InvocationEvent<FunctionInput> event, Context context)
      throws Exception {
    // Read Input Parameters
    // - Point of Origin
    double latitudeSt = event.getData().getLatitude();
    double longitudeSt = event.getData().getLongitude();
    // - Number of results to return
    int length = event.getData().getLength();

    // Local Schools Database API by Code.org
    // License: CC BY-NC-SA 4.0
    // Url: https://code.org/learn/find-school/json
    // Read Schools JSON Database into memory
    JsonReader reader = new JsonReader(new FileReader("data/schools.json"));
    Gson gson = new Gson();
    JsonResponse response = gson.fromJson(reader, JsonResponse.class);

    // Calculate Distance from point of origin -> Sort by Distance -> Limit results
    List<School> schools =
        response.getSchools().stream()
            .map(
                school -> {
                  school.setDistance(
                      distance(
                          latitudeSt, longitudeSt, school.getLatitude(), school.getLongitude()));
                  return school;
                })
            .sorted(Comparator.comparingDouble(School::getDistance))
            .limit(length)
            .collect(Collectors.toList());

    LOGGER.info("Function successfully filtered {} schools", schools.size());

    return new FunctionOutput(schools);
  }

  /**
   * Calculate distance between two geographic points
   *
   * @param latitudeSt Latitude point of origin
   * @param longitudeSt Longitude point of origin
   * @param latitudeSch Latitude school
   * @param longitudeSch Longitude school
   * @return double Distance between point of origin and school
   */
  private double distance(
      double latitudeSt, double longitudeSt, double latitudeSch, double longitudeSch) {
    if (latitudeSt == latitudeSch && longitudeSt == longitudeSch) {
      return 0;
    } else {
      double radLatitudeSt = (Math.PI * latitudeSt) / 180;
      double radLatitudeSch = (Math.PI * latitudeSch) / 180;
      double theta = longitudeSt - longitudeSch;
      double radTheta = (Math.PI * theta) / 180;
      double dist =
          Math.sin(radLatitudeSt) * Math.sin(radLatitudeSch)
              + Math.cos(radLatitudeSt) * Math.cos(radLatitudeSch) * Math.cos(radTheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = (dist * 180) / Math.PI;
      return dist;
    }
  }
}
`
                },
                {
                  name: "FunctionInput.java",
                  label: "Function Input",
                  path: "/",
                  body: `package com.salesforce.functions.recipes;

public class FunctionInput {
  private double latitude;
  private double longitude;
  private int length;

  public FunctionInput() {}

  public FunctionInput(double latitude, double longitude, int length) {
    this.latitude = latitude;
    this.longitude = longitude;
    this.length = length;
  }

  public double getLatitude() {
    return latitude;
  }

  public double getLongitude() {
    return longitude;
  }

  public int getLength() {
    return length;
  }
}
`
                },
                {
                  name: "FunctionOutput.java",
                  label: "Function Output",
                  path: "/",
                  body: `package com.salesforce.functions.recipes;

import java.util.List;

public class FunctionOutput {
  private final List<School> schools;

  public FunctionOutput(List<School> schools) {
    this.schools = schools;
  }

  public List<School> getSchools() {
    return schools;
  }
}
`
                },
                {
                  name: "JavaResponse.java",
                  label: "Java Response",
                  path: "/",
                  body: `package com.salesforce.functions.recipes;

import java.util.List;

public class JsonResponse {
  private List<School> schools;

  public List<School> getSchools() {
    return schools;
  }

  public void setSchools(List<School> schools) {
    this.schools = schools;
  }
}
`
                },
                {
                  name: "School.java",
                  label: "School",
                  path: "/",
                  body: `package com.salesforce.functions.recipes;

public class School {
  private String name;
  private String website;
  private String description;
  private String[] levels;
  private String[] languages;
  private String format;
  private String format_description;
  private String street;
  private String city;
  private String state;
  private String zip;
  private String country;
  private double latitude;
  private double longitude;
  private double distance;

  public String getName() {
    return this.name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getWebsite() {
    return this.website;
  }

  public void setWebsite(String website) {
    this.website = website;
  }

  public String getDescription() {
    return this.description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String[] getLevels() {
    return this.levels;
  }

  public void setLevels(String[] levels) {
    this.levels = levels;
  }

  public String[] getLanguages() {
    return this.languages;
  }

  public void setLanguages(String[] languages) {
    this.languages = languages;
  }

  public String getFormat() {
    return this.format;
  }

  public void setFormat(String format) {
    this.format = format;
  }

  public String getFormat_description() {
    return this.format_description;
  }

  public void setFormat_description(String format_description) {
    this.format_description = format_description;
  }

  public String getStreet() {
    return this.street;
  }

  public void setStreet(String street) {
    this.street = street;
  }

  public String getCity() {
    return this.city;
  }

  public void setCity(String city) {
    this.city = city;
  }

  public String getState() {
    return this.state;
  }

  public void setState(String state) {
    this.state = state;
  }

  public String getZip() {
    return this.zip;
  }

  public void setZip(String zip) {
    this.zip = zip;
  }

  public String getCountry() {
    return this.country;
  }

  public void setCountry(String country) {
    this.country = country;
  }

  public double getLatitude() {
    return this.latitude;
  }

  public void setLatitude(double latitude) {
    this.latitude = latitude;
  }

  public double getLongitude() {
    return this.longitude;
  }

  public void setLongitude(double longitude) {
    this.longitude = longitude;
  }

  public double getDistance() {
    return this.distance;
  }

  public void setDistance(double distance) {
    this.distance = distance;
  }
}
`
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
                  body: `/**
 * Receives a payload and returns information about it.
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
export default async function (event, context, logger) {
  const data = event.data || {};
  logger.info(
    \`Invoking invocationeventjs with payload \${JSON.stringify(data)}\`
  );

  // Extract information from the event (https://cloudevents.io/)
  const { id, dataContentType, source, type, time } = event;
  const results = {
    id,
    data,
    dataContentType,
    source,
    type,
    time,
    payloadInfo: {}
  };

  // Identify the payload type
  if (typeof data === "object") {
    results.payloadInfo.type = "object";
    results.payloadInfo.keys = Object.keys(data);
  } else {
    throw new Error(\`Payload of type '\${typeof data}' not supported\`);
  }

  logger.info(JSON.stringify(results));
  return results;
}
`
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
                  body: `/**
 * Returns accounts and its contacts by keyword.
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
export default async function (event, context, logger) {
  logger.info(
    \`Invoking datapiqueryjs Function with payload \${JSON.stringify(
      event.data || {}
    )}\`
  );

  const keyword = event.data.keyword;
  if (!keyword || typeof keyword !== "string") {
    throw new Error("Please specify a keyword to search accounts");
  }

  const results = await context.org.dataApi.query(
    \`SELECT Id, Name, (SELECT Name, Email FROM Contacts) FROM Account WHERE Name LIKE '%\${keyword}%'\`
  );
  logger.info(JSON.stringify(results));
  return results;
}
`
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
                  body: `import { InvocationEvent, Context, Logger, Org } from "sf-fx-sdk-nodejs";

/**
 * Returns the Salesforce Org information attached to the context.
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
export default async function execute(
  event: InvocationEvent<any>,
  context: Context,
  logger: Logger
): Promise<OrgInfo> {
  logger.info(
    \`Invoking orginfots Function with payload \${JSON.stringify(
      event.data || {}
    )}\`
  );

  // Check if org is null or undefined
  if (context.org == null) {
    throw new Error("Function isn't bind to any organization");
  }

  // Extract Org info metadata into its own object and return it
  const orgInfo: OrgInfo = new OrgInfo(context.org);
  return orgInfo;
}

// OrgInfo represents Org's metadata
export class OrgInfo {
  apiVersion: string;
  baseUrl: string;
  domainUrl: string;
  id: string;
  user: any;

  constructor(org: Org) {
    this.apiVersion = org.apiVersion;
    this.baseUrl = org.baseUrl;
    this.domainUrl = org.domainUrl;
    this.id = org.id;
    this.user = org.user;
  }
}
`
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
                  body: `/**
 * Receives a payload containing account details, and creates the record.
 * It then uses a SOQL query to return the newly created Account.
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
export default async function (event, context, logger) {
  logger.info(
    \`Invoking salesforcesdkjs Function with payload \${JSON.stringify(
      event.data || {}
    )}\`
  );

  // Extract Properties from Payload
  const { name, accountNumber, industry, type, website } = event.data;

  // Validate the payload params
  if (!name) {
    throw new Error(\`Please provide account name\`);
  }

  // Define a record using the RecordForCreate type and providing the Developer Name
  const account = {
    type: "Account",
    fields: {
      Name: \`\${name}-\${Date.now()}\`,
      AccountNumber: accountNumber,
      Industry: industry,
      Type: type,
      Website: website
    }
  };

  try {
    // Insert the record using the SalesforceSDK DataApi and get the new Record Id from the result
    const { id: recordId } = await context.org.dataApi.create(account);

    // Query Accounts using the SalesforceSDK DataApi to verify that our new Account was created.
    const soql = \`SELECT Fields(STANDARD) FROM Account WHERE Id = '\${recordId}'\`;
    const queryResults = await context.org.dataApi.query(soql);
    return queryResults;
  } catch (err) {
    // Catch any DML errors and pass the throw an error with the message
    const errorMessage = \`Failed to insert record. Root Cause: \${err.message}\`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}
`
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
                  body: `package com.salesforce.functions.recipes;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.SalesforceFunction;
import com.salesforce.functions.jvm.sdk.data.DataApi;
import com.salesforce.functions.jvm.sdk.data.Record;
import com.salesforce.functions.jvm.sdk.data.RecordModificationResult;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * This function takes a payload containing account details, and creates the record. It then uses a
 * SOQL query to return the newly created Account.
 */
public class SalesforceSDKFunction implements SalesforceFunction<FunctionInput, FunctionOutput> {
  private static final Logger LOGGER = LoggerFactory.getLogger(SalesforceSDKFunction.class);

  @Override
  public FunctionOutput apply(InvocationEvent<FunctionInput> event, Context context)
      throws Exception {

    // Retrieve payload fields
    String accountName = event.getData().getName();

    if (accountName == null) {
      throw new Exception("Account Name is required");
    }

    String accountNumber = event.getData().getAccountNumber();
    String industry = event.getData().getIndustry();
    String type = event.getData().getType();
    String website = event.getData().getWebsite();

    // Insert the record using the SalesforceSDK DataApi and get the new Record Id from the result
    DataApi dataApi = context.getOrg().get().getDataApi();

    String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
    String accountNameWithTimestamp = String.format("%s-%s", accountName, timeStamp);

    Record account =
        dataApi
            .newRecordBuilder("Account")
            .withField("Name", accountNameWithTimestamp)
            .withField("AccountNumber", accountNumber)
            .withField("Industry", industry)
            .withField("Type", type)
            .withField("Website", website)
            .build();

    RecordModificationResult createResult = dataApi.create(account);

    // Query Accounts using the SalesforceSDK DataApi to verify that our new Account was created.
    String queryString =
        String.format("SELECT Id, Name FROM Account WHERE Id = '%s'", createResult.getId());
    List<Record> records = dataApi.query(queryString).getRecords();

    LOGGER.info("Function successfully queried {} account records!", records.size());

    List<Account> accounts = new ArrayList<>();
    for (Record record : records) {
      String id = record.getStringField("Id").get();
      String name = record.getStringField("Name").get();
      accounts.add(new Account(id, name));
    }

    return new FunctionOutput(accounts);
  }
}
`
                },
                {
                  name: "Account.java",
                  label: "Salesforce SDK",
                  body: `package com.salesforce.functions.recipes;

public class Account {
  private final String id;
  private final String name;

  public Account(String id, String name) {
    this.id = id;
    this.name = name;
  }

  public String getId() {
    return id;
  }

  public String getName() {
    return name;
  }
}
`
                },
                {
                  name: "FunctionInput.java",
                  label: "Salesforce SDK",
                  body: `package com.salesforce.functions.recipes;

public class FunctionInput {
  private String name;
  private String accountNumber;
  private String industry;
  private String type;
  private String website;

  public FunctionInput() {}

  public FunctionInput(
      String name, String accountNumber, String industry, String type, String website) {
    this.name = name;
    this.accountNumber = accountNumber;
    this.industry = industry;
    this.type = type;
    this.website = website;
  }

  public String getName() {
    return this.name;
  }

  public String getAccountNumber() {
    return this.accountNumber;
  }

  public String getIndustry() {
    return this.industry;
  }

  public String getType() {
    return this.type;
  }

  public String getWebsite() {
    return this.website;
  }
}
`
                },
                {
                  name: "FunctionOutput.java",
                  label: "Salesforce SDK",
                  body: `package com.salesforce.functions.recipes;

import java.util.List;

public class FunctionOutput {
  private final List<Account> accounts;

  public FunctionOutput(List<Account> accounts) {
    this.accounts = accounts;
  }

  public List<Account> getAccounts() {
    return accounts;
  }
}
`
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
                  body: `/**
 * Receives a payload containing Account, Contact, and Case details and uses the
 * Unit of Work pattern to assign the corresponding values to to its Record
 * while maintaining the relationships. It then commits the unit of work and
 * returns the Record Id's for each object.
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
export default async function (event, context, logger) {
  logger.info(
    \`Invoking unitofworkjs Function with payload \${JSON.stringify(
      event.data || {}
    )}\`
  );

  // Validate Input
  const payload = event.data;
  validateField("accountName", payload.accountName);
  validateField("lastName", payload.lastName);
  validateField("subject", payload.subject);

  // Create a unit of work that inserts multiple objects.
  const uow = context.org.dataApi.newUnitOfWork();

  // Register a new Account for Creation
  const accountId = uow.registerCreate({
    type: "Account",
    fields: {
      Name: payload.accountName
    }
  });

  // Register a new Contact for Creation
  const contactId = uow.registerCreate({
    type: "Contact",
    fields: {
      FirstName: payload.firstName,
      LastName: payload.lastName,
      AccountId: accountId // Get the ReferenceId from previous operation
    }
  });

  // Register a new Case for Creation
  const serviceCaseId = uow.registerCreate({
    type: "Case",
    fields: {
      Subject: payload.subject,
      Description: payload.description,
      Origin: "Web",
      Status: "New",
      AccountId: accountId, // Get the ReferenceId from previous operation
      ContactId: contactId // Get the ReferenceId from previous operation
    }
  });

  // Register a follow up Case for Creation
  const followupCaseId = uow.registerCreate({
    type: "Case",
    fields: {
      ParentId: serviceCaseId, // Get the ReferenceId from previous operation
      Subject: "Follow Up",
      Description: "Follow up with Customer",
      Origin: "Web",
      Status: "New",
      AccountId: accountId, // Get the ReferenceId from previous operation
      ContactId: contactId // Get the ReferenceId from previous operation
    }
  });

  try {
    // Commit the Unit of Work with all the previous registered operations
    const response = await context.org.dataApi.commitUnitOfWork(uow);
    // Construct the result by getting the Id from the successful inserts
    const result = {
      accountId: response.get(accountId).id,
      contactId: response.get(contactId).id,
      cases: {
        serviceCaseId: response.get(serviceCaseId).id,
        followupCaseId: response.get(followupCaseId).id
      }
    };
    return result;
  } catch (err) {
    const errorMessage = \`Failed to insert record. Root Cause : \${err.message}\`;
    logger.error(errorMessage);
    throw new Error(errorMessage);
  }
}

/**
 * Throws an Error if a value isn't present
 * @param {String} field
 * @param {any} value
 */
function validateField(field, value) {
  if (!value) throw new Error(\`Please provide \${field}\`);
}
`
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
                  body: `package com.salesforce.functions.recipes;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.SalesforceFunction;
import com.salesforce.functions.jvm.sdk.data.DataApi;
import com.salesforce.functions.jvm.sdk.data.Record;
import com.salesforce.functions.jvm.sdk.data.RecordModificationResult;
import com.salesforce.functions.jvm.sdk.data.ReferenceId;
import com.salesforce.functions.jvm.sdk.data.builder.UnitOfWorkBuilder;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Receives a payload containing Account, Contact, and Case details and uses the Unit of Work
 * pattern to assign the corresponding values to to its Record while maintaining the relationships.
 * It then commits the unit of work and returns the Record Id's for each object.
 */
public class UnitOfWorkFunction implements SalesforceFunction<FunctionInput, FunctionOutput> {
  private static final Logger LOGGER = LoggerFactory.getLogger(UnitOfWorkFunction.class);

  @Override
  public FunctionOutput apply(InvocationEvent<FunctionInput> event, Context context)
      throws Exception {

    String accountName = event.getData().getAccountName();
    String firstName = event.getData().getFirstName();
    String lastName = event.getData().getLastName();
    String subject = event.getData().getSubject();
    String description = event.getData().getDescription();

    DataApi dataApi = context.getOrg().get().getDataApi();

    // Create a Unit of Work that inserts multiple objects
    UnitOfWorkBuilder unitOfWork = dataApi.newUnitOfWorkBuilder();

    // You can use the DataApi to create a new Record
    Record account = dataApi.newRecordBuilder("Account").withField("Name", accountName).build();
    // A ReferenceId will be returned to assign relationships with other objects within the same
    // transaction
    ReferenceId accountRefId = unitOfWork.registerCreate(account);

    Record contact =
        dataApi
            .newRecordBuilder("Contact")
            .withField("FirstName", firstName)
            .withField("LastName", lastName)
            .withField("AccountId", accountRefId)
            .build();
    ReferenceId contactRefId = unitOfWork.registerCreate(contact);

    // Here we are using the accountRefId and contactRefId to specify the relationship with the
    // temporary Id's created by the Unit of Work builder
    Record serviceCase =
        dataApi
            .newRecordBuilder("Case")
            .withField("Subject", subject)
            .withField("Description", description)
            .withField("Origin", "Web")
            .withField("Status", "New")
            .withField("AccountId", accountRefId)
            .withField("ContactId", contactRefId)
            .build();
    ReferenceId serviceCaseRefId = unitOfWork.registerCreate(serviceCase);

    Record followupCase =
        dataApi
            .newRecordBuilder("Case")
            .withField("ParentId", serviceCaseRefId)
            .withField("Subject", "Follow Up")
            .withField("Description", "Follow up with Customer")
            .withField("Origin", "Web")
            .withField("Status", "New")
            .withField("AccountId", accountRefId)
            .withField("ContactId", contactRefId)
            .build();
    ReferenceId followupCaseRefId = unitOfWork.registerCreate(followupCase);

    // The transaction will be committed and all the objects are going to be created.
    // The resulting map contains the Id's of the created objects
    Map<ReferenceId, RecordModificationResult> result =
        dataApi.commitUnitOfWork(unitOfWork.build());

    LOGGER.info("Function successfully commited UoW with {} affected records!", result.size());

    // Construct the result by getting de Id's from the created objects
    return new FunctionOutput(
        result.get(accountRefId).getId(),
        result.get(contactRefId).getId(),
        new Cases(result.get(serviceCaseRefId).getId(), result.get(followupCaseRefId).getId()));
  }
}
`
                },
                {
                  name: "FunctionInput.java",
                  label: "Salesforce SDK",
                  body: `package com.salesforce.functions.recipes;

public class FunctionInput {
  private String accountName;
  private String firstName;
  private String lastName;
  private String subject;
  private String description;

  public FunctionInput() {}

  public FunctionInput(
      String accountName, String firstName, String lastName, String subject, String description) {
    this.accountName = accountName;
    this.firstName = firstName;
    this.lastName = lastName;
    this.subject = subject;
    this.description = description;
  }

  public String getAccountName() {
    return this.accountName;
  }

  public String getFirstName() {
    return this.firstName;
  }

  public String getLastName() {
    return this.lastName;
  }

  public String getSubject() {
    return this.subject;
  }

  public String getDescription() {
    return this.description;
  }
}
`
                },
                {
                  name: "FunctionOutput.java",
                  label: "UnitOfWork",
                  body: `package com.salesforce.functions.recipes;

public class FunctionOutput {
  private final String accountId;
  private final String contactId;
  private final Cases cases;

  public FunctionOutput(String accountId, String contactId, Cases cases) {
    this.accountId = accountId;
    this.contactId = contactId;
    this.cases = cases;
  }

  public String getAccountId() {
    return this.accountId;
  }

  public String getContactId() {
    return this.contactId;
  }

  public Cases getCases() {
    return this.cases;
  }
}
`
                },
                {
                  name: "Cases.java",
                  label: "UnitOfWork",
                  body: `package com.salesforce.functions.recipes;

public class Cases {
  private final String serviceCaseId;
  private final String followupCaseId;

  public Cases(String serviceCaseId, String followupCaseId) {
    this.serviceCaseId = serviceCaseId;
    this.followupCaseId = followupCaseId;
  }

  public String getServiceCaseId() {
    return serviceCaseId;
  }

  public String getFollowupCaseId() {
    return followupCaseId;
  }
}
`
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
                  body: `/**
 * Generates an amount of log messages every number of seconds.
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
export default async function (event, context, logger) {
  logger.info(
    \`Invoking loggerjs Function with payload \${JSON.stringify(
      event.data || {}
    )}\`
  );

  let { amount = 5, timeout = 5 } = event.data;

  let count = 0;
  setInterval(() => {
    if (+amount <= count) return;
    count++;

    logger.info(
      \`\${count} \${
        count == 1 ? "elephant" : "elephants"
      } balancing over a spiderweb at \${new Date()}\`
    );
  }, timeout * 1000);

  return {
    status: \`Logger Started: Generating \${amount} log messages every \${timeout} seconds\`
  };
}
`
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
                  body: `import crypto from "crypto";
import { promisify } from "util";

// Turn pbkdf2 function from callback based to Promises
const pbkdf2 = promisify(crypto.pbkdf2);

/**
 * Returns the derivate password hash using pbkdf2 getting the salt from the Environment.
 *
 * The exported method is the entry point for your code when the function is invoked.
 *
 * Following parameters are pre-configured and provided to your function on execution:
 * @param event: represents the data associated with the occurrence of an event, and
 *                 supporting metadata about the source of that occurrence.
 * @param context: represents the connection to Functions and your Salesforce org.
 * @param logger: logging handler used to capture application logs and trace specifically
 *                 to a given execution of a function.
 */
export default async function (event, context, logger) {
  logger.info(
    \`Invoking environmentjs Function with payload \${JSON.stringify(
      event.data || {}
    )}\`
  );

  const keyLength = event.data.keyLength || 32;
  const password = event.data.password;

  if (!password || typeof password !== "string") {
    throw new Error("Please provide a password to encrypt");
  }

  // Get secret "salt" from "private" secrets store
  const salt = process.env.PASSWORD_SALT;
  if (!salt) {
    throw new Error("Please setup PASSWORD_SALT as Environment Variable");
  }

  // Calculate the password derivate using the pbkdf2 algorithm
  // More information can be found here:
  // https://nodejs.org/dist/latest-v14.x/docs/api/crypto.html#crypto_crypto_pbkdf2_password_salt_iterations_keylen_digest_callback
  const results = await pbkdf2(password, salt, 10e3, keyLength, "sha512");
  return results.toString("hex");
}
`
                }
              ]
            }
          ]
        }
      ];
    }
  };
})();
