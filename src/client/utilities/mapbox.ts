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
