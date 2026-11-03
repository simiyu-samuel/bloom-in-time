import {
  DataTexture, RGBAFormat, LinearFilter, Sprite, SpriteMaterial, AdditiveBlending,
  MeshStandardMaterial, Mesh, TubeGeometry, CatmullRomCurve3, Vector3, BufferGeometry,
} from '@iwsdk/core';
import { LoftSurface, sampleRange } from './lib/hardsurface.ts';

export const finish = (color:string, emissive='#000000', intensity=0) =>
  new MeshStandardMaterial({color,emissive,emissiveIntensity:intensity,roughness:.78,metalness:.06});

export function leafGeometry(length=.16, width=.035): BufferGeometry {
  return LoftSurface.blade([
    {x:0,leadZ:-.001,trailZ:.001,thickUp:.001,y:0},
    {x:length*.22,leadZ:-width*.8,trailZ:width*.8,thickUp:.002,y:length*.08},
    {x:length*.55,leadZ:-width,trailZ:width,thickUp:.002,y:length*.10},
    {x:length*.85,leadZ:-width*.4,trailZ:width*.4,thickUp:.001,y:length*.08},
    {x:length,leadZ:-.0005,trailZ:.0005,thickUp:.0005,y:length*.03},
  ]).build(sampleRange(0,length,12),8,true);
}

export function curve(values:readonly (readonly number[])[]): CatmullRomCurve3 {
  return new CatmullRomCurve3(values.map(p=>new Vector3(p[0],p[1],p[2])));
}

export function stem(name:string, values:number[][], radius:number, material:MeshStandardMaterial, taper=1): Mesh {
  const path=curve(values), geometry=new TubeGeometry(path,32,radius,7,false);
  if (taper!==1) {
    const positions=geometry.getAttribute('position');
    for (let ring=0;ring<=32;ring++) {
      const center=path.getPointAt(ring/32), factor=1+(taper-1)*ring/32;
      for (let j=0;j<=7;j++) {
        const index=ring*8+j;
        positions.setXYZ(index,center.x+(positions.getX(index)-center.x)*factor,
          center.y+(positions.getY(index)-center.y)*factor,center.z+(positions.getZ(index)-center.z)*factor);
      }
    }
    positions.needsUpdate=true;geometry.computeVertexNormals();
  }
  const mesh=new Mesh(geometry,material);mesh.name=name;return mesh;
}

const bytes=new Uint8Array(32*32*4);
for (let y=0;y<32;y++) for (let x=0;x<32;x++) {
  const distance=Math.hypot((x-15.5)/15.5,(y-15.5)/15.5), i=(y*32+x)*4;
  bytes[i]=bytes[i+1]=bytes[i+2]=255;
  bytes[i+3]=Math.round(255*Math.max(0,1-distance)**2.5);
}
export const glowTexture=new DataTexture(bytes,32,32,RGBAFormat);
glowTexture.magFilter=LinearFilter;glowTexture.minFilter=LinearFilter;glowTexture.needsUpdate=true;
const halos=new Map<string,SpriteMaterial>();
export function halo(name:string,color:string,size:number): Sprite {
  if (!halos.has(color)) halos.set(color,new SpriteMaterial({map:glowTexture,color,
    transparent:true,opacity:.8,blending:AdditiveBlending,depthWrite:false}));
  const sprite=new Sprite(halos.get(color)!);sprite.name=name;sprite.scale.setScalar(size);
  sprite.userData.iwsdkPreviewBounds='exclude';return sprite;
}
