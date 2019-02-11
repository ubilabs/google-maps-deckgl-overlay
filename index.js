/* ! Most parts taken from https://github.com/uber/deck.gl/pull/2179 ! */

import loadScript from './src/load-gmaps';
import initMap from './src/init-map';
import initDeck from './src/init-deck';
import initOverlay from './src/init-overlay';
import TripsLayer from '@deck.gl/experimental-layers/src/trips-layer/index';
import {GeoJsonLayer, IconLayer} from '@deck.gl/layers';
import {getTrips} from './src/flight-trips.js';
import {randomPoint} from '@turf/random';
import styles from './basemap.json'; // https://snazzymaps.com/style/1261/dark

const gmUrl = `https://maps.googleapis.com/maps/api/js?key=${process.env.GOOGLE_MAPS_API_KEY}&libraries=visualization&v=3.34`
const TILE_SIZE = 256;
const INITIAL_VIEW_STATE = {
  latitude: 51.46,
  longitude: -0.4,
  zoom: 8,
  pitch: 0
};
const mapOptions = {
  styles,
  center: {
    lat: INITIAL_VIEW_STATE.latitude,
    lng: INITIAL_VIEW_STATE.longitude
  },
  // Adding 1 to the zoom level get us close to each other
  zoom: INITIAL_VIEW_STATE.zoom + 1,
  tilt: INITIAL_VIEW_STATE.pitch
};

let frame = 0
let map = null;
let deck = null;
let hoveredFeature = null;

const trips = getTrips();
const randomPointsDeckGl = randomPoint(50, {bbox: [-2, 50, 2, 53]});
const randomPointsGoogle = randomPoint(50, {bbox: [-2, 50, 2, 53]});

(async () => {
  await loadScript(gmUrl);
  const map = initMap('map', mapOptions);
  const deck = initDeck(map, INITIAL_VIEW_STATE);
  const overlay = initOverlay(map, deck, TILE_SIZE);

  addGoogleMarkers(map, randomPointsGoogle);
  addDeckListeners(deck);

  function animate() {
    frame = (frame + 0.1) % 400;
    deck.setProps({layers: getLayers(frame)})
    requestAnimationFrame(animate);
  }

  animate();
})();

function addDeckListeners(deck) {
  window.addEventListener('click', event => {
    const {clientX: x, clientY: y} = event;
    const picked = deck.pickObject({x, y, radius: 4, layerIds: ['icon-layer']});

    if (picked) {
      alert('Clicked on a Deck.gl object');
    }
  });

  window.addEventListener('mousemove', event => {
    if (!deck.layerManager) {
      return;
    }

    const {clientX: x, clientY: y} = event;
    const picked = deck.pickObject({x, y, radius: 0, layerIds: ['icon-layer']});

    if (picked && hoveredFeature !== picked.object) {
      hoveredFeature = picked.object;
      deck.setProps({layers: getLayers(frame)});
      document.body.classList.add('cursor-pointer');
    } else if(!picked) {
      hoveredFeature = null;
      deck.setProps({layers: getLayers(frame)});
      document.body.classList.remove('cursor-pointer');
    }
  });
}

function addGoogleMarkers(map, points) {
  points.features.forEach(point => {
    const marker = new google.maps.Marker({
      position: {
        lng: point.geometry.coordinates[0],
        lat: point.geometry.coordinates[1]
      },
      map: map,
    });

    marker.addListener('click', () => {
      alert('Clicked on a Google Maps object');
    });
  })
}

function getLayers(frame) {
  const ICON_MAPPING = {
    marker: {x: 0, y: 0, width: 128, height: 128, anchorY: 128, anchorX: 64, mask: true}
  };

  return [
    new IconLayer({
      id: 'icon-layer',
      data: randomPointsDeckGl.features,
      pickable: true,
      iconAtlas: 'http://deck.gl/images/icon-atlas.png',
      iconMapping: ICON_MAPPING,
      getIcon: d => 'marker',
      sizeScale: 10,
      getPosition: d => d.geometry.coordinates,
      getSize: d => 5,
      getColor: d => [255, 0, 0]
    }),
    new IconLayer({
      id: 'icon-layer-hovered',
      data: hoveredFeature ? [hoveredFeature] : null,
      pickable: true,
      iconAtlas: 'http://deck.gl/images/icon-atlas.png',
      iconMapping: ICON_MAPPING,
      getIcon: d => 'marker',
      sizeScale: 10,
      getPosition: d => d.geometry.coordinates,
      getSize: d => 5,
      getColor: d => [255, 255, 255]
    }),
    new TripsLayer({
      id: 'trips',
      data: trips,
      getPath: d => d.path,
      getColor: d => d.color,
      opacity: 0.8,
      strokeWidth: 1,
      trailLength: 10,
      currentTime: frame
    })
  ];
}
