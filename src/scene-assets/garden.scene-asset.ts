import {
  Group, Mesh, SphereGeometry, CylinderGeometry, TorusGeometry, LatheGeometry,
  InstancedMesh, Object3D, Vector2, MeshBasicMaterial,
} from '@iwsdk/core';
import type { PieceKind } from '../domain/model.ts';
import { finish, leafGeometry, stem, curve, halo } from './botanical.ts';
export const makeCurve=curve;
export const gardenOrigin=[0,.84,-1.05] as const;
export const points={
  spark:[0,.10,.26], fork:[0,.25,.09], hold:[-.24,.42,.02],
  'flower-a':[-.39,.69,-.10], 'flower-b':[.36,.78,-.13],
} as const;
export const trayPositions={ 'bend-1':[-.20,.07,.40], 'delay-1':[.20,.07,.40] } as const;
export const routes:Record<string,number[][]>={
  'source-fork':[[0,.10,.26],[.015,.17,.19],[0,.25,.09]],
  'fork-hold':[[0,.25,.09],[-.12,.32,.12],[-.24,.42,.02]],
  'hold-a':[[-.24,.42,.02],[-.41,.51,-.02],[-.39,.69,-.10]],
  'fork-b':[[0,.25,.09],[.32,.29,.15],[.47,.53,.02],[.36,.78,-.13]],
};
const leaf=leafGeometry(), petal=leafGeometry(.105,.037);

function flower(id:string,color:string): Group {
  const flower=new Group();flower.name=id;const anchor=points[id as 'flower-a'|'flower-b'];
  flower.position.set(anchor[0],anchor[1],anchor[2]);
  const petals=finish(color,color,.12);
  for (let i=0;i<8;i++) {
    const pivot=new Group();pivot.name='Petal pivot '+i;pivot.rotation.z=i*Math.PI/4;
    const mesh=new Mesh(petal,petals);mesh.name='Sculpted petal '+i;mesh.rotation.x=Math.PI/2;
    mesh.position.x=.008;pivot.add(mesh);flower.add(pivot);
  }
  const heart=new Mesh(new SphereGeometry(.026,12,8),finish('#ffefb4','#ffd48a',1.5));
  heart.name='Flower heart';heart.scale.z=.6;heart.position.z=.016;flower.add(heart);
  const glow=halo('Flower glow',color,.30);glow.material=glow.material.clone();glow.material.opacity=.35;glow.position.z=.022;flower.add(glow);
  return flower;
}

/** A living island: origin at moss surface, +Y up, flowers face +Z toward the player. */
export function createGarden(): Group {
  const garden=new Group();garden.name='The living island';
  const wood=finish('#365d59'), jade=finish('#688e74'), stone=finish('#273f43');
  const gold=finish('#b4935d','#bc7e36',.12), moss=finish('#4c7763');
  const profile=[[.04,-.23],[.16,-.20],[.33,-.15],[.46,-.085],[.52,-.025],[.51,.012]].map(p=>new Vector2(...p as [number,number]));
  const bowlGeometry=new LatheGeometry(profile,48);
  const attr=bowlGeometry.getAttribute('position');
  for (let i=0;i<attr.count;i++) {
    const x=attr.getX(i),z=attr.getZ(i),angle=Math.atan2(z,x), ripple=1+.018*Math.sin(angle*5)+.012*Math.cos(angle*9);
    attr.setXYZ(i,x*ripple,attr.getY(i),z*ripple*.87);
  }
  bowlGeometry.computeVertexNormals();
  const bowl=new Mesh(bowlGeometry,stone);bowl.name='Sculpted stone vessel';garden.add(bowl);
  const earth=new Mesh(new SphereGeometry(1,32,10),moss);earth.name='Moss cushion';earth.scale.set(.505,.045,.44);garden.add(earth);
  for (const [radius,y] of [[.512,.005],[.47,-.08]]) {
    const rim=new Mesh(new TorusGeometry(radius,.0045,6,64),gold);rim.name='Inlaid brass rim '+y;
    rim.rotation.x=Math.PI/2;rim.scale.y=.87;rim.position.y=y;garden.add(rim);
  }
  const trunkPoints=[[0,.015,.03],[.055,.23,.015],[-.025,.48,-.07],[.08,.72,-.15],[.015,.91,-.17]];
  const trunkCurve=curve(trunkPoints);
  garden.add(stem('Ancient trunk',trunkPoints,.030,wood,.30));
  for (let i=0;i<4;i++) {
    const a=i*Math.PI/2;
    garden.add(stem('Root '+i,[[0,.08,.03],[Math.cos(a)*.16,.015,Math.sin(a)*.15],[Math.cos(a)*.39,.01,Math.sin(a)*.33]],.017,wood,.30));
  }
  const lines=finish('#b6bc87','#d4ae63',.22);
  for (const [id,values] of Object.entries(routes)) {
    garden.add(stem('Living pathway '+id,values,.014,wood));
    const core=stem('Light channel '+id,values,.0045,lines);garden.add(core);
  }
  const branches=[
    [[.025,.36,-.04],[-.12,.46,-.13],[-.19,.60,-.16]],
    [[.0,.53,-.10],[.14,.61,-.19],[.24,.70,-.22]],
    [[.06,.71,-.15],[-.06,.78,-.19],[-.15,.86,-.20]],
  ];
  branches.forEach((path,i)=>garden.add(stem('Canopy branch '+i,path,.009,wood,.25)));
  const dummy=new Object3D();
  const canopy=new InstancedMesh(leaf,jade,42);canopy.name='Canopy leaves';
  for (let i=0;i<24;i++) {
    const side=i%2===0?-1:1;
    dummy.position.copy(trunkCurve.getPointAt(.25+Math.floor(i/2)*.060));
    dummy.position.x+=side*.006;
    dummy.rotation.set(1.05,side<0?2.7:.3,side*.45);dummy.scale.setScalar(.6+(i%3)*.13);
    dummy.updateMatrix();canopy.setMatrixAt(i,dummy.matrix);
  }
  for (let i=0;i<18;i++) {
    const branch=curve(branches[Math.floor(i/6)]),side=i%2===0?-1:1;
    dummy.position.copy(branch.getPointAt(.35+Math.floor((i%6)/2)*.28));
    dummy.rotation.set(1.0,side<0?2.7:.3,side*.4);dummy.scale.setScalar(.7+(i%3)*.12);
    dummy.updateMatrix();canopy.setMatrixAt(24+i,dummy.matrix);
  }
  garden.add(canopy);
  const groundLeaves=new InstancedMesh(leaf,finish('#769b78'),64);groundLeaves.name='Fern carpet';
  for (let i=0;i<64;i++) {
    const angle=i*2.399963, radius=.13+.25*((i%11)/11);
    dummy.position.set(Math.cos(angle)*radius,.025,Math.sin(angle)*radius*.87-.04);
    dummy.rotation.set(.1,i*1.7,.15+(i%4)*.07);dummy.scale.setScalar(.25+(i%5)*.08);
    dummy.updateMatrix();groundLeaves.setMatrixAt(i,dummy.matrix);
  }
  garden.add(groundLeaves);
  const growth=new Group();growth.name='Restored growth';
  const newLeaves=new InstancedMesh(leaf,finish('#9bbd8e','#3d7954',.18),38);newLeaves.name='New fern fronds';
  for (let i=0;i<38;i++) {
    const angle=i*2.399963,radius=.15+.22*((i%8)/8);
    dummy.position.set(Math.cos(angle)*radius,.028,Math.sin(angle)*radius*.80-.07);
    dummy.rotation.set(.15,i*1.2,.5);dummy.scale.setScalar(.55+(i%4)*.12);
    dummy.updateMatrix();newLeaves.setMatrixAt(i,dummy.matrix);
  }
  growth.add(newLeaves);garden.add(growth);
  for (const [id,color] of [['flower-a','#edbd6c'],['flower-b','#acd7cf']]) garden.add(flower(id,color));
  const spark=new Mesh(new SphereGeometry(.029,16,10),finish('#f9d17e','#ffce75',1.8));
  spark.name='Seed of light';spark.position.set(...points.spark);garden.add(spark);
  const sourceGlow=halo('Seed glow','#ffcd76',.18);sourceGlow.position.copy(spark.position);garden.add(sourceGlow);
  for (const [id,position] of Object.entries(trayPositions)) {
    const cup=new Mesh(new CylinderGeometry(.065,.060,.014,24),stone);cup.name='Tray cradle '+id;
    cup.position.set(position[0],.045,position[2]);garden.add(cup);
    const ring=new Mesh(new TorusGeometry(.058,.003,6,32),gold);ring.name='Tray inlay '+id;
    ring.rotation.x=Math.PI/2;ring.position.set(position[0],.053,position[2]);garden.add(ring);
  }
  return garden;
}

export function createPiece(kind:PieceKind):Group {
  const group=new Group();group.name=kind+' piece';
  const mat=finish(kind==='delay'?'#e1b15f':'#91bfaa',kind==='delay'?'#e3a641':'#83bba9',.3);
  const base=new Mesh(new CylinderGeometry(.044,.038,.016,24),finish('#607c78'));
  base.name='Glazed piece base';group.add(base);
  if (kind==='delay') {
    const pod=new Mesh(new SphereGeometry(1,16,12),mat);pod.name='Delay seed';
    pod.scale.set(.027,.040,.027);pod.position.y=.037;group.add(pod);
    const ring=new Mesh(new TorusGeometry(.035,.003,6,40),finish('#ffe2a2','#e6ad50',.6));
    ring.name='One beat ring';ring.position.y=.037;ring.rotation.x=Math.PI/2;group.add(ring);
  } else {
    const paths=kind==='bend'?[[[-.03,.02,0],[0,.027,0],[0,.02,-.03]]]:
      [[[-.03,.02,0],[0,.032,0],[.03,.02,-.025]],[[0,.032,0],[.01,.025,.025],[.03,.02,.025]]];
    paths.forEach((path,index)=>group.add(stem('Conduit '+index,path,.008,mat)));
  }
  const selection=halo('Selection halo','#a4e7ef',.16);selection.visible=false;selection.position.y=.02;group.add(selection);
  return group;
}

export function createSocket():Group {
  const group=new Group();group.name='Light socket';
  const disc=new Mesh(new CylinderGeometry(.053,.049,.009,24),finish('#536f69'));disc.name='Socket center';group.add(disc);
  const ring=new Mesh(new TorusGeometry(.054,.004,6,40),new MeshBasicMaterial({color:'#f2d49b'}));
  ring.name='Socket ring';ring.rotation.x=Math.PI/2;ring.position.y=.007;group.add(ring);
  const glow=halo('Socket aura','#a3e5d8',.18);glow.position.y=.01;group.add(glow);
  return group;
}
