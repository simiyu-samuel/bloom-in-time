import { createGrove } from './scene-assets/grove.scene-asset.ts';
import { AssetType, defineAssets } from '@iwsdk/core';
import { createGarden, createPiece, createSocket } from './scene-assets/garden.scene-asset.ts';

export default defineAssets({
  garden: createGarden(),
  grove: createGrove(),
  bend: createPiece('bend'),
  splitter: createPiece('splitter'),
  delay: createPiece('delay'),
  socket: createSocket(),
  controls: {
    url: import.meta.env.BASE_URL + 'ui/garden.uikitml',
    type: AssetType.UIKitML,
    name: 'Garden controls',
  },
});
