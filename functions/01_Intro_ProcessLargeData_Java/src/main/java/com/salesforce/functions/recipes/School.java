package com.salesforce.functions.recipes;

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
