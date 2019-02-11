import trips from '../flights_lhr.json';

export function getTrips() {
  // map geojson features to trip layer data
  // use index as timestamp just for demo
  return trips.features.map(f => ({
    color: f.properties.isTakeOff ? [253, 128, 93] : [200, 200, 253],
    path: f.geometry.coordinates.map((p, index) => [
      p[0], p[1], index
    ])
  }));
}
