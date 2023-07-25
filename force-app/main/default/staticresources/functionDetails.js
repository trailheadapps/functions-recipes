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
                body: `import { readFileSync } from "node:fs";

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
              },
              {
                name: "index.test.js",
                body: `import { expect } from "chai";
import { readFileSync } from "node:fs";
import { createSandbox } from "sinon";

import execute from "../index.js";
const payload = JSON.parse(
  readFileSync(new URL("../data/sample-payload.json", import.meta.url))
);

/**
 * processlargedatajs Function unit tests.
 */
describe("Unit Tests", () => {
  let sandbox;
  let mockContext;
  let mockLogger;

  beforeEach(() => {
    mockContext = {
      logger: { info: () => {} }
    };

    mockLogger = mockContext.logger;
    sandbox = createSandbox();

    sandbox.stub(mockLogger, "info");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke ProcessLargeData with valid data", async () => {
    // Invoke function
    const results = await execute({ data: payload }, mockContext, mockLogger);

    // Validate
    expect(results).to.be.not.undefined;
    expect(results.schools).to.be.an("array");
    expect(results.schools.length).to.be.eql(payload.length);
    expect(results.schools[0].distance).to.be.closeTo(0.235389, 0.000001);
  });

  it("Invoke ProcessLargeData with missing coordinates", async () => {
    try {
      // Invoke function with missing coordinates
      await execute({ data: {} }, mockContext, mockLogger);
    } catch (err) {
      expect(mockLogger.info.callCount).to.be.eql(1);
      expect(err.message).to.match(/provide latitude and longitude/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });
});
`
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
      dist = dist * 60 * 1.1515;
      return dist;
    }
  }
}
`
              },
              {
                name: "FunctionInput.java",
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

  @Override
  public String toString() {
    return "FunctionInput [latitude=" + latitude + ", longitude=" + longitude + ", length=" + length
        + "]";
  }
}
`
              },
              {
                name: "FunctionOutput.java",
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
                name: "JsonResponse.java",
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
              },
              {
                name: "FunctionTest.java",
                body: `package com.salesforce.functions.recipes;

import static org.junit.Assert.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import org.junit.Test;

public class FunctionTest {

  @Test
  public void testSuccess() throws Exception {
    ProcessLargeDataFunction function = new ProcessLargeDataFunction();
    InvocationEvent<FunctionInput> eventMock = createEventMock(36.169090, -115.140579, 5);
    int length = eventMock.getData().getLength();
    FunctionOutput functionOutput = function.apply(eventMock, createContextMock());
    assertEquals(functionOutput.getSchools().size(), length);
    assertEquals(0.235389, functionOutput.getSchools().get(0).getDistance(), 0.000001);
  }

  @Test
  public void testNoParams() throws Exception {
    ProcessLargeDataFunction function = new ProcessLargeDataFunction();
    InvocationEvent<FunctionInput> eventMock = createEventMock();
    FunctionOutput functionOutput = function.apply(eventMock, createContextMock());
    assertEquals(functionOutput.getSchools().size(), 0);
  }

  private Context createContextMock() {
    return mock(Context.class);
  }

  @SuppressWarnings("unchecked")
  private InvocationEvent<FunctionInput> createEventMock(
      double latitude, double longitude, int length) {
    InvocationEvent<FunctionInput> eventMock = mock(InvocationEvent.class);
    when(eventMock.getData()).thenReturn(new FunctionInput(latitude, longitude, length));
    return eventMock;
  }

  @SuppressWarnings("unchecked")
  private InvocationEvent<FunctionInput> createEventMock() {
    InvocationEvent<FunctionInput> eventMock = mock(InvocationEvent.class);
    when(eventMock.getData()).thenReturn(new FunctionInput());
    return eventMock;
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
              },
              {
                name: "index.test.js",
                body: `import { expect } from "chai";
import { createSandbox } from "sinon";

import execute from "../index.js";

/**
 * invocationeventjs Function unit tests.
 */
describe("Unit Tests", () => {
  let time = Date.now();
  const event = {
    id: "c0ffee-00000-00000-00000000",
    dataContentType: "application/json; charset=utf-8",
    source: "urn:event:from:test",
    type: "com.evergreen.functions.test",
    time
  };

  let sandbox;
  let mockContext;
  let mockLogger;
  let mockEvent;

  beforeEach(() => {
    mockEvent = event;
    mockContext = {
      logger: { info: () => {} }
    };

    mockLogger = mockContext.logger;
    sandbox = createSandbox();

    sandbox.stub(mockLogger, "info");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke InvocationEvent with an object", async () => {
    // Invoke function
    mockEvent.data = {
      name: "payload",
      is: "object"
    };
    const results = await execute(mockEvent, mockContext, mockLogger);

    // Validate CloudEvent
    expect(mockLogger.info.callCount).to.be.eql(2);
    expect(results).to.be.not.undefined;
    expect(results.id).to.be.eql(event.id);
    expect(results.dataContentType).to.be.eql(event.dataContentType);
    expect(results.source).to.eql(event.source);
    expect(results.type).to.eql(event.type);
    expect(results.time).to.eql(event.time);

    // Validate payload info
    expect(results.payloadInfo).has.property("keys");
    expect(results.payloadInfo.keys).to.be.deep.eql(["name", "is"]);
    expect(results.payloadInfo.type).to.be.eql("object");
  });

  it("Invoke InvocationEvent with a number (invalid data)", async () => {
    try {
      // Invoke function with invalid input
      mockEvent.data = 42;
      await execute(mockEvent, mockContext, mockLogger);
    } catch (err) {
      expect(err).to.be.not.null;
      expect(err.message).to.match(/not supported/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });
});
`
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
              },
              {
                name: "index.test.js",
                body: `import { expect } from "chai";
import { createSandbox } from "sinon";

import execute from "../index.js";

/**
 * dataapiqueryjs Function unit tests.
 */
describe("Unit Tests", () => {
  let sandbox;
  let mockContext;
  let mockLogger;

  beforeEach(() => {
    mockContext = {
      org: {
        dataApi: { query: () => {} }
      },
      logger: { info: () => {} }
    };

    mockLogger = mockContext.logger;
    sandbox = createSandbox();

    sandbox.stub(mockContext.org.dataApi, "query");
    sandbox.stub(mockLogger, "info");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke dataapiqueryjs Function with keyword", async () => {
    // Mock Accounts query
    const accounts = {
      totalSize: 1,
      done: true,
      records: [
        {
          attributes: {
            type: "Account",
            url: "/services/data/v56.0/sobjects/Account/0018A00000bmUOkQAM"
          },
          Id: "0018A00000bmUOkQAM",
          Name: "Burlington Textiles Corp of America",
          Contacts: {
            totalSize: 1,
            done: true,
            records: [
              {
                attributes: {
                  type: "Contact",
                  url: "/services/data/v56.0/sobjects/Contact/0038A00000YJqSvQAL"
                },
                Name: "Jack Rogers",
                Email: "jrogers@burlington.com"
              }
            ]
          }
        }
      ]
    };

    mockContext.org.dataApi.query.callsFake(() => {
      return Promise.resolve(accounts);
    });

    // Invoke function
    const results = await execute(
      { data: { keyword: "america" } },
      mockContext,
      mockLogger
    );

    // Validate
    expect(mockContext.org.dataApi.query.callCount).to.be.eql(1);
    expect(mockLogger.info.callCount).to.be.eql(2);
    expect(results).to.be.not.undefined;
    expect(results).has.property("totalSize");
    expect(results.totalSize).to.be.eql(accounts.totalSize);
  });

  it("Invoke dataapiqueryjs Function without keyword", async () => {
    try {
      // Invoke function without keyword
      await execute({ data: {} }, mockContext, mockLogger);
    } catch (err) {
      expect(mockContext.org.dataApi.query.callCount).to.be.eql(0);
      expect(mockLogger.info.callCount).to.be.eql(1);
      expect(err).to.be.not.null;
      expect(err.message).to.match(/specify a keyword/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });
});
`
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
              },
              {
                name: "index.test.ts",
                body: `import "mocha";
import { expect } from "chai";
import { createSandbox, SinonSandbox } from "sinon";

import execute from "../index";
import { OrgInfo } from "../dist";

/**
 * orginfots Function unit tests.
 */
describe("Unit Tests", () => {
  let sandbox: SinonSandbox;
  let mockContext;
  let mockLogger;

  beforeEach(() => {
    sandbox = createSandbox();
    mockContext = {
      org: {
        id: "00D2F00C00L0RG",
        apiVersion: "56.0",
        baseUrl: "https://test.my.salesforce.com",
        domainUrl: "https://test.my.salesforce.com",
        user: {
          id: "",
          username: "test@salesforce.com",
          onBehalfOfUserId: ""
        },
        dataApi: { query: () => undefined }
      },
      logger: { info: () => undefined }
    };
    mockLogger = mockContext.logger;
    sandbox.stub(mockContext.org.dataApi, "query");
    sandbox.stub(mockLogger, "info");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke OrgInfo Function without an org", async () => {
    try {
      // Invoke function without a bind Org
      mockContext.org = null;
      await execute({ data: {} } as any, mockContext, mockLogger);
    } catch (err) {
      expect(err).to.be.not.null;
      expect(err.message).to.match(/isn't bind to any organization/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });

  it("Invoke OrgInfo Function with an org", async () => {
    // Invoke function with a bind Org
    const result: OrgInfo = await execute(
      { data: {} } as any,
      mockContext,
      mockLogger
    );

    expect(result).to.not.be.undefined;
    expect(result.id).to.be.eq(mockContext.org.id);
    expect(result.apiVersion).to.be.eq(mockContext.org.apiVersion);
    expect(result.baseUrl).to.be.eq(mockContext.org.baseUrl);
    expect(result.domainUrl).to.be.eq(mockContext.org.domainUrl);
    expect(result.user).to.be.deep.equal(mockContext.org.user);
  });
});
`
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
              },
              {
                name: "index.test.js",
                body: `import { expect } from "chai";
import { createSandbox } from "sinon";
import { readFileSync } from "fs";
import execute from "../index.js";

const testResponse = JSON.parse(
  readFileSync(new URL("../data/test-data.json", import.meta.url))
);
const testPayload = JSON.parse(
  readFileSync(new URL("../data/sample-payload.json", import.meta.url))
);
const testInvalidPayload = JSON.parse(
  readFileSync(new URL("../data/sample-invalid-payload.json", import.meta.url))
);

/**
 * salesforcesdkjs Function unit tests.
 */
describe("Unit Tests", () => {
  let sandbox;
  let mockContext;
  let mockLogger;

  beforeEach(() => {
    mockContext = {
      org: {
        dataApi: { query: () => {}, create: () => {} }
      },
      logger: { info: () => {}, error: () => {} }
    };

    mockLogger = mockContext.logger;
    sandbox = createSandbox();

    sandbox.stub(mockContext.org.dataApi, "query");
    sandbox.stub(mockContext.org.dataApi, "create");
    sandbox.stub(mockLogger, "info");
    sandbox.stub(mockLogger, "error");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke salesforcesdkjs Function with correct data", async () => {
    const accounts = testResponse;
    const payload = testPayload;

    mockContext.org.dataApi.create.callsFake(() => {
      return Promise.resolve({ id: "0010x00001Di8z7AAB" });
    });

    mockContext.org.dataApi.query.callsFake(() => {
      return Promise.resolve(accounts);
    });

    // Invoke function
    const results = await execute({ data: payload }, mockContext, mockLogger);

    // Validate
    expect(mockContext.org.dataApi.create.callCount).to.be.eql(1);
    expect(mockContext.org.dataApi.query.callCount).to.be.eql(1);
    expect(results).to.be.not.undefined;
    expect(results.totalSize).to.be.eql(accounts.totalSize);
  });

  it("Invoke salesforcesdkjs Function without an Account Name", async () => {
    const payload = {};

    try {
      // Invoke function with an empty payload
      await execute({ data: payload }, mockContext, mockLogger);
    } catch (err) {
      expect(err).to.be.not.null;
      expect(err.message).to.match(/provide account name/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });

  it("Invoke salesforcesdkjs Function with an invalid payload", async () => {
    const payload = testInvalidPayload;

    // Simulate a DML error
    mockContext.org.dataApi.create.callsFake(() => {
      return Promise.reject(new Error("error"));
    });

    // Invoke function
    try {
      await execute({ data: payload }, mockContext, mockLogger);
    } catch (err) {
      expect(err).to.be.not.null;
      expect(err.message).to.match(
        /Failed to insert record. Root Cause: error/
      );
    }
  });
});
`
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
                body: `package com.salesforce.functions.recipes;

public class FunctionInput {
  private String name;
  private String accountNumber;
  private String industry;
  private String type;
  private String website;

  public FunctionInput() {}

  public FunctionInput(String name, String accountNumber, String industry, String type,
      String website) {
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

  @Override
  public String toString() {
    return "FunctionInput [name=" + this.name + ", accountNumber=" + this.accountNumber
        + ", industry=" + this.industry + ", type=" + this.type + ", website=" + this.website + "]";
  }
}
`
              },
              {
                name: "FunctionOutput.java",
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
              },
              {
                name: "FunctionTest.java",
                body: `package com.salesforce.functions.recipes;

import static com.spotify.hamcrest.pojo.IsPojo.pojo;
import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.equalTo;
import static org.hamcrest.Matchers.hasItems;
import static org.hamcrest.beans.HasPropertyWithValue.hasProperty;
import static org.hamcrest.core.StringContains.containsString;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.Org;
import com.salesforce.functions.jvm.sdk.data.Record;
import com.salesforce.functions.jvm.sdk.data.RecordModificationResult;
import com.salesforce.functions.jvm.sdk.data.RecordQueryResult;
import com.salesforce.functions.jvm.sdk.data.error.DataApiError;
import com.salesforce.functions.jvm.sdk.data.error.DataApiException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;
import org.junit.Test;
import org.mockito.Mockito;

public class FunctionTest {

  @Test
  public void testValid() throws Exception {
    SalesforceSDKFunction function = new SalesforceSDKFunction();
    FunctionInput input = createValidInput();
    FunctionOutput functionOutput =
        function.apply(createEventMock(input), createValidContextMock(input));

    assertThat(
        functionOutput.getAccounts(),
        hasItems(
            pojo(Account.class)
                .withProperty("id", equalTo("5003000000D8cuIQAA"))
                .withProperty("name", containsString("MyAccount"))));
  }

  @Test
  public void testInvalid() throws Exception {
    SalesforceSDKFunction function = new SalesforceSDKFunction();
    FunctionInput functionInput = createInvalidInput();

    // Assert a specific DataApiExeption containing an input validation error
    DataApiException ex =
        assertThrows(
            DataApiException.class,
            () -> {
              function.apply(createEventMock(functionInput), createInvalidContext(functionInput));
            });

    assertThat(ex.getDataApiErrors(), contains(hasProperty("errorCode", is("STRING_TOO_LONG"))));
    assertEquals("One or more API errors occurred", ex.getMessage());
  }

  @Test
  public void testEmpty() throws Exception {
    SalesforceSDKFunction function = new SalesforceSDKFunction();
    FunctionInput functionInput = createEmptyInput();

    // Assert a generic Exception
    assertThrows(
        Exception.class,
        () -> {
          function.apply(createEventMock(functionInput), createEmptyContext(functionInput));
        });
  }

  private Context createValidContextMock(FunctionInput input) {
    Context mockContext = mock(Context.class);

    when(mockContext.getOrg())
        .then(
            i1 -> {
              Org mockOrg = mock(Org.class, Mockito.RETURNS_DEEP_STUBS);

              Record accountRecord = mock(Record.class);
              RecordModificationResult createResult = mock(RecordModificationResult.class);
              String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
              String accountNameWithTimestamp = String.format("%s-%s", input.getName(), timeStamp);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Account")
                      .withField("Name", accountNameWithTimestamp)
                      .withField("AccountNumber", input.getAccountNumber())
                      .withField("Industry", input.getIndustry())
                      .withField("Type", input.getType())
                      .withField("Website", input.getWebsite())
                      .build())
                  .thenReturn(accountRecord);

              when(mockOrg.getDataApi().create(accountRecord)).thenReturn(createResult);
              when(createResult.getId()).thenReturn("5003000000D8cuIQAA");

              String queryString =
                  String.format(
                      "SELECT Id, Name FROM Account WHERE Id = '%s'", createResult.getId());
              when(mockOrg.getDataApi().query(queryString))
                  .then(
                      i2 -> {
                        RecordQueryResult mockResult = mock(RecordQueryResult.class);

                        Record firstRecord = mock(Record.class);
                        when(firstRecord.getStringField("Id"))
                            .thenReturn(Optional.of("5003000000D8cuIQAA"));
                        when(firstRecord.getStringField("Name"))
                            .thenReturn(Optional.of(accountNameWithTimestamp));

                        when(mockResult.getRecords()).thenReturn(Arrays.asList(firstRecord));

                        return mockResult;
                      });

              return Optional.of(mockOrg);
            });

    return mockContext;
  }

  /**
   * Create a mock for Context with an invalid input
   *
   * @param input
   * @return Context
   */
  private Context createInvalidContext(FunctionInput input) {
    Context mockContext = mock(Context.class);

    when(mockContext.getOrg())
        .then(
            i1 -> {
              Org mockOrg = mock(Org.class, Mockito.RETURNS_DEEP_STUBS);

              Record accountRecord = mock(Record.class);
              String timeStamp = new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date());
              String accountNameWithTimestamp = String.format("%s-%s", input.getName(), timeStamp);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Account")
                      .withField("Name", accountNameWithTimestamp)
                      .withField("AccountNumber", input.getAccountNumber())
                      .withField("Industry", input.getIndustry())
                      .withField("Type", input.getType())
                      .withField("Website", input.getWebsite())
                      .build())
                  .thenReturn(accountRecord);

              // Create a custom DataApiError for input validation
              List<DataApiError> errors = new ArrayList<>();
              DataApiError validationError =
                  new DataApiError() {

                    @Override
                    public String getMessage() {
                      return "Last Name: data value too large: This is a very long string that"
                          + " isn't valid in this line, please reduce it. (max length=80)";
                    }

                    @Override
                    public String getErrorCode() {
                      return "STRING_TOO_LONG";
                    }

                    @Override
                    public List<String> getFields() {
                      return List.of("AccountNumber");
                    }
                  };
              errors.add(validationError);
              when(mockOrg.getDataApi().create(accountRecord))
                  .thenThrow(new DataApiException("One or more API errors occurred", errors));

              return Optional.of(mockOrg);
            });

    return mockContext;
  }

  /**
   * Create a mock for Context with an empty input
   *
   * @param input
   * @return Context
   */
  private Context createEmptyContext(FunctionInput input) {
    return mock(Context.class);
  }

  /**
   * Creates a valid Input Object
   *
   * @return FunctionInput
   */
  private FunctionInput createValidInput() {
    return new FunctionInput("MyAccount", "123456789", "Technology", "prospect", "salesforce.com");
  }

  /**
   * Creates an empty Input Object
   *
   * @return FunctionInput
   */
  private FunctionInput createEmptyInput() {
    return new FunctionInput();
  }

  /**
   * Creates an invalid Input Object
   *
   * @return FunctionInput
   */
  private FunctionInput createInvalidInput() {
    return new FunctionInput(
        "MyAccount",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "Technology",
        "prospect",
        "salesforce.com");
  }

  /**
   * Creates a mock for InvocationEvent
   *
   * @param input FunctionInput
   * @return InvocationEvent<FunctionInput>
   */
  @SuppressWarnings("unchecked")
  private InvocationEvent<FunctionInput> createEventMock(FunctionInput input) {
    InvocationEvent<FunctionInput> mockEvent = mock(InvocationEvent.class);
    when(mockEvent.getData()).thenReturn(input);
    return mockEvent;
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
              },
              {
                name: "index.test.js",
                body: `import { expect } from "chai";
import { createSandbox } from "sinon";
import { readFileSync } from "fs";
import execute from "../index.js";

const testPayload = JSON.parse(
  readFileSync(new URL("../data/sample-payload.json", import.meta.url))
);

/**
 * unitofworkjs Function unit tests.
 */
describe("Unit Tests", () => {
  let sandbox;
  let mockContext;
  let mockLogger;
  let mockResponse;
  let mockUnitOfWork;

  const resultIds = {
    accountId: "0012F000ACTFN",
    contactId: "0012F000CTCFN",
    serviceCaseId: "0012F000CSELFN",
    folowupCaseId: "0012F000CSALFN"
  };

  beforeEach(() => {
    mockContext = {
      org: {
        dataApi: { newUnitOfWork: () => {}, commitUnitOfWork: () => {} },
        user: { id: "0052F000009KLZS" }
      },
      logger: { info: () => {}, error: () => {} }
    };
    mockUnitOfWork = {
      registerCreate: () => {}
    };
    mockResponse = {
      get: () => {}
    };
    mockLogger = mockContext.logger;

    sandbox = createSandbox();
    sandbox.stub(mockContext.org.dataApi, "newUnitOfWork");
    sandbox.stub(mockContext.org.dataApi, "commitUnitOfWork");
    sandbox.stub(mockUnitOfWork, "registerCreate");
    sandbox.stub(mockResponse, "get");
    sandbox.stub(mockLogger, "info");
    sandbox.stub(mockLogger, "error");
    mockContext.org.dataApi.newUnitOfWork.callsFake(() => {
      return mockUnitOfWork;
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke unitofworkjs Function successfully", async () => {
    mockUnitOfWork.registerCreate.callsFake(() => {
      return "referenceId";
    });
    mockResponse.get.onCall(0).returns({ id: "0012F000ACTFN" });
    mockResponse.get.onCall(1).returns({ id: "0012F000CTCFN" });
    mockResponse.get.onCall(2).returns({ id: "0012F000CSELFN" });
    mockResponse.get.onCall(3).returns({ id: "0012F000CSALFN" });

    // set the mock promise response for work.commit()
    mockContext.org.dataApi.commitUnitOfWork.callsFake(() => {
      return Promise.resolve(mockResponse);
    });

    // Invoke functions
    const results = await execute(
      { data: testPayload },
      mockContext,
      mockLogger
    );

    // Validate
    expect(mockContext.org.dataApi.commitUnitOfWork.callCount).to.be.eql(1);
    expect(results).to.be.not.undefined;
    expect(results).has.property("accountId");
    expect(results).has.property("contactId");
    expect(results).has.property("cases");
    expect(results.accountId).to.be.eql(resultIds.accountId);
    expect(results.contactId).to.be.eql(resultIds.contactId);
    expect(results.cases.serviceCaseId).to.be.eql(resultIds.serviceCaseId);
    expect(results.cases.followupCaseId).to.be.eql(resultIds.folowupCaseId);
  });
});
`
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
                body: `package com.salesforce.functions.recipes;

public class FunctionInput {
  private String accountName;
  private String firstName;
  private String lastName;
  private String subject;
  private String description;

  public FunctionInput() {}

  public FunctionInput(String accountName, String firstName, String lastName, String subject,
      String description) {
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

  @Override
  public String toString() {
    return "FunctionInput [accountName=" + this.accountName + ", firstName=" + this.firstName
        + ", lastName=" + this.lastName + ", subject=" + this.subject + ", description="
        + this.description + "]";
  }
}
`
              },
              {
                name: "FunctionOutput.java",
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
              },
              {
                name: "FunctionTest.java",
                body: `package com.salesforce.functions.recipes;

import static org.hamcrest.CoreMatchers.is;
import static org.hamcrest.MatcherAssert.assertThat;
import static org.hamcrest.Matchers.contains;
import static org.hamcrest.beans.HasPropertyWithValue.hasProperty;
import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.Org;
import com.salesforce.functions.jvm.sdk.data.Record;
import com.salesforce.functions.jvm.sdk.data.RecordModificationResult;
import com.salesforce.functions.jvm.sdk.data.ReferenceId;
import com.salesforce.functions.jvm.sdk.data.UnitOfWork;
import com.salesforce.functions.jvm.sdk.data.builder.UnitOfWorkBuilder;
import com.salesforce.functions.jvm.sdk.data.error.DataApiError;
import com.salesforce.functions.jvm.sdk.data.error.DataApiException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.junit.Test;
import org.mockito.Mockito;

public class FunctionTest {

  @Test
  public void testSuccess() throws Exception {
    UnitOfWorkFunction function = new UnitOfWorkFunction();

    FunctionInput functionInput = createValidInput();
    FunctionOutput functionOutput =
        function.apply(createEventMock(functionInput), createValidContextMock(functionInput));

    assertEquals("0019A00000J28zaQAB", functionOutput.getAccountId());
    assertEquals("0039A00000DkhvnQAB", functionOutput.getContactId());
    assertEquals("5009A000002GYCrQAO", functionOutput.getCases().getServiceCaseId());
    assertEquals("5009A000002GXCrQBO", functionOutput.getCases().getFollowupCaseId());
  }

  @Test
  public void testEmpty() throws Exception {
    UnitOfWorkFunction function = new UnitOfWorkFunction();
    FunctionInput functionInput = createEmptyInput();

    // Assert a generic DataApiException
    assertThrows(
        DataApiException.class,
        () -> {
          function.apply(createEventMock(functionInput), createEmptyContext(functionInput));
        });
  }

  @Test
  public void testInvalid() throws Exception {
    UnitOfWorkFunction function = new UnitOfWorkFunction();
    FunctionInput functionInput = createInvalidInput();

    // Assert a specific DataApiExeption containing an input validation error
    DataApiException ex =
        assertThrows(
            DataApiException.class,
            () -> {
              function.apply(createEventMock(functionInput), createInvalidContext(functionInput));
            });

    assertThat(ex.getDataApiErrors(), contains(hasProperty("errorCode", is("STRING_TOO_LONG"))));
    assertEquals("One or more API errors occurred", ex.getMessage());
  }

  /**
   * Create a mock for Context using a valid input object
   *
   * @param input
   * @return Context
   */
  private Context createValidContextMock(FunctionInput input) {
    Context mockContext = mock(Context.class);

    when(mockContext.getOrg())
        .then(
            i1 -> {
              Org mockOrg = mock(Org.class, Mockito.RETURNS_DEEP_STUBS);

              UnitOfWorkBuilder unitOfWorkBuilder = mock(UnitOfWorkBuilder.class);
              UnitOfWork unitOfWork = mock(UnitOfWork.class);

              when(mockOrg.getDataApi().newUnitOfWorkBuilder()).thenReturn(unitOfWorkBuilder);

              ReferenceId accountRefId = mock(ReferenceId.class);
              ReferenceId contactRefId = mock(ReferenceId.class);
              ReferenceId serviceCaseRefId = mock(ReferenceId.class);
              ReferenceId followupCaseRefId = mock(ReferenceId.class);

              Record accountRecord = mock(Record.class);
              Record contactRecord = mock(Record.class);
              Record serviceCaseRecord = mock(Record.class);
              Record followupCaseRecord = mock(Record.class);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Account")
                      .withField("Name", input.getAccountName())
                      .build())
                  .thenReturn(accountRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Contact")
                      .withField("FirstName", input.getFirstName())
                      .withField("LastName", input.getLastName())
                      .withField("AccountId", accountRefId)
                      .build())
                  .thenReturn(contactRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Case")
                      .withField("Subject", input.getSubject())
                      .withField("Description", input.getDescription())
                      .withField("Origin", "Web")
                      .withField("Status", "New")
                      .withField("AccountId", accountRefId)
                      .withField("ContactId", contactRefId)
                      .build())
                  .thenReturn(serviceCaseRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Case")
                      .withField("ParentId", serviceCaseRefId)
                      .withField("Subject", "Follow Up")
                      .withField("Description", "Follow up with Customer")
                      .withField("Origin", "Web")
                      .withField("Status", "New")
                      .withField("AccountId", accountRefId)
                      .withField("ContactId", contactRefId)
                      .build())
                  .thenReturn(followupCaseRecord);

              when(unitOfWorkBuilder.registerCreate(accountRecord)).thenReturn(accountRefId);
              when(unitOfWorkBuilder.registerCreate(contactRecord)).thenReturn(contactRefId);
              when(unitOfWorkBuilder.registerCreate(serviceCaseRecord))
                  .thenReturn(serviceCaseRefId);
              when(unitOfWorkBuilder.registerCreate(followupCaseRecord))
                  .thenReturn(followupCaseRefId);
              when(unitOfWorkBuilder.build()).thenReturn(unitOfWork);

              when(mockOrg.getDataApi().commitUnitOfWork(unitOfWork))
                  .then(
                      i3 -> {
                        RecordModificationResult accountResult =
                            mock(RecordModificationResult.class);
                        when(accountResult.getId()).thenReturn("0019A00000J28zaQAB");

                        RecordModificationResult contactResult =
                            mock(RecordModificationResult.class);
                        when(contactResult.getId()).thenReturn("0039A00000DkhvnQAB");

                        RecordModificationResult serviceCaseResult =
                            mock(RecordModificationResult.class);
                        when(serviceCaseResult.getId()).thenReturn("5009A000002GYCrQAO");

                        RecordModificationResult followupCaseResult =
                            mock(RecordModificationResult.class);
                        when(followupCaseResult.getId()).thenReturn("5009A000002GXCrQBO");

                        Map<ReferenceId, RecordModificationResult> result = new HashMap<>();
                        result.put(accountRefId, accountResult);
                        result.put(contactRefId, contactResult);
                        result.put(serviceCaseRefId, serviceCaseResult);
                        result.put(followupCaseRefId, followupCaseResult);
                        return result;
                      });

              return Optional.of(mockOrg);
            });

    return mockContext;
  }

  /**
   * Create a mock for Context with an invalid input
   *
   * @param input
   * @return Context
   */
  private Context createInvalidContext(FunctionInput input) {
    Context mockContext = mock(Context.class);

    when(mockContext.getOrg())
        .then(
            i1 -> {
              Org mockOrg = mock(Org.class, Mockito.RETURNS_DEEP_STUBS);

              UnitOfWorkBuilder unitOfWorkBuilder = mock(UnitOfWorkBuilder.class);
              UnitOfWork unitOfWork = mock(UnitOfWork.class);

              when(mockOrg.getDataApi().newUnitOfWorkBuilder()).thenReturn(unitOfWorkBuilder);

              ReferenceId accountRefId = mock(ReferenceId.class);
              ReferenceId contactRefId = mock(ReferenceId.class);
              ReferenceId serviceCaseRefId = mock(ReferenceId.class);
              ReferenceId followupCaseRefId = mock(ReferenceId.class);

              Record accountRecord = mock(Record.class);
              Record contactRecord = mock(Record.class);
              Record serviceCaseRecord = mock(Record.class);
              Record followupCaseRecord = mock(Record.class);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Account")
                      .withField("Name", input.getAccountName())
                      .build())
                  .thenReturn(accountRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Contact")
                      .withField("FirstName", input.getFirstName())
                      .withField("LastName", input.getLastName())
                      .build())
                  .thenReturn(contactRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Case")
                      .withField("Subject", input.getSubject())
                      .withField("Description", input.getDescription())
                      .withField("Origin", "Web")
                      .withField("Status", "New")
                      .withField("AccountId", accountRefId)
                      .withField("ContactId", contactRefId)
                      .build())
                  .thenReturn(serviceCaseRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Case")
                      .withField("ParentId", serviceCaseRefId)
                      .withField("Subject", "Follow Up")
                      .withField("Description", "Follow up with Customer")
                      .withField("Origin", "Web")
                      .withField("Status", "New")
                      .withField("AccountId", accountRefId)
                      .withField("ContactId", contactRefId)
                      .build())
                  .thenReturn(followupCaseRecord);

              when(unitOfWorkBuilder.registerCreate(accountRecord)).thenReturn(accountRefId);
              when(unitOfWorkBuilder.registerCreate(contactRecord)).thenReturn(contactRefId);
              when(unitOfWorkBuilder.registerCreate(serviceCaseRecord))
                  .thenReturn(serviceCaseRefId);
              when(unitOfWorkBuilder.registerCreate(followupCaseRecord))
                  .thenReturn(followupCaseRefId);
              when(unitOfWorkBuilder.build()).thenReturn(unitOfWork);

              // Create a custom DataApiError for input validation
              List<DataApiError> errors = new ArrayList<>();
              DataApiError validationError =
                  new DataApiError() {

                    @Override
                    public String getMessage() {
                      return "Last Name: data value too large: This is a very long string that"
                          + " isn't valid in this line, please reduce it. (max length=80)";
                    }

                    @Override
                    public String getErrorCode() {
                      return "STRING_TOO_LONG";
                    }

                    @Override
                    public List<String> getFields() {
                      return List.of("LastName");
                    }
                  };
              errors.add(validationError);
              when(mockOrg.getDataApi().commitUnitOfWork(unitOfWork))
                  .thenThrow(new DataApiException("One or more API errors occurred", errors));

              return Optional.of(mockOrg);
            });

    return mockContext;
  }

  /**
   * Create a mock for Context with an empty input object
   *
   * @param input
   * @return Context
   */
  private Context createEmptyContext(FunctionInput input) {
    Context mockContext = mock(Context.class);

    when(mockContext.getOrg())
        .then(
            i1 -> {
              Org mockOrg = mock(Org.class, Mockito.RETURNS_DEEP_STUBS);

              UnitOfWorkBuilder unitOfWorkBuilder = mock(UnitOfWorkBuilder.class);
              UnitOfWork unitOfWork = mock(UnitOfWork.class);

              when(mockOrg.getDataApi().newUnitOfWorkBuilder()).thenReturn(unitOfWorkBuilder);

              ReferenceId accountRefId = mock(ReferenceId.class);
              ReferenceId contactRefId = mock(ReferenceId.class);
              ReferenceId serviceCaseRefId = mock(ReferenceId.class);
              ReferenceId followupCaseRefId = mock(ReferenceId.class);

              Record accountRecord = mock(Record.class);
              Record contactRecord = mock(Record.class);
              Record serviceCaseRecord = mock(Record.class);
              Record followupCaseRecord = mock(Record.class);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Account")
                      .withField("Name", input.getAccountName())
                      .build())
                  .thenReturn(accountRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Contact")
                      .withField("FirstName", input.getFirstName())
                      .withField("LastName", input.getLastName())
                      .build())
                  .thenReturn(contactRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Case")
                      .withField("Subject", input.getSubject())
                      .withField("Description", input.getDescription())
                      .withField("Origin", "Web")
                      .withField("Status", "New")
                      .withField("AccountId", accountRefId)
                      .withField("ContactId", contactRefId)
                      .build())
                  .thenReturn(serviceCaseRecord);

              when(mockOrg
                      .getDataApi()
                      .newRecordBuilder("Case")
                      .withField("ParentId", serviceCaseRefId)
                      .withField("Subject", "Follow Up")
                      .withField("Description", "Follow up with Customer")
                      .withField("Origin", "Web")
                      .withField("Status", "New")
                      .withField("AccountId", accountRefId)
                      .withField("ContactId", contactRefId)
                      .build())
                  .thenReturn(followupCaseRecord);

              when(unitOfWorkBuilder.registerCreate(accountRecord)).thenReturn(accountRefId);
              when(unitOfWorkBuilder.registerCreate(contactRecord)).thenReturn(contactRefId);
              when(unitOfWorkBuilder.registerCreate(serviceCaseRecord))
                  .thenReturn(serviceCaseRefId);
              when(unitOfWorkBuilder.registerCreate(followupCaseRecord))
                  .thenReturn(followupCaseRefId);
              when(unitOfWorkBuilder.build()).thenReturn(unitOfWork);

              when(mockOrg.getDataApi().commitUnitOfWork(unitOfWork))
                  .thenThrow(DataApiException.class);

              return Optional.of(mockOrg);
            });

    return mockContext;
  }

  /**
   * Creates a valid Input Object
   *
   * @return FunctionInput
   */
  private FunctionInput createValidInput() {
    return new FunctionInput("a", "b", "c", "d", "e");
  }

  /**
   * Creates an invalid Input Object
   *
   * @return FunctionInput
   */
  private FunctionInput createInvalidInput() {
    return new FunctionInput(
        "a",
        "data value too large: This is a very long string that isn't valid in this line, please"
            + " reduce it",
        "c",
        "d",
        "e");
  }

  /**
   * Creates an empty Input Object
   *
   * @return FunctionInput
   */
  private FunctionInput createEmptyInput() {
    return new FunctionInput();
  }

  /**
   * Creates a mock for InvocationEvent
   *
   * @param input FunctionInput
   * @return InvocationEvent<FunctionInput>
   */
  @SuppressWarnings("unchecked")
  private InvocationEvent<FunctionInput> createEventMock(FunctionInput input) {
    InvocationEvent<FunctionInput> mockEvent = mock(InvocationEvent.class);
    when(mockEvent.getData()).thenReturn(input);
    return mockEvent;
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
              },
              {
                name: "index.test.js",
                body: `import { expect } from "chai";
import { useFakeTimers, createSandbox } from "sinon";
import execute from "../index.js";

/**
 * loggerjs unit tests.
 */
describe("Unit Tests", () => {
  let sandbox;
  let mockContext;
  let mockLogger;

  beforeEach(() => {
    mockContext = {
      logger: { info: () => {} }
    };

    mockLogger = mockContext.logger;
    sandbox = createSandbox();

    sandbox.stub(mockLogger, "info");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke loggerjs Function with default parameters", async () => {
    const clock = useFakeTimers();
    const results = await execute({ data: {} }, mockContext, mockLogger);

    // Advance the clock a full second
    clock.tick(60000);

    // Default amount is 5, 6 including the initial log message
    expect(mockLogger.info.callCount).to.be.eql(6);
    expect(results).to.be.not.undefined;
    expect(results).has.property("status");
    expect(results.status).match(/Generating 5 log messages/);

    clock.restore();
  });

  it("Invoke loggerjs Function with specific amount", async () => {
    const clock = useFakeTimers();
    const results = await execute(
      { data: { amount: 10 } },
      mockContext,
      mockLogger
    );

    // Advance the clock a full second
    clock.tick(60000);

    // Amount 10, 11 including the initial log message
    expect(mockLogger.info.callCount).to.be.eql(11);
    expect(results).to.be.not.undefined;
    expect(results).has.property("status");
    expect(results.status).match(/Generating 10 log messages/);

    clock.restore();
  });
});
`
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
                body: `import crypto from "node:crypto";
import { promisify } from "node:util";

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
              },
              {
                name: "index.test.js",
                body: `import { expect } from "chai";
import { createSandbox } from "sinon";
import execute from "../index.js";

/**
 * environmentjs Function unit tests.
 */
describe("Unit Tests", () => {
  let sandbox;
  let mockContext;
  let mockLogger;

  beforeEach(() => {
    mockContext = {
      logger: { info: () => {} }
    };

    mockLogger = mockContext.logger;
    sandbox = createSandbox();

    sandbox.stub(mockLogger, "info");
  });

  afterEach(() => {
    sandbox.restore();
  });

  it("Invoke SecretsFunction without password", async () => {
    try {
      // Invoke function without a password
      await execute({ data: {} }, mockContext, mockLogger);
    } catch (err) {
      expect(err).to.be.not.null;
      expect(err.message).to.match(/provide a password/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });

  it("Invoke SecretsFunction without secrets", async () => {
    try {
      // Invoke function without secrets
      await execute({ data: { password: "test" } }, mockContext, mockLogger);
    } catch (err) {
      expect(err).to.be.not.null;
      expect(err.message).to.match(/setup PASSWORD_SALT as Environment/);
      return;
    }

    expect(false, "function must throw").to.be.ok;
  });

  it("Invoke SecretsFunction successfully", async () => {
    // Return Secrets
    // Setup Environment
    process.env.PASSWORD_SALT = "make this a random passphrase";

    // Invoke function
    const results = await execute(
      { data: { password: "test" } },
      mockContext,
      mockLogger
    );

    // Validate
    expect(results).to.be.not.undefined;
    expect(results).to.be.equal(
      "65caefdd6c5ca8d667ee4ec37b5df42cdac0803dc4e9b963be4c4d18d06cbcd5"
    );
  });
});
`
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
                body: `import "dotenv/config";
import { pgConnect } from "./lib/db.js";

/**
 * Connects to a PostgreSQL instance and perform two operations:
 * 1. Insert a new row into the "invocations" table with an invocation ID
 * 2. Query the "invocations" table for all the invocation IDs
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
    \`Invoking postgresjs with payload \${JSON.stringify(event.data || {})}\`
  );

  // Get the number of invocations to return
  const limit = event.data.limit ?? 5;

  let client;
  try {
    // Connect to PostgreSQL instance
    client = await pgConnect({
      url: process.env.DATABASE_URL
    });

    // Insert a new invocation id into the database
    await client.query(\`INSERT INTO invocations (id) VALUES ($1)\`, [
      context.id
    ]);

    // Return all the invocation ids from the database
    const { rows: results } = await client.query(
      \`SELECT id, created_at FROM invocations ORDER BY created_at DESC LIMIT $1\`,
      [limit]
    );

    return results;
  } catch (error) {
    logger.error(\`An error ocurred: \${error.message}\`);
    throw error;
  } finally {
    // Close the database connection if the client exists
    if (client) await client.end();
  }
}
`
              },
              {
                name: "db.js",
                body: `import pg from "pg";
const { Client } = pg;

/**
 * Represents the options to create a PostgreSQL client.
 * @typedef {Object} ClientOptions
 * @property {string} url - The URL of the PostgreSQL instance
 */

/**
 * Connects to the PostgreSQL instance.
 * @param {ClientOptions} input The options to create a PostgreSQL client
 * @returns {Client} A connected PostgreSQL client
 */
export async function pgConnect({ url }) {
  if (!url) {
    throw new Error(
      "database url is not set, please set up the DATABASE_URL environment variable"
    );
  }

  // Connect to PostgreSQL
  const client = new Client({
    connectionString: url,
    ssl: {
      rejectUnauthorized: false
    }
  });

  await client.connect();

  // Create a invocations table if it doesn't exist
  // Note: It is recommended to create this table outside the function execution
  // using a provision script or a migration tool. This is just for demo purposes.
  await client.query(\`
    CREATE TABLE IF NOT EXISTS invocations (
        id VARCHAR(255) PRIMARY KEY,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  \`);

  return client;
}
`
              },
              {
                name: "index.test.js",
                body: `import chai from "chai";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
import quibble from "quibble";

chai.use(chaiAsPromised);
const expect = chai.expect;

/**
 * postgresjs unit tests.
 */
describe("Unit Tests", () => {
  const DATABASE_URL = "postgres://postgres:postgres@localhost:5432/postgres";
  let execute;
  let sandbox;
  let mockDb;
  let mockClient;
  let mockContext;
  let mockLogger;
  let results;

  beforeEach(async () => {
    process.env.DATABASE_URL = DATABASE_URL;

    mockContext = {
      id: "c4f3c4f3-c4f3-c4f3-c4f3-c0ff33c0ff33"
    };

    mockDb = {
      pgConnect: () => {}
    };

    mockClient = {
      query: () => {},
      end: () => {}
    };

    mockLogger = {
      info: () => {},
      error: () => {}
    };

    sandbox = createSandbox();

    sandbox.stub(mockLogger, "info");
    sandbox.stub(mockLogger, "error");
    sandbox.stub(mockDb, "pgConnect");
    sandbox.stub(mockClient, "query");
    sandbox.stub(mockClient, "end");

    results = {
      rows: [
        {
          id: mockContext.id,
          created_at: "2022-11-24T05:00:00.000Z"
        },
        {
          id: "cd076488-1600-4fe2-99ba-36f872a3f185",
          created_at: "2022-11-24T05:10:00.000Z"
        },
        {
          id: "7e2b97ba-8950-4e83-90c9-441b04b30737",
          created_at: "2022-11-24T05:20:00.000Z"
        }
      ]
    };

    // Mock the pgConnect function with specific input parameters
    mockDb.pgConnect.withArgs({ url: DATABASE_URL }).resolves(mockClient);
    // Mock the pgConnect function without input parameters
    mockDb.pgConnect.rejects(
      new Error(
        "database url is not set, please set up the DATABASE_URL environment variable"
      )
    );

    mockClient.query.onCall(0).callsFake(() => {
      return Promise.resolve();
    });

    mockClient.query.onCall(1).callsFake(() => {
      return Promise.resolve(results);
    });

    mockClient.end.callsFake(() => {
      return Promise.resolve();
    });

    // Mock the db.js library
    await quibble.esm("../lib/db.js", mockDb);
    execute = (await import("../index.js")).default;
  });

  afterEach(() => {
    sandbox.restore();
    quibble.reset();
  });

  it("Invoke postgresjs without DATABASE_URL", async () => {
    delete process.env.DATABASE_URL;
    await expect(
      execute({ data: {} }, mockContext, mockLogger)
    ).to.be.rejectedWith(
      /database url is not set, please set up the DATABASE_URL environment variable/
    );
  });

  it("Invoke postgresjs with DATABASE_URL", async () => {
    const invocations = await execute({ data: {} }, mockContext, mockLogger);

    expect(mockClient.query.callCount, "Execute 2 queries").to.be.eql(2);
    expect(mockClient.end.callCount, "Close the connection").to.be.eql(1);
    expect(mockLogger.info.callCount, "Log the payload").to.be.eql(1);
    expect(invocations, "Return invocations").to.be.not.undefined;
    expect(invocations, "Return the expected invocations").to.be.eql(
      results.rows
    );
  });
});
`
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
                body: `package com.salesforce.functions.recipes;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.SalesforceFunction;
import com.salesforce.functions.recipes.db.InvocationsManager;
import com.salesforce.functions.recipes.utils.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Connects to a PostgreSQL instance and perform two operations:
 * 1. Insert a new row into the "invocations" table with an invocation ID
 * 2. Query the "invocations" table for all the invocation IDs
 */
public class PostgresJavaFunction implements SalesforceFunction<FunctionInput, Invocations> {
  private static final Logger LOGGER = LoggerFactory.getLogger(PostgresJavaFunction.class);

  @Override
  public Invocations apply(InvocationEvent<FunctionInput> event, Context context) throws Exception {

    LOGGER.info("Invoked with input: {}", event.getData());

    try (InvocationsManager invocationsManager =
        new InvocationsManager(Environment.getDatabaseUrl())) {

      Integer limit = event.getData().getLimit();

      // Insert a new row into the "invocations" table with an invocation ID
      invocationsManager.addInvocation(context.getId());

      // Query the "invocations" table for all the invocation IDs
      Invocations invocations = invocationsManager.getInvocations(limit);

      LOGGER.info("Retrieved {} invocations from the database",
          invocations.getInvocations().size());

      return invocations;
    } catch (Exception e) {
      LOGGER.error("Error while connecting to the database", e);
      throw e;
    }
  }
}
`
              },
              {
                name: "FunctionInput.java",
                body: `package com.salesforce.functions.recipes;

public class FunctionInput {
  private Integer limit = 5;

  public Integer getLimit() {
    return limit;
  }

  public void setLimit(Integer limit) {
    this.limit = limit;
  }

  @Override
  public String toString() {
    return "FunctionInput [limit=" + limit + "]";
  }
}
`
              },
              {
                name: "Invocations.java",
                body: `package com.salesforce.functions.recipes;

import java.util.List;

public class Invocations {
    private List<Invocation> invocations;

    public Invocations(List<Invocation> invocations) {
        this.invocations = invocations;
    }

    public List<Invocation> getInvocations() {
        return invocations;
    }
}
`
              },
              {
                name: "Invocation.java",
                body: `package com.salesforce.functions.recipes;

import java.sql.Timestamp;

public class Invocation {

  private String id;
  private Timestamp createdAt;

  public Invocation(String id, Timestamp date) {
    this.id = id;
    this.createdAt = date;
  }

  public String getId() {
    return id;
  }

  public Timestamp getCreatedAt() {
    return createdAt;
  }
}
`
              },
              {
                name: "InvocationsManager.java",
                body: `package com.salesforce.functions.recipes.db;

import java.net.URI;
import java.net.URISyntaxException;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import com.salesforce.functions.recipes.Invocation;
import com.salesforce.functions.recipes.Invocations;

/**
 * This class manages the invocations stored in a PostgreSQL database.
 */
public class InvocationsManager implements AutoCloseable {
  // Database queries
  private final String CREATE_INVOCATIONS_TABLE =
      "CREATE TABLE IF NOT EXISTS invocations (id VARCHAR(255) PRIMARY KEY, created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP)";
  private final String INSERT_INVOCATION = "INSERT INTO invocations (id) VALUES (?)";
  private final String SELECT_INVOCATIONS =
      "SELECT id, created_at FROM invocations ORDER BY created_at DESC LIMIT ?";

  private final String url;
  private Connection connection;

  public InvocationsManager(String url) throws SQLException {
    this.url = url;
    this.connection = getConnection();
  }

  /**
   * Add an invocation to the database.
   *
   * @param id
   * @throws SQLException
   */
  public void addInvocation(String id) throws SQLException {
    try (PreparedStatement stmt = connection.prepareStatement(INSERT_INVOCATION);) {
      stmt.setString(1, id);
      stmt.executeUpdate();
    }
  }

  /**
   * Get the last invocations from the database.
   *
   * @param limit The maximum number of invocations to return.
   * @return Invocations
   * @throws SQLException
   */
  public Invocations getInvocations(int limit) throws SQLException {
    try (PreparedStatement stmt = connection.prepareStatement(SELECT_INVOCATIONS);) {
      stmt.setInt(1, limit);
      List<Invocation> invocations = new ArrayList<>();

      try (ResultSet rs = stmt.executeQuery()) {
        while (rs.next()) {
          Invocation inv = new Invocation(rs.getString("id"), rs.getTimestamp("created_at"));
          invocations.add(inv);
        }
      }
      return new Invocations(invocations);
    }
  }

  /**
   * Get a connection to the database.
   *
   * @return Connection
   * @throws SQLException
   */
  protected Connection getConnection() throws SQLException {
    // If there is already a connection reuse it
    if (connection != null && !connection.isClosed()) {
      return connection;
    }

    try {
      Class.forName("org.postgresql.Driver");
      URI dbUri = new URI(this.url);

      // Extract username and password from DATABASE_URL
      String username = dbUri.getUserInfo().split(":")[0];
      String password = dbUri.getUserInfo().split(":")[1];

      // Construct a valid JDBC URL
      String dbUrl =
          "jdbc:postgresql://" + dbUri.getHost() + ':' + dbUri.getPort() + dbUri.getPath();

      // Connect to PostgreSQL instance
      connection = DriverManager.getConnection(dbUrl, username, password);

      // Create a invocations table if it doesn't exist
      // Note: It is recommended to create this table outside the function execution
      // using a provision script or a migration tool. This is just for demo purposes.
      connection.createStatement().execute(CREATE_INVOCATIONS_TABLE);

      return connection;
    } catch (URISyntaxException | ClassNotFoundException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public void close() throws Exception {
    if (connection != null && !connection.isClosed()) {
      connection.close();
    }
  }
}
`
              },
              {
                name: "Environment.java",
                body: `package com.salesforce.functions.recipes.utils;

/**
 * This class contains the environment variables used by the Function.
 */
public class Environment {

  /**
   * The URL of the PostgreSQL instance.
   * @return String
   */
  public static String getDatabaseUrl() {
    String databaseUrl = System.getenv("DATABASE_URL");
    if (databaseUrl == null) {
      throw new IllegalStateException("DATABASE_URL environment variable is not set");
    }
    return databaseUrl;
  }
}
`
              },
              {
                name: "FunctionTest.java",
                body: `package com.salesforce.functions.recipes;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.Test;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;
import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.recipes.db.InvocationsManager;
import com.salesforce.functions.recipes.utils.Environment;

public class FunctionTest {

  private final String INVOCATION_ID = "c4f3c4f3-c4f3-c4f3-c4f3-c0ff33c0ff33";
  private final List<Invocation> INVOCATIONS = new ArrayList<Invocation>(
      Arrays.asList(new Invocation(INVOCATION_ID, Timestamp.valueOf("2022-11-24 12:30:00")),
          new Invocation("7e2b97ba-8950-4e83-90c9-441b04b30737",
              Timestamp.valueOf("2022-11-25 11:11:00"))));

  @Test
  public void testSuccess() throws Exception {
    PostgresJavaFunction function = new PostgresJavaFunction();
    FunctionInput input = new FunctionInput();
    input.setLimit(2);

    // Create a mock of the InvocationsManager
    try (MockedConstruction<InvocationsManager> mocked =
        mockConstruction(InvocationsManager.class, (mock, context) -> {
          context.arguments().forEach(arg -> {
            if (arg instanceof String) {
              mockStatic(Environment.class).when(Environment::getDatabaseUrl)
                  .thenReturn("postgres://localhost:5432");
            }
          });

          verify(mock, times(1)).addInvocation(INVOCATION_ID);
          verify(mock, times(1)).getInvocations(input.getLimit());
          when(mock.getInvocations(2)).thenReturn(new Invocations(INVOCATIONS));
          Invocations invocations = function.apply(createEventMock(input), createContextMock());
          assertEquals(invocations.getInvocations().size(), 2);
          assertEquals(invocations.getInvocations().get(0).getId(), INVOCATION_ID);
          assertEquals(invocations.getInvocations(), INVOCATIONS);
        });) {
    }
  }

  @Test
  public void testNoUrl() {
    PostgresJavaFunction function = new PostgresJavaFunction();

    // Create a mock of the InvocationsManager
    try (MockedConstruction<InvocationsManager> mocked =
        mockConstruction(InvocationsManager.class, (mock, context) -> {
          context.arguments().forEach(arg -> {
            if (arg instanceof String) {
              // It should throw an exception if the URL is not set
              mockStatic(Environment.class).when(Environment::getDatabaseUrl)
                  .thenThrow(IllegalStateException.class);
            }
          });
          // It should fail when the Environment class returns an empty URL
          assertThrows(IllegalStateException.class, () -> {
            function.apply(createEventMock(new FunctionInput()), createContextMock());
          });
        })) {}
  }

  @Test
  public void testEnvironmentSuccess() {
    try (MockedStatic<Environment> mockEnvironment = mockStatic(Environment.class)) {
      mockEnvironment.when(Environment::getDatabaseUrl)
          .thenReturn("jdbc:postgresql://localhost:5432/postgres");
      assertEquals(Environment.getDatabaseUrl(), "jdbc:postgresql://localhost:5432/postgres");
    }
  }

  @Test
  public void testEnvironmentFail() {
    // It should fail when the Environment class throws an exception
    try (MockedStatic<Environment> mockEnvironment = mockStatic(Environment.class)) {
      mockEnvironment.when(Environment::getDatabaseUrl).thenThrow(IllegalStateException.class);
      assertThrows(IllegalStateException.class, () -> {
        Environment.getDatabaseUrl();
      });
    }
  }

  /**
   * Creates a mock for Context
   *
   * @return Context
   */
  private Context createContextMock() {
    Context mockContext = mock(Context.class);
    when(mockContext.getId()).thenReturn(INVOCATION_ID);
    return mockContext;
  }

  /**
   * Creates a mock for InvocationEvent
   *
   * @param input FunctionInput
   * @return InvocationEvent<FunctionInput>
   */
  @SuppressWarnings("unchecked")
  private InvocationEvent<FunctionInput> createEventMock(FunctionInput input) {
    InvocationEvent<FunctionInput> mockEvent = mock(InvocationEvent.class);
    when(mockEvent.getData()).thenReturn(input);
    return mockEvent;
  }
}
`
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
                body: `import "dotenv/config";
import { redisConnect } from "./lib/db.js";

/**
 * Connects to a Redis instance and perform the following operations:
 * 1. Stores the last invocation ID in Redis
 * 2. Stores the last invocation time in Redis
 * 3. Adds the invocation ID to a list in Redis
 * 4. Returns the list of invocation IDs from Redis
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

// Expiration time for Redis keys
const FIVE_MINUTES = 5 * 60;

export default async function (event, context, logger) {
  logger.info(
    \`Invoking redisjs with payload \${JSON.stringify(event.data || {})}\`
  );

  // Get the number of invocations to return
  const limit = event.data.limit ?? 5;

  let client;
  try {
    // Connect to Redis instance
    client = await redisConnect({
      url: process.env.REDIS_URL
    });

    // Set the last invocation id into the database with expiration set to 5 minutes
    const lastInvocationId = context.id;
    await client.set("lastInvocationId", lastInvocationId, "EX", FIVE_MINUTES);

    // Set the last invocation time into the database with expiration set to 5 minutes
    const lastInvocationTime = new Date().toISOString();
    await client.set(
      "lastInvocationTime",
      lastInvocationTime,
      "EX",
      FIVE_MINUTES
    );

    // Add the invocation id to a list in the database
    await client.lPush("invocations", context.id);

    // If no expiration is set, set the expiration to 5 minutes
    const ttl = await client.ttl("invocations");
    if (ttl < 0) {
      await client.expire("invocations", FIVE_MINUTES);
    }

    // Get the list of invocations
    const invocations = await client.lRange("invocations", 0, limit - 1);

    // Return the results
    const results = {
      invocations,
      lastInvocationId,
      lastInvocationTime
    };
    return results;
  } catch (error) {
    logger.error(\`An error ocurred: \${error.message}\`);
    throw error;
  } finally {
    // Close the database connection if the client exists
    if (client) await client.quit();
  }
}
`
              },
              {
                name: "db.js",
                body: `import { createClient } from "redis";

/**
 * Represents the options to create a Redis client.
 * @typedef {Object} ClientOptions
 * @property {string} url - The URL of the Redis instance
 */

/**
 * Connects to a Redis instance.
 * @param {ClientOptions} input The options to create a Redis client
 * @returns {RedisClientType} A connected Redis client
 */
export async function redisConnect({ url }) {
  if (!url) {
    throw new Error(
      \`database url is not set, please set up the REDIS_URL environment variable\`
    );
  }

  // Connect to Redis
  const redisClient = createClient({
    url,
    socket: {
      tls: true,
      rejectUnauthorized: false
    }
  });
  await redisClient.connect();
  return redisClient;
}
`
              },
              {
                name: "index.test.js",
                body: `import chai from "chai";
import sinon from "sinon";
import chaiAsPromised from "chai-as-promised";
import { createSandbox } from "sinon";
import quibble from "quibble";

chai.use(chaiAsPromised);
const expect = chai.expect;

/**
 * redisjs unit tests.
 */

describe("Unit Tests", () => {
  const REDIS_URL = "redis://localhost:6379";
  let clock;
  let execute;
  let sandbox;
  let mockDb;
  let mockClient;
  let mockContext;
  let mockLogger;
  let results;

  beforeEach(async () => {
    process.env.REDIS_URL = REDIS_URL;

    mockContext = {
      id: "c4f3c4f3-c4f3-c4f3-c4f3-c0ff33c0ff33"
    };

    mockDb = {
      redisConnect: () => {}
    };

    mockClient = {
      set: () => {},
      lPush: () => {},
      lRange: () => {},
      ttl: () => {},
      expire: () => {},
      quit: () => {}
    };

    mockLogger = {
      info: () => {},
      error: () => {}
    };

    sandbox = createSandbox();

    sandbox.stub(mockLogger, "info");
    sandbox.stub(mockLogger, "error");
    sandbox.stub(mockDb, "redisConnect");
    sandbox.stub(mockClient, "set");
    sandbox.stub(mockClient, "lPush");
    sandbox.stub(mockClient, "lRange");
    sandbox.stub(mockClient, "ttl");
    sandbox.stub(mockClient, "expire");
    sandbox.stub(mockClient, "quit");

    results = {
      invocations: [
        mockContext.id,
        "cd076488-1600-4fe2-99ba-36f872a3f185",
        "7e2b97ba-8950-4e83-90c9-441b04b30737"
      ],
      lastInvocationId: mockContext.id,
      lastInvocationTime: "2022-11-24T05:00:00.000Z"
    };

    // Mock the pgConnect function with specific input parameters
    mockDb.redisConnect.withArgs({ url: REDIS_URL }).resolves(mockClient);
    // Mock the pgConnect function without input parameters
    mockDb.redisConnect.rejects(
      new Error(
        "database url is not set, please set up the REDIS_URL environment variable"
      )
    );

    mockClient.set.onCall(0).callsFake(() => {
      return Promise.resolve();
    });

    mockClient.set.onCall(1).callsFake(() => {
      return Promise.resolve();
    });

    mockClient.lPush.callsFake(() => {
      return Promise.resolve();
    });

    mockClient.lRange.callsFake(() => {
      return Promise.resolve(results.invocations);
    });

    mockClient.ttl.callsFake(() => {
      return Promise.resolve(-1);
    });

    mockClient.expire.callsFake(() => {
      return Promise.resolve();
    });

    mockClient.quit.callsFake(() => {
      return Promise.resolve();
    });

    clock = sinon.useFakeTimers({
      now: new Date(2022, 10, 24, 0, 0),
      shouldAdvanceTime: true,
      toFake: ["Date"]
    });

    // Mock the db.js library
    await quibble.esm("../lib/db.js", mockDb);
    execute = (await import("../index.js")).default;
  });

  afterEach(() => {
    sandbox.restore();
    quibble.reset();
    clock.restore();
  });

  it("Invoke redisjs without REDIS_URL", async () => {
    delete process.env.REDIS_URL;
    await expect(
      execute({ data: {} }, mockContext, mockLogger)
    ).to.be.rejectedWith(
      /database url is not set, please set up the REDIS_URL environment variable/
    );
  });

  it("Invoke redisjs with REDIS_URL", async () => {
    const result = await execute({ data: {} }, mockContext, mockLogger);

    expect(mockClient.set.callCount, "Execute 2 SET").to.be.eql(2);
    expect(mockClient.lPush.callCount, "Execute 1 LPUSH").to.be.eql(1);
    expect(mockClient.lRange.callCount, "Execute 1 LRANGE").to.be.eql(1);
    expect(mockClient.ttl.callCount, "Execute 1 TTL").to.be.eql(1);
    expect(mockClient.expire.callCount, "Execute 1 EXPIRE").to.be.eql(1);
    expect(mockClient.quit.callCount, "Close the connection").to.be.eql(1);
    expect(mockLogger.info.callCount, "Log the payload").to.be.eql(1);
    expect(result, "Return invocations").to.be.not.undefined;
    expect(result, "Return the expected invocations").to.be.eql(results);
    expect(
      result.lastInvocationId,
      "Return the expected lastInvocationId"
    ).to.be.eql(mockContext.id);
  });
});
`
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
                body: `package com.salesforce.functions.recipes;

import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.jvm.sdk.SalesforceFunction;
import com.salesforce.functions.recipes.db.InvocationsManager;
import com.salesforce.functions.recipes.utils.Environment;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;


/**
 * Connects to a Redis instance and perform the following operations:
 * 1. Stores the last invocation ID in Redis
 * 2. Stores the last invocation time in Redis
 * 3. Adds the invocation ID to a list in Redis
 * 4. Returns the list of invocation IDs from Redis
 */
public class RedisJavaFunction implements SalesforceFunction<FunctionInput, Invocations> {
  private static final Logger LOGGER = LoggerFactory.getLogger(RedisJavaFunction.class);

  @Override
  public Invocations apply(InvocationEvent<FunctionInput> event, Context context) throws Exception {

    LOGGER.info("Invoked with input: {}", event.getData());

    try (InvocationsManager invocationsManager = new InvocationsManager(Environment.getDatabaseUrl())) {
      Integer limit = event.getData().getLimit();

      // Insert a new invocation to the "invocations" list
      // Also set the last invocation ID and last invocation time
      invocationsManager.addInvocation(context.getId());

      // Query the "invocations" list for all the invocation IDs
      Invocations invocations = invocationsManager.getInvocations(limit);
      LOGGER.info("Retrieved {} invocations from the database", invocations.getInvocations().size());
      return invocations;
    } catch (Exception e) {
      LOGGER.error("Error while connecting to the database", e);
      throw e;
    }
  }
}
`
              },
              {
                name: "FunctionInput.java",
                body: `package com.salesforce.functions.recipes;

public class FunctionInput {
  private Integer limit = 5;

  public Integer getLimit() {
    return limit;
  }

  public void setLimit(Integer limit) {
    this.limit = limit;
  }

  @Override
  public String toString() {
    return "FunctionInput [limit=" + limit + "]";
  }
}
`
              },
              {
                name: "Invocations.java",
                body: `package com.salesforce.functions.recipes;

import java.util.List;

public class Invocations {
    private String lastInvocationId;
    private String lastInvocationTime;
    private List<String> invocations;

    public void setLastInvocationId(String lastInvocationId) {
        this.lastInvocationId = lastInvocationId;
    }

    public void setLastInvocationTime(String lastInvocationTime) {
        this.lastInvocationTime = lastInvocationTime;
    }

    public void setInvocations(List<String> invocations) {
        this.invocations = invocations;
    }

    public String getLastInvocationId() {
        return this.lastInvocationId;
    }

    public String getLastInvocationTime() {
        return this.lastInvocationTime;
    }

    public List<String> getInvocations() {
        return this.invocations;
    }
}
`
              },
              {
                name: "InvocationsManager.java",
                body: `package com.salesforce.functions.recipes.db;

import javax.net.ssl.HostnameVerifier;
import javax.net.ssl.SSLContext;
import javax.net.ssl.TrustManager;
import javax.net.ssl.X509TrustManager;
import com.salesforce.functions.recipes.Invocations;
import java.net.URI;
import java.security.KeyManagementException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.X509Certificate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import redis.clients.jedis.Jedis;
import redis.clients.jedis.params.SetParams;

/**
 * This class manages the invocations stored in a Redis database.
 */
public class InvocationsManager implements AutoCloseable {
  private final static long FIVE_MINUTES = 5 * 60;
  private final String url;
  private Jedis connection;

  public InvocationsManager(String url) {
    this.url = url;
    this.connection = getConnection();
  }

  /**
   * Add an invocation to the database.
   *
   * @param id The invocation ID.
   */
  public void addInvocation(String id) {
    connection.set("lastInvocationId", id, new SetParams().ex(FIVE_MINUTES));
    LocalDateTime now = LocalDateTime.now();
    DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
    String formattedDateTime = now.format(formatter);
    connection.set("lastInvocationTime", formattedDateTime, new SetParams().ex(FIVE_MINUTES));

    connection.lpush("invocations", id);

    long ttl = connection.ttl("invocations");
    if (ttl < 0) {
      connection.expire("invocations", FIVE_MINUTES);

    }
  }

  /**
   * Get the last invocations from the database.
   *
   * @param limit The maximum number of invocations to return.
   * @return Invocations
   */
  public Invocations getInvocations(Integer limit) {
    List<String> ids = connection.lrange("invocations", 0, limit - 1);
    Invocations invocations = new Invocations();
    invocations.setInvocations(ids);

    String lastInvocationId = connection.get("lastInvocationId");
    String lastInvocationTime = connection.get("lastInvocationTime");

    invocations.setLastInvocationId(lastInvocationId);
    invocations.setLastInvocationTime(lastInvocationTime);
    return invocations;
  }

  /**
   * Get a connection to the Redis database.
   *
   * @return Jedis
   */
  protected Jedis getConnection() {
    if (connection != null && connection.isConnected()) {
      return connection;
    }

    try {
      TrustManager bogusTrustManager = new X509TrustManager() {
        public X509Certificate[] getAcceptedIssuers() {
          return null;
        }

        public void checkClientTrusted(X509Certificate[] certs, String authType) {}

        public void checkServerTrusted(X509Certificate[] certs, String authType) {}
      };

      SSLContext sslContext = SSLContext.getInstance("SSL");
      sslContext.init(null, new TrustManager[] {bogusTrustManager},
          new java.security.SecureRandom());

      HostnameVerifier bogusHostnameVerifier = (hostname, session) -> true;

      connection = new Jedis(URI.create(this.url), sslContext.getSocketFactory(),
          sslContext.getDefaultSSLParameters(), bogusHostnameVerifier);
      return connection;
    } catch (NoSuchAlgorithmException | KeyManagementException e) {
      throw new RuntimeException(e);
    }
  }

  @Override
  public void close() {
    if (connection != null && connection.isConnected()) {
      connection.close();
    }
  }
}
`
              },
              {
                name: "Environment.java",
                body: `package com.salesforce.functions.recipes.utils;

/**
 * This class contains the environment variables used by the Function.
 */
public class Environment {

  /**
   * The URL of the Redis instance.
   * @return String
   */
  public static String getDatabaseUrl() {
    String databaseUrl = System.getenv("REDIS_URL");
    if (databaseUrl == null) {
      throw new IllegalStateException("REDIS_URL environment variable is not set");
    }
    return databaseUrl;
  }
}`
              },
              {
                name: "FunctionTest.java",
                body: `package com.salesforce.functions.recipes;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockConstruction;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import org.junit.Test;
import org.mockito.MockedConstruction;
import org.mockito.MockedStatic;
import com.salesforce.functions.jvm.sdk.Context;
import com.salesforce.functions.jvm.sdk.InvocationEvent;
import com.salesforce.functions.recipes.db.InvocationsManager;
import com.salesforce.functions.recipes.utils.Environment;

public class FunctionTest {

  private final String INVOCATION_ID = "c4f3c4f3-c4f3-c4f3-c4f3-c0ff33c0ff33";
  private final List<String> INVOCATIONS =
      new ArrayList<String>(Arrays.asList(INVOCATION_ID, "7e2b97ba-8950-4e83-90c9-441b04b30737"));

  @Test
  public void testSuccess() throws Exception {
    RedisJavaFunction function = new RedisJavaFunction();
    FunctionInput input = new FunctionInput();
    input.setLimit(2);

    // Create a mock of the InvocationsManager
    try (MockedConstruction<InvocationsManager> mocked =
        mockConstruction(InvocationsManager.class, (mock, context) -> {
          context.arguments().forEach(arg -> {
            if (arg instanceof String) {
              mockStatic(Environment.class).when(Environment::getDatabaseUrl)
                  .thenReturn("redis://localhost:6379");
            }
          });

          verify(mock, times(1)).addInvocation(INVOCATION_ID);
          verify(mock, times(1)).getInvocations(input.getLimit());

          // Setup getInvocations Mock
          Invocations invocations = new Invocations();
          invocations.setInvocations(INVOCATIONS);
          invocations.setLastInvocationId(INVOCATION_ID);
          invocations.setLastInvocationTime("2022-11-24 00:00:00");
          when(mock.getInvocations(2)).thenReturn(invocations);

          // Invoke Function
          Invocations result = function.apply(createEventMock(input), createContextMock());
          assertEquals(result.getInvocations().size(), 2);
          assertEquals(result.getInvocations().get(0), INVOCATION_ID);
          assertEquals(result.getInvocations(), INVOCATIONS);
        });) {
    }
  }

  @Test
  public void testNoUrl() {
    RedisJavaFunction function = new RedisJavaFunction();

    // Create a mock of the InvocationsManager
    try (MockedConstruction<InvocationsManager> mocked =
        mockConstruction(InvocationsManager.class, (mock, context) -> {
          context.arguments().forEach(arg -> {
            if (arg instanceof String) {
              // It should throw an exception if the URL is not set
              mockStatic(Environment.class).when(Environment::getDatabaseUrl)
                  .thenThrow(IllegalStateException.class);
            }
          });
          // It should fail when the Environment class returns an empty URL
          assertThrows(IllegalStateException.class, () -> {
            function.apply(createEventMock(new FunctionInput()), createContextMock());
          });
        })) {
    }
  }

  @Test
  public void testEnvironmentSuccess() throws Exception {
    try (MockedStatic<Environment> mockEnvironment = mockStatic(Environment.class)) {
      mockEnvironment.when(Environment::getDatabaseUrl).thenReturn("redis://localhost:6379");
      assertEquals(Environment.getDatabaseUrl(), "redis://localhost:6379");
    }
  }

  @Test
  public void testEnvironmentFail() {
    // It should fail when the Environment class returns an empty URL
    assertThrows(IllegalStateException.class, () -> {
      Environment.getDatabaseUrl();
    });
  }

  /**
   * Creates a mock for Context
   *
   * @return Context
   */
  private Context createContextMock() {
    Context mockContext = mock(Context.class);
    when(mockContext.getId()).thenReturn(INVOCATION_ID);
    return mockContext;
  }

  /**
   * Creates a mock for InvocationEvent
   *
   * @param input FunctionInput
   * @return InvocationEvent<FunctionInput>
   */
  @SuppressWarnings("unchecked")
  private InvocationEvent<FunctionInput> createEventMock(FunctionInput input) {
    InvocationEvent<FunctionInput> mockEvent = mock(InvocationEvent.class);
    when(mockEvent.getData()).thenReturn(input);
    return mockEvent;
  }
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
