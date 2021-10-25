package com.salesforce.functions.recipes;

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
