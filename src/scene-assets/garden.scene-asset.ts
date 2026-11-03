import {
  Group, Mesh, MeshStandardMaterial, SphereGeometry, CylinderGeometry,
  TubeGeometry, CatmullRomCurve3, Vector3, TorusGeometry, InstancedMesh, Object3D,
} from '@iwsdk/core';
import type { PieceKind } from '../domain/model.ts';

export const points = {
  spark: [0, 0.075, 0.20],
  fork: [0, 0.16, 0.07],
  hold: [-0.18, 0.25, 0.015],
  'flower-a': [-0.29, 0.43, -0.04],
  'flower-b': [0.28, 0.47, -0.07],
} as const;

export const routes: Record<string, number[][]> = {
  'source-fork': [[0,.075,.20], [0,.10,.17], [0,.16,.07]],
  'fork-hold': [[0,.16,.07], [-.09,.22,.06], [-.18,.25,.015]],
  'hold-a': [[-.18,.25,.015], [-.28,.32,-.01], [-.29,.43,-.04]],
  'fork-b': [[0,.16,.07], [.21,.17,.13], [.34,.30,.02], [.28,.47,-.07]],
};

const material = (color: string, emissive = '#000000', intensity = 0) =>
  new MeshStandardMaterial({ color, emissive, emissiveIntensity: intensity, roughness: .78, metalness: .04 });

export function makeCurve(values: readonly (readonly number[])[]): CatmullRomCurve3 {
  return new CatmullRomCurve3(values.map(v => new Vector3(v[0], v[1], v[2])));
}

function tube(name: string, values: number[][], radius: number, mat: MeshStandardMaterial): Mesh {
  const mesh = new Mesh(new TubeGeometry(makeCurve(values), 24, radius, 6, false), mat);
  mesh.name = name;
  return mesh;
}

/** Parentless, deterministic miniature. Origin is the center of its moss surface. */
export function createGarden(): Group {
  const garden = new Group();
  garden.name = 'Sleeping garden';
  const bark = material('#477b65'), moss = material('#6b9271'), stone = material('#d7d3bc');
  const base = new Mesh(new CylinderGeometry(.40,.36,.055,48), stone);
  base.name = 'Ceramic island'; base.position.y = -.045; base.scale.z = .83;
  garden.add(base);
  const soil = new Mesh(new CylinderGeometry(.386,.39,.025,48), moss);
  soil.name = 'Moss'; soil.position.y = -.008; soil.scale.z = .83;
  garden.add(soil);
  const rim = new Mesh(new TorusGeometry(.39,.006,6,64), material('#eee4bf'));
  rim.name = 'Island rim'; rim.rotation.x = Math.PI/2; rim.scale.y = .83; rim.position.y = .005;
  garden.add(rim);
  for (const [id, values] of Object.entries(routes)) garden.add(tube(id, values, .011, bark));
  garden.add(tube('Quiet branch', [[0,.10,.12],[.04,.30,-.08],[.0,.54,-.12]], .013, bark));

  const leafGeometry = new SphereGeometry(1,8,6);
  const leaves = new InstancedMesh(leafGeometry, material('#8cad79'), 28);
  leaves.name = 'Small leaves';
  const dummy = new Object3D();
  for (let i=0; i<28; i++) {
    const angle = i * 2.399963;
    const radius = .13 + .19 * ((i%7)/7);
    dummy.position.set(Math.cos(angle)*radius, .018 + (i%3)*.012, Math.sin(angle)*radius*.7);
    dummy.rotation.set(0,angle,.15);
    dummy.scale.set(.05,.013,.022);
    dummy.updateMatrix(); leaves.setMatrixAt(i,dummy.matrix);
  }
  garden.add(leaves);
  const sprig = new InstancedMesh(leafGeometry, material('#b6c891'), 12);
  sprig.name = 'Canopy leaves';
  for (let i=0; i<12; i++) {
    dummy.position.set(Math.sin(i*1.8)*.07, .25+i*.022, -.06-(i%3)*.025);
    dummy.rotation.set(.3,i*.8,.4); dummy.scale.set(.05,.012,.018);
    dummy.updateMatrix(); sprig.setMatrixAt(i,dummy.matrix);
  }
  garden.add(sprig);

  const petalGeometry = new SphereGeometry(1,12,8);
  for (const [id,color] of [['flower-a','#f0c47e'],['flower-b','#d6e3b1']]) {
    const flower = new Group(); flower.name = id;
    const position = points[id as 'flower-a'|'flower-b'];
    flower.position.set(position[0],position[1],position[2]);
    const petalMat = material(color, color, .14);
    for (let i=0;i<6;i++) {
      const petal = new Mesh(petalGeometry,petalMat);
      petal.name = id+' petal '+i;
      const angle=i*Math.PI/3;
      petal.position.set(Math.cos(angle)*.037,Math.sin(angle)*.037,0);
      petal.scale.set(.028,.018,.012); petal.rotation.z=angle;
      flower.add(petal);
    }
    const center = new Mesh(new SphereGeometry(.021,12,8),material('#fff1b6','#f4cf78',.65));
    center.name='Flower heart'; center.position.z=.014; flower.add(center);
    garden.add(flower);
  }
  const spark = new Mesh(new SphereGeometry(.023,16,10), material('#f9d17f','#ffc76b',1.2));
  spark.name='Seed of light'; spark.position.set(...points.spark); garden.add(spark);
  return garden;
}

export function createPiece(kind: PieceKind): Group {
  const group = new Group(); group.name = kind+' piece';
  const color = kind === 'delay' ? '#e7b967' : kind === 'bend' ? '#b6d2b1' : '#a7c5bf';
  const mat = material(color, color, .12);
  const cradle = new Mesh(new CylinderGeometry(.043,.043,.014,24), material('#d9d8c2'));
  cradle.name='Piece base'; group.add(cradle);
  if (kind === 'delay') {
    const body = new Mesh(new SphereGeometry(.03,16,10),mat); body.name='Delay seed';
    body.position.y=.032; body.scale.set(.85,1.05,.85); group.add(body);
    const ring = new Mesh(new TorusGeometry(.034,.003,6,32), material('#fff0b5','#f9d17f',.4));
    ring.name='One beat ring'; ring.position.y=.033; ring.rotation.x=Math.PI/2; group.add(ring);
  } else {
    const paths = kind === 'bend' ? [[[-.03,.02,0],[0,.022,0],[0,.02,-.03]]] :
      [[[-.03,.02,0],[0,.035,0],[.03,.02,-.025]],[[0,.035,0],[.01,.025,.025],[.03,.02,.025]]];
    paths.forEach((path,index)=>group.add(tube('Conduit '+index,path,.008,mat)));
  }
  return group;
}

export function createSocket(): Group {
  const group = new Group(); group.name='Pathway socket';
  const disc=new Mesh(new CylinderGeometry(.05,.048,.008,24),material('#d7d9bd'));
  disc.name='Socket center'; group.add(disc);
  const rim=new Mesh(new TorusGeometry(.05,.004,6,32),material('#edd39b','#d8bd7a',.15));
  rim.name='Socket ring'; rim.rotation.x=Math.PI/2; rim.position.y=.006; group.add(rim);
  return group;
}
