import {Deck} from '@deck.gl/core';

export default function initDeck(map, initialViewState) {
  const canvasEl = document.createElement('canvas');
  const mapEl = map.getDiv();
  let {clientWidth, clientHeight} = mapEl;
  canvasEl.width = clientWidth;
  canvasEl.height = clientHeight;
  canvasEl.position = 'absolute';

  const deck = new Deck({
    canvas: canvasEl,
    width: canvasEl.width,
    height: canvasEl.height,
    initialViewState,
    // Google maps has no rotating capabilities, so we disable rotation here.
    controller: {
      scrollZoom: false,
      dragPan: false,
      dragRotate: false,
      doubleClickZoom: false,
      touchZoom: false,
      touchRotate: false,
      keyboard: false,
    },
    layers: []
  });

  return deck;
}

