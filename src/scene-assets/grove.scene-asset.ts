import {
  AdditiveBlending, BufferGeometry, Color, DoubleSide, Float32BufferAttribute,
  Group, InstancedMesh, Matrix4, Mesh, MeshBasicMaterial, MeshStandardMaterial,
  Object3D, Points, PointsMaterial, SphereGeometry, Vector3,
} from '@iwsdk/core';
import { LoftSurface, makeRandom, placeOnSurface, surfaceFrame } from './lib/hardsurface.ts';

/** Moonlit glade. Meters; ground origin, Y up, -Z forward; no runtime side effects. */
export function createGrove(): Group {
  const grove = new Group();
  grove.name = 'Moonwater grove';
  const random = makeRandom(6219);
  const tau = Math.PI * 2;
  const materials = {
    earth: new MeshStandardMaterial({ color: '#345349', vertexColors: true, roughness: 1 }),
    stone: new MeshStandardMaterial({ color: '#607879', vertexColors: true, roughness: .94 }),
    bark: new MeshStandardMaterial({ color: '#3c5b5c', vertexColors: true, roughness: 1 }),
    water: new MeshStandardMaterial({ color: '#133e48', emissive: '#102b39', emissiveIntensity: .3, roughness: .24, metalness: .28 }),
    leaf: new MeshStandardMaterial({ color: '#547a6c', emissive: '#163b36', emissiveIntensity: .12, roughness: .88 }),
    fern: new MeshStandardMaterial({ color: '#587f70', emissive: '#173c35', emissiveIntensity: .1, roughness: .92, side: DoubleSide }),
    moss: new MeshStandardMaterial({ color: '#5c7c65', roughness: 1 }),
    ripple: new MeshBasicMaterial({ color: '#396169', transparent: true, opacity: .42, depthWrite: false }),
    moon: new MeshBasicMaterial({ color: '#c9dcc9' }),
  };
  type Batch = { p: number[]; c: number[] };
  const ground: Batch = { p: [], c: [] }, stone: Batch = { p: [], c: [] }, bark: Batch = { p: [], c: [] };
  function addGeometry(batch: Batch, geometry: BufferGeometry, color: Color, matrix?: Matrix4) {
    if (matrix) geometry.applyMatrix4(matrix);
    const flat = geometry.index ? geometry.toNonIndexed() : geometry;
    const positions = flat.getAttribute('position');
    for (let i = 0; i < positions.count; i++) {
      batch.p.push(positions.getX(i), positions.getY(i), positions.getZ(i));
      batch.c.push(color.r, color.g, color.b);
    }
    if (flat !== geometry) flat.dispose();
    geometry.dispose();
  }
  function meshFromBatch(name: string, batch: Batch, material: MeshStandardMaterial) {
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(batch.p, 3));
    geometry.setAttribute('color', new Float32BufferAttribute(batch.c, 3));
    geometry.computeVertexNormals();
    const mesh = new Mesh(geometry, material); mesh.name = name; grove.add(mesh);
  }
  function terrainHeight(r: number, a: number): number {
    if (r < 1.96) return 0;
    if (r < 2.16) return -(r - 1.96) * .6;
    if (r < 3.05) return -.12;
    const lift = Math.min(1, (r - 3.05) / 1.7);
    return -.12 + lift * (.25 + .055 * Math.sin(a * 3) + .04 * Math.cos(a * 5 + r));
  }
  function ringGeometry(radii: number[], height: (r: number, a: number) => number, segments = 96): BufferGeometry {
    const p: number[] = [], indices: number[] = [];
    for (const r of radii) for (let s = 0; s <= segments; s++) {
      const a = s / segments * tau;
      p.push(Math.cos(a) * r, height(r, a), Math.sin(a) * r);
    }
    for (let j = 0; j < radii.length - 1; j++) for (let s = 0; s < segments; s++) {
      const a = j * (segments + 1) + s, b = a + segments + 1;
      indices.push(a, a + 1, b, a + 1, b + 1, b);
    }
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new Float32BufferAttribute(p, 3));
    geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
  }
  const floorRadii = [.001, 1.9, 1.96, 2.16, 3.05, 3.24, 4.1, 5.6, 7.7];
  for (let j = 0; j < floorRadii.length - 1; j++) {
    addGeometry(ground, ringGeometry(floorRadii.slice(j, j + 2), terrainHeight), new Color().setHSL(.43, .12, .51 - j * .028));
  }
  meshFromBatch('Sculpted moss glade floor', ground, materials.earth);
  const water = new Mesh(ringGeometry([2.13, 2.55, 3.08], () => -.067, 112), materials.water);
  water.name = 'Still moonwater basin'; grove.add(water);

  // Low chipped voussoirs form a shallow double curb around the dark water.
  function stoneWedge(inner: number, outer: number, start: number, end: number, top: number, height: number): BufferGeometry {
    const p: number[] = [], indices: number[] = [], divisions = 3;
    for (let level = 0; level < 2; level++) for (let edge = 0; edge < 2; edge++) for (let i = 0; i <= divisions; i++) {
      const a = start + (end - start) * i / divisions;
      const r = edge ? outer : inner;
      p.push(Math.cos(a) * r, top - height + level * height - (i % 2) * .009, Math.sin(a) * r);
    }
    const stride = divisions + 1;
    for (let i = 0; i < divisions; i++) {
      const a = i, b = i + stride, c = i + stride * 2, d = i + stride * 3;
      indices.push(c, c + 1, d, c + 1, d + 1, d, a, b, a + 1, a + 1, b, b + 1,
        a, a + 1, c, a + 1, c + 1, c, b, d, b + 1, b + 1, d, d + 1);
    }
    indices.push(0, stride * 2, stride, stride, stride * 2, stride * 3);
    indices.push(divisions, stride + divisions, stride * 2 + divisions,
      stride + divisions, stride * 3 + divisions, stride * 2 + divisions);
    const geometry = new BufferGeometry(); geometry.setAttribute('position', new Float32BufferAttribute(p, 3));
    geometry.setIndex(indices); geometry.computeVertexNormals(); return geometry;
  }
  for (const [radius, width, count, top] of [[2.03, .15, 37, .018], [3.16, .25, 43, .025]]) {
    for (let i = 0; i < count; i++) {
      const a = i * tau / count;
      addGeometry(stone, stoneWedge(radius - width / 2, radius + width / 2, a + .009, a + tau / count - .013, top + random() * .015, .11),
        new Color().setHSL(.48, .08, .52 + random() * .15));
    }
  }
  const rippleGeometry = new BufferGeometry(), ripplePositions: number[] = [];
  for (let k = 0; k < 4; k++) {
    const geometry = ringGeometry([2.27 + k * .20, 2.278 + k * .20], () => -.063, 96);
    const flat = geometry.toNonIndexed(), positions = flat.getAttribute('position');
    for (let i = 0; i < positions.count; i++) ripplePositions.push(positions.getX(i), positions.getY(i), positions.getZ(i));
    flat.dispose(); geometry.dispose();
  }
  rippleGeometry.setAttribute('position', new Float32BufferAttribute(ripplePositions, 3));
  rippleGeometry.computeVertexNormals();
  const ripples = new Mesh(rippleGeometry, materials.ripple); ripples.name = 'Quiet concentric water threads'; grove.add(ripples);

  const leafSurface = LoftSurface.blade([
    { x: 0, leadZ: -.012, trailZ: .012, thickUp: .008, y: 0 },
    { x: .20, leadZ: -.12, trailZ: .12, thickUp: .018, y: .045 },
    { x: .50, leadZ: -.19, trailZ: .19, thickUp: .026, y: .07 },
    { x: .78, leadZ: -.12, trailZ: .12, thickUp: .014, y: .025 },
    { x: 1, leadZ: -.002, trailZ: .002, thickUp: .002, y: -.055 },
  ]);
  const leafGeometry = leafSurface.build([0, .20, .50, .78, 1], 4, true);
  leafGeometry.rotateY(-Math.PI / 2); // Leaf points along the surface frame's outward +Z.
  const leaves = new InstancedMesh(leafGeometry, materials.leaf, 234);
  leaves.name = 'Branch attached silver sage leaves';
  const dummy = new Object3D(); let leafIndex = 0;
  for (let tree = 0; tree < 13; tree++) {
    const a = tree / 13 * tau + .17;
    const r = tree % 3 === 0 ? 6.65 : 4.4 + random() * 1.15;
    const x = Math.cos(a) * r, z = Math.sin(a) * r, y = terrainHeight(r, a) - .025;
    const h = 3.35 + random() * 1.65, lean = .35 + random() * .35;
    const driftX = Math.cos(a + .5) * lean, driftZ = Math.sin(a + .5) * lean;
    const trunk = LoftSurface.tube([
      { z: 0, halfW: .32, hUp: .27, cx: 0, cy: 0 },
      { z: .25, halfW: .19, hUp: .17, cx: -.025, cy: .025 },
      { z: h * .43, halfW: .125, hUp: .12, cx: driftX * .27, cy: -driftZ * .27 },
      { z: h * .76, halfW: .075, hUp: .07, cx: driftX * .65, cy: -driftZ * .65 },
      { z: h, halfW: .024, hUp: .022, cx: driftX, cy: -driftZ },
    ]);
    const treeMatrix = new Matrix4().makeRotationX(-Math.PI / 2).setPosition(x, y, z);
    addGeometry(bark, trunk.build([0, .25, h * .43, h * .76, h], 7, true), new Color('#96a8a3'), treeMatrix);
    for (let root = 0; root < 4; root++) {
      const rootAngle = a + root * Math.PI / 2 + .32;
      const rootSurface = LoftSurface.tube([
        { z: 0, halfW: .16, hUp: .20, hDown: .05, cy: .07 },
        { z: .36, halfW: .105, hUp: .08, hDown: .04, cy: .035 },
        { z: .86, halfW: .012, hUp: .012, hDown: .008, cy: .005 },
      ]);
      const rootMatrix = new Matrix4().makeRotationY(rootAngle).setPosition(x, y + .018, z);
      addGeometry(bark, rootSurface.build([0, .36, .86], 5, true), new Color('#889c92'), rootMatrix);
    }
    for (let fork = 0; fork < 2; fork++) {
      const direction = a + (fork ? 1.18 : -1.12);
      const dx = Math.cos(direction), dz = Math.sin(direction);
      const height = h * (fork ? .72 : .57), length = .8 + random() * .45;
      const branch = LoftSurface.tube([
        { z: 0, halfW: .09, hUp: .08, cx: 0, cy: 0 },
        { z: .27, halfW: .066, hUp: .06, cx: dx * .34, cy: -dz * .34 },
        { z: .65, halfW: .039, hUp: .036, cx: dx * length * .72, cy: -dz * length * .72 },
        { z: .96, halfW: .012, hUp: .012, cx: dx * length, cy: -dz * length },
      ]);
      const branchMatrix = new Matrix4().makeRotationX(-Math.PI / 2)
        .setPosition(x + driftX * height / h * .72, y + height, z + driftZ * height / h * .72);
      addGeometry(bark, branch.build([0, .27, .65, .96], 6, true), new Color('#a3b4a8'), branchMatrix);
      for (let leaf = 0; leaf < 9; leaf++) {
        const along = .16 + leaf * .088, side = leaf % 2 ? 1 : -1;
        const outward = new Vector3(dx * .3 - dz * side, -.20, -(dz * .3 + dx * side));
        const localFrame = branch.frameToward(along, outward);
        const frame = surfaceFrame(localFrame.origin.clone().applyMatrix4(branchMatrix),
          localFrame.normal.clone().transformDirection(branchMatrix), localFrame.tangent.clone().transformDirection(branchMatrix));
        placeOnSurface(dummy, frame, .004);
        const scale = .62 + random() * .38;
        dummy.scale.set(scale * (.85 + random() * .2), scale, scale);
        dummy.updateMatrix(); leaves.setMatrixAt(leafIndex, dummy.matrix);
        leaves.setColorAt(leafIndex++, new Color().setHSL(.40 + random() * .08, .15, .63 + random() * .16));
      }
    }
  }
  meshFromBatch('Continuous leaning trunks roots and forks', bark, materials.bark);
  leaves.instanceMatrix.needsUpdate = true;
  if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true;
  grove.add(leaves);

  meshFromBatch('Chipped double stone water curb', stone, materials.stone);
  const ruin: Batch = { p: [], c: [] };
  const ruinMatrix = new Matrix4().makeRotationY(-.32).setPosition(4.1, .11, -4.4);
  for (const side of [-1, 1]) {
    const column = LoftSurface.tube([
      { z: 0, halfW: .32, hUp: .28, power: 5 },
      { z: .16, halfW: .25, hUp: .23, power: 5 },
      { z: 1.2, halfW: .19, hUp: .18, cx: side * .055, power: 5 },
      { z: side < 0 ? 1.58 : 1.31, halfW: .22, hUp: .21, cx: side * .07, power: 5 },
    ]);
    const columnMatrix = ruinMatrix.clone().multiply(new Matrix4().makeTranslation(side * .93, 0, 0))
      .multiply(new Matrix4().makeRotationX(-Math.PI / 2));
    addGeometry(ruin, column.build([0, .16, 1.2, side < 0 ? 1.58 : 1.31], 8, true), new Color('#829994'), columnMatrix);
  }
  const arch = LoftSurface.blade([
    { x: -1.08, y: 1.42, leadZ: -.21, trailZ: .21, thickUp: .13, thickDown: .13, power: 4 },
    { x: -.76, y: 1.77, leadZ: -.20, trailZ: .20, thickUp: .12, thickDown: .12, power: 4 },
    { x: -.35, y: 1.98, leadZ: -.18, trailZ: .18, thickUp: .12, thickDown: .12, power: 4 },
    { x: .12, y: 2.04, leadZ: -.18, trailZ: .18, thickUp: .11, thickDown: .11, power: 4 },
    { x: .42, y: 1.96, leadZ: -.16, trailZ: .16, thickUp: .09, thickDown: .10, power: 4 },
  ]);
  addGeometry(ruin, arch.build([-1.08, -.76, -.35, .12, .42], 6, true), new Color('#92a49a'), ruinMatrix);
  meshFromBatch('Broken moon gate distant garden ruin', ruin, materials.stone);

  // A whole fern frond is one connected silhouette, reused with different rooted poses.
  const fernPositions: number[] = [];
  function triangle(a: number[], b: number[], c: number[]) { fernPositions.push(...a, ...b, ...c); }
  for (let i = 0; i < 9; i++) {
    const t = (i + 1) / 10, y = .25 * Math.sin(t * 1.65), z = t * .82;
    const width = .24 * Math.sin(t * Math.PI) * (1 - t * .3);
    for (const side of [-1, 1]) {
      const root = [0, y, z], left = [side * width * .55, y + .022, z - .032];
      const tip = [side * width, y + .035, z + .09], right = [side * width * .50, y + .016, z + .06];
      triangle(root, left, tip); triangle(root, tip, right);
    }
    const nextY = .25 * Math.sin((t + .10) * 1.65), nextZ = z + .082;
    triangle([-.007, y, z], [.007, y, z], [-.005, nextY, nextZ]);
    triangle([.007, y, z], [.005, nextY, nextZ], [-.005, nextY, nextZ]);
  }
  const fernGeometry = new BufferGeometry(); fernGeometry.setAttribute('position', new Float32BufferAttribute(fernPositions, 3));
  fernGeometry.computeVertexNormals();
  const ferns = new InstancedMesh(fernGeometry, materials.fern, 48); ferns.name = 'Rooted arching fern crowns';
  for (let i = 0; i < 48; i++) {
    const clump = Math.floor(i / 4), a = clump / 12 * tau + .30, r = 3.45 + (clump % 3) * .30;
    const spread = a + (i % 4 - 1.5) * .67;
    const origin = new Vector3(Math.cos(a) * r, terrainHeight(r, a) + .015, Math.sin(a) * r);
    placeOnSurface(dummy, surfaceFrame(origin, new Vector3(Math.cos(spread), .45, Math.sin(spread)), new Vector3(Math.sin(spread), 0, -Math.cos(spread))));
    const scale = .68 + random() * .42; dummy.scale.setScalar(scale); dummy.updateMatrix();
    ferns.setMatrixAt(i, dummy.matrix); ferns.setColorAt(i, new Color().setHSL(.41, .18, .61 + random() * .14));
  }
  ferns.instanceMatrix.needsUpdate = true; if (ferns.instanceColor) ferns.instanceColor.needsUpdate = true; grove.add(ferns);

  const pebbleSurface = LoftSurface.tube([
    { z: -.34, halfW: .04, hUp: .025, hDown: .025, power: 3 },
    { z: -.10, halfW: .29, hUp: .15, hDown: .05, power: 3 },
    { z: .19, halfW: .26, hUp: .12, hDown: .05, power: 3 },
    { z: .36, halfW: .03, hUp: .025, hDown: .025, power: 3 },
  ]);
  const pebbleGeometry = pebbleSurface.build([-.34, -.10, .19, .36], 5, true);
  const pebbles = new InstancedMesh(pebbleGeometry, materials.stone, 26); pebbles.name = 'Water worn stones at fern roots';
  const moss = new InstancedMesh(pebbleGeometry, materials.moss, 31); moss.name = 'Moss pillows woven through outer curb';
  for (let i = 0; i < 57; i++) {
    const isMoss = i >= 26, j = isMoss ? i - 26 : i;
    const a = j * 2.399963 + .4, r = isMoss ? 3.18 + random() * .24 : 3.5 + random() * 2.8;
    dummy.position.set(Math.cos(a) * r, isMoss ? .03 : terrainHeight(r, a) + .025, Math.sin(a) * r);
    dummy.rotation.set(0, a + .4, 0);
    const scale = .36 + random() * .54;
    dummy.scale.set(scale, isMoss ? .19 : scale * .65, isMoss ? scale * 1.25 : scale);
    dummy.updateMatrix();
    if (isMoss) moss.setMatrixAt(j, dummy.matrix);
    else { pebbles.setMatrixAt(j, dummy.matrix); pebbles.setColorAt(j, new Color('#9fa99c')); }
  }
  pebbles.instanceMatrix.needsUpdate = true; if (pebbles.instanceColor) pebbles.instanceColor.needsUpdate = true;
  moss.instanceMatrix.needsUpdate = true; grove.add(pebbles, moss);

  const moon = new Mesh(new SphereGeometry(.47, 20, 12), materials.moon);
  moon.name = 'Pale moon beyond the left canopy'; moon.position.set(-4.7, 5.25, -6.5); grove.add(moon);
  const fireflyGeometry = new BufferGeometry(), fireflyPositions: number[] = [];
  for (let i = 0; i < 38; i++) {
    const a = i * 2.399963, r = 2.45 + random() * 1.8;
    fireflyPositions.push(Math.cos(a) * r, .22 + random() * 1.20, Math.sin(a) * r);
  }
  fireflyGeometry.setAttribute('position', new Float32BufferAttribute(fireflyPositions, 3));
  const fireflies = new Points(fireflyGeometry, new PointsMaterial({
    color: '#edc77f', size: .026, transparent: true, opacity: .75,
    blending: AdditiveBlending, depthWrite: false, sizeAttenuation: true,
  }));
  fireflies.name = 'Grove fireflies'; fireflies.userData.iwsdkPreviewBounds = 'exclude'; grove.add(fireflies);
  // The editable prototype intentionally contains geometry/materials only. All motion belongs to the game system.
  grove.traverse(object => { object.castShadow = false; object.receiveShadow = false; });
  grove.userData.assetContract = {
    origin: 'Ground contact at the open glade center', forward: '-Z', up: '+Y',
    clearRadiusMeters: 1.94, waterRingMeters: [2.13, 3.08], deterministicSeed: 6219,
  };
  return grove;
}
