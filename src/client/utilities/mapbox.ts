import mapboxgl from 'mapbox-gl';

export const listingMapSmall = (
  token: string,
  coordinates: [number, number]
): void => {
  mapboxgl.accessToken = token;
  const map = new mapboxgl.Map({
    container: 'listing-map-small',
    style: 'mapbox://styles/ngannguyen/ckduucfa6083119movl7af027',
    scrollZoom: false,
    center: coordinates,
    zoom: 12,
    interactive: false,
  });

  const markerElement = document.createElement('div');
  markerElement.className = 'listing__info__map--marker';

  new mapboxgl.Marker({
    element: markerElement,
    anchor: 'center',
  })
    .setLngLat(coordinates)
    .addTo(map);
};

export const listingMapLarge = (
  token: string,
  coordinates: [number, number]
): void => {
  mapboxgl.accessToken = token;
  const map = new mapboxgl.Map({
    container: 'listing-map-large',
    style: 'mapbox://styles/ngannguyen/ckduucfa6083119movl7af027',
    center: coordinates,
    zoom: 12,
  });

  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

  map.on('load', function () {
    map.addSource('itemLocation', {
      type: 'geojson',
      data: {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates,
        },
        properties: {},
      },
    });

    map.addLayer({
      id: 'itemLocation-circle',
      type: 'circle',
      source: 'itemLocation',
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          // zoom is 12 (or less) -> circle radius will be 25px
          12,
          25,
          // zoom is 20 (or greater) -> circle radius will be 300px
          20,
          300,
        ],
        'circle-opacity': 0.4,
      },
    });
  });
};
