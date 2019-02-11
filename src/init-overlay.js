export default function initOverlay(map, deck, tileSize) {
  const mapEl = map.getDiv();
  const canvasEl = deck.canvas;

  const overlay = new google.maps.OverlayView();
  overlay.setMap(map);

  let {clientWidth, clientHeight} = mapEl;
  let isMounted = false;

  // add resize listener to update deck according to map
  window.addEventListener('resize', () => {
    clientWidth = mapEl.clientWidth;
    clientHeight = mapEl.clientHeight;
    canvasEl.width = clientWidth;
    canvasEl.height = clientHeight;

    deck.setProps({
      width: clientWidth,
      heigth: clientHeight
    });
  });

  overlay.draw = () => {
    // Methods like map.getCenter() and map.getZoom() return rounded values that
    // don't stay in sync during zoom and pan gestures, so compute center and
    // zoom from the overlay projection, instead.
    // Don't call overlay.getPanes() until map has initialized.
    if (!isMounted) {
      const overlayLayerEl = overlay.getPanes().overlayLayer;
      overlayLayerEl.appendChild(canvasEl);
      isMounted = true;
    }
    
    // Fit canvas to current viewport.
    const bounds = map.getBounds();
    const nwContainerPx = new google.maps.Point(0, 0);
    const nw = overlay.projection.fromContainerPixelToLatLng(nwContainerPx);
    const nwDivPx = overlay.projection.fromLatLngToDivPixel(nw);
    canvasEl.style.top = nwDivPx.y + 'px';
    canvasEl.style.left = nwDivPx.x + 'px';
    // Compute fractional zoom.
    const zoom = Math.log2( overlay.projection.getWorldWidth() / tileSize ) - 1;
    // Compute fractional center.
    const centerPx = new google.maps.Point(clientWidth / 2, clientHeight / 2);
    const centerContainer = overlay.projection.fromContainerPixelToLatLng(centerPx);
    const latitude = centerContainer.lat();
    const longitude = centerContainer.lng();
    deck.setProps({viewState: { zoom, latitude, longitude }});

    if (deck.layerManager) {
      deck.animationLoop._setupFrame();
      deck.animationLoop._updateCallbackData(); // call callback
      deck.animationLoop.onRender(deck.animationLoop.animationProps); // end callback
    }
  }

  return overlay;
};
