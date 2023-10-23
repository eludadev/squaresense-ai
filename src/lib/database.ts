export interface LocationCoordinates {
  lat: number;
  long: number;
}

export const locationDatabase: Record<string, LocationCoordinates> = {
  Berlin: { lat: 52.52, long: 13.405 },
  'San Francisco': { lat: 37.78, long: -122.412 },
  Tokyo: { lat: 35.676, long: 139.65 },
  Jersey: { lat: 40.7128, long: -74.006 },
  'Buenos Aires': { lat: -34.6, long: -58.38 },
  'New York City': { lat: 40.7128, long: -74.006 },
  London: { lat: 51.5074, long: -0.1278 },
  Paris: { lat: 48.8566, long: 2.3522 },
  Sydney: { lat: -33.865, long: 151.2094 },
  Dubai: { lat: 25.276987, long: 55.296249 },
  Mumbai: { lat: 19.076, long: 72.8777 },
  Singapore: { lat: 1.3521, long: 103.8198 },
  Toronto: { lat: 43.65107, long: -79.347015 },
  'Rio de Janeiro': { lat: -22.9068, long: -43.1729 },
  Rome: { lat: 41.9028, long: 12.4964 },
};
