import { LightningElement } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { NavigationMixin } from "lightning/navigation";
import invoke from "@salesforce/apex/InvokeProcessLargeDataFunction.invoke";

export default class ProcessLargeDataFunction extends NavigationMixin(
  LightningElement
) {
  length = 5;
  userLocation;
  functionRunning;
  mapMarkers = [];
  nearbyLocations;
  message = { message: "Invoke function to view results" };
  error;

  invokeFunction() {
    this.getGeolocation();
    this.functionRunning = true;
  }

  getGeolocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Get the Latitude and Longitude from Geolocation API and set the user location
          this.userLocation = {
            location: {
              Latitude: position.coords.latitude,
              Longitude: position.coords.longitude
            }
          };
          this.getNearbyLocations();
        },
        (error) => {
          // In the event of an error show a message and set a default latitude and longitude
          this.userLocation = {
            location: {
              Latitude: 37.784798236043166,
              Longitude: -122.40056125397507
            }
          };
          this.getNearbyLocations();
          this.error = error;
        }
      );
    }
  }

  getNearbyLocations() {
    // Define the payload using the properties defined
    const payload = {
      latitude: this.userLocation.location.Latitude,
      longitude: this.userLocation.location.Longitude,
      length: this.length
    };

    // Invoke Function
    invoke({
      payload: JSON.stringify(payload)
    })
      .then((data) => {
        const parsedData = JSON.parse(data);
        this.mapMarkers = [];
        parsedData.schools.forEach((location) => {
          const distance =
            Math.round((location.distance + Number.EPSILON) * 100) / 100;
          const marker = {
            location: {
              Street: location.street,
              City: location.city,
              State: location.state,
              PostalCode: location.zip
            },
            description: location.description,
            title: `${location.name} (${distance}mi)`,
            value: location.website
          };
          this.mapMarkers.push(marker);
        });
        this.functionRunning = false;
      })
      .catch((error) => {
        this.showError(error);
      });
  }

  handleChangeLength(event) {
    this.length = +event.detail.value;
  }

  handleChangeFunction(event) {
    this.functionName = event.detail.value;
    this.functionLabel = event.target.options.find(
      (opt) => opt.value === event.detail.value
    ).label;
  }

  showError(error) {
    this.error = error;
    this.showToast(
      "An error has occurred",
      error?.message || error?.body?.message,
      "error"
    );
  }

  showToast(title, message, variant) {
    const event = new ShowToastEvent({
      title,
      message,
      variant
    });
    this.dispatchEvent(event);
  }

  get functionTitle() {
    return `LWC Example`;
  }

  get mapLoaded() {
    return this.mapMarkers.length >= 1;
  }

  get lengthOptions() {
    return [
      { label: "5", value: 5 },
      { label: "10", value: 10 },
      { label: "15", value: 15 },
      { label: "20", value: 20 }
    ];
  }

  viewSource() {
    // Navigate to a URL
    this[NavigationMixin.Navigate](
      {
        type: "standard__webPage",
        attributes: {
          url: "https://github.com/trailheadapps/functions-recipes/blob/main/functions/01_Intro_ProcessLargeData_JS/index.js"
        }
      },
      true
    );
  }
}
