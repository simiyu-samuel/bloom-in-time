import { createComponent, Types } from '@iwsdk/core';
export const GardenPiece = createComponent('GardenPiece', {
  pieceId: { type: Types.String, default: '' },
});
export const GardenSocket = createComponent('GardenSocket', {
  socketId: { type: Types.String, default: '' },
});
export const GardenState = createComponent('GardenState', {
  selectedPiece: { type: Types.String, default: '' },
  uiMode: { type: Types.String, default: 'main' },
  revision: { type: Types.Int32, default: 0 },
  complete: { type: Types.Boolean, default: false },
  paused: { type: Types.Boolean, default: true },
  beat: { type: Types.Float32, default: 0 },
  leftArrival: { type: Types.Int32, default: 3 },
  rightArrival: { type: Types.Int32, default: 4 },
});
