import { Group, Mesh, MeshBasicMaterial, SphereGeometry, Vector3, Points, Sprite } from '@iwsdk/core';
import type { Object3D, CatmullRomCurve3, BufferGeometry } from '@iwsdk/core';
import { routes, makeCurve } from './scene-assets/garden.scene-asset.ts';
import { halo } from './scene-assets/botanical.ts';
import type { GardenSession } from './application/session.ts';

type Pulse={root:Group; beads:Mesh[]; curve:CatmullRomCurve3; id:string; start:number; duration:number};
/** Presentation consumes the session; it never changes a layout or awards completion. */
export class GardenPresentation {
  private pulses:Pulse[]=[];
  private geometry=new SphereGeometry(.014,10,7);
  private material=new MeshBasicMaterial({color:'#fff1bc'});
  private scratch=new Vector3();
  private flowers:Object3D[];
  private petals:Object3D[][];
  private opening=[.18,.18];
  private growth?:Object3D;
  private restoration=0;
  private time=0;
  private fireflies?:Points;
  private fireflyBase?:Float32Array;
  private clonedGeometry?:BufferGeometry;

  constructor(private tree:Object3D, grove:Object3D) {
    this.flowers=['flower-a','flower-b'].map(id=>tree.getObjectByName(id)!);
    this.petals=this.flowers.map(f=>f.children.filter(c=>c.name.startsWith('Petal pivot')));
    this.growth=tree.getObjectByName('Restored growth');
    for (const [id,values] of Object.entries(routes)) {
      const root=new Group();root.name='Travelling light '+id;root.visible=false;
      const beads:Mesh[]=[];
      for (let i=0;i<3;i++) {
        const bead=new Mesh(this.geometry,this.material);bead.name='Pulse bead '+i;
        bead.scale.setScalar(i===0?1:.65-i*.15);beads.push(bead);root.add(bead);
      }
      const glow=halo('Pulse glow','#ffdb86',.14);beads[0].add(glow);
      tree.add(root);
      this.pulses.push({root,beads,curve:makeCurve(values),id,start:-1,duration:1});
    }
    // Decorative billboards must never enter the XR pointer raycaster, which has no camera.
    // Apply to placed clones, including the pulse glows created above.
    for (const root of [tree,grove]) root.traverse(object=>{
      if (object instanceof Sprite) object.raycast=()=>{};
    });
    const motes=grove.getObjectByName('Grove fireflies');
    if (motes instanceof Points) {
      this.fireflies=motes;this.clonedGeometry=motes.geometry.clone();motes.geometry=this.clonedGeometry;
      this.fireflyBase=Float32Array.from(motes.geometry.getAttribute('position').array);
    }
  }

  sync(session:GardenSession):void {
    for (const pulse of this.pulses) {
      pulse.start=session.evaluation.events.find(e=>e.type==='depart'&&e.linkId===pulse.id)?.cycleBeat??-1;
      pulse.duration=session.level.links.find(link=>link.id===pulse.id)!.travelBeats;
    }
  }

  update(delta:number, session:GardenSession, reducedMotion:boolean):void {
    this.time+=delta;
    const beat=session.beat, playing=!session.paused&&!session.manipulating;
    for (const pulse of this.pulses) {
      let progress=pulse.start<0?-1:(beat-pulse.start)/pulse.duration;
      if (reducedMotion&&progress>=0) progress=Math.floor(progress*8)/8;
      pulse.root.visible=playing&&progress>=0&&progress<1;
      if (pulse.root.visible) for (let i=0;i<pulse.beads.length;i++) {
        const at=Math.max(0,progress-i*.065);
        pulse.curve.getPointAt(at,this.scratch);pulse.beads[i].position.copy(this.scratch);
      }
    }
    for (let i=0;i<this.flowers.length;i++) {
      const arrival=session.evaluation.arrivals[i===0?'flower-a':'flower-b']?.[0];
      const lit=session.complete||(playing&&arrival!==undefined&&beat>=arrival&&beat<arrival+.9);
      const target=lit?1:.18;
      this.opening[i]=reducedMotion?target:this.opening[i]+(target-this.opening[i])*Math.min(1,delta*5);
      const open=this.opening[i],flower=this.flowers[i];
      for (const pivot of this.petals[i]) pivot.rotation.y=(1-open)*1.13;
      flower.scale.setScalar(.92+open*.08);
      flower.getObjectByName('Flower glow')?.scale.setScalar(.18+.17*open);
      const heart=flower.getObjectByName('Flower heart');if (heart) heart.position.z=.016+.012*open;
    }
    const restore=session.complete?1:0;
    this.restoration=reducedMotion?restore:this.restoration+(restore-this.restoration)*Math.min(1,delta*.9);
    this.growth?.scale.set(.55+.45*this.restoration,.08+.92*this.restoration,.55+.45*this.restoration);
    if (this.fireflies&&this.fireflyBase) {
      const positions=this.fireflies.geometry.getAttribute('position');
      for (let i=0;i<positions.count;i++) {
        const n=i*3;
        positions.setXYZ(i,this.fireflyBase[n]+(reducedMotion?0:.025*Math.sin(this.time*.4+i*2)),
          this.fireflyBase[n+1]+(reducedMotion?0:.045*Math.sin(this.time*.75+i)),this.fireflyBase[n+2]);
      }
      positions.needsUpdate=true;
    }
  }

  dispose():void {
    for (const pulse of this.pulses) pulse.root.removeFromParent();
    this.geometry.dispose();this.material.dispose();this.clonedGeometry?.dispose();
  }
}
