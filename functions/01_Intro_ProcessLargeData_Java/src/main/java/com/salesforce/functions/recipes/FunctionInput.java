package com.salesforce.functions.recipes;

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
