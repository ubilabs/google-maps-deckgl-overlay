export default function initMap(containerId, mapOptions) {
  const mapEl = document.getElementById(containerId);
  return new google.maps.Map(mapEl, mapOptions);
}
