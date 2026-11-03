import { Vector3 } from '@iwsdk/core';
import type { World } from '@iwsdk/core';

const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const center=new Vector3(0,1.18,-1.05);
/** Desktop inspection only. XR cameras remain owned by the tracked player rig. */
export class DesktopView {
  private yaw=.24;
  private pitch=.20;
  private distance=2.35;
  private targetYaw=.24;
  private targetPitch=.20;
  private targetDistance=2.35;
  private down=false;
  private moved=false;
  private pointerId=-1;
  private x=0;
  private y=0;
  private wasXR=false;
  private canvas:HTMLCanvasElement;
  private cleanup:(()=>void)[]=[];

  constructor(private world:World) {
    this.canvas=world.renderer.domElement;
    const down=(event:PointerEvent)=>{
      if (event.button!==0||world.renderer.xr.isPresenting) return;
      this.down=true;this.moved=false;this.pointerId=event.pointerId;this.x=event.clientX;this.y=event.clientY;
    };
    const move=(event:PointerEvent)=>{
      if (!this.down||event.pointerId!==this.pointerId||world.renderer.xr.isPresenting) return;
      const dx=event.clientX-this.x,dy=event.clientY-this.y;
      if (!this.moved&&Math.hypot(dx,dy)<4) return;
      this.moved=true;this.canvas.classList.add('dragging');
      this.canvas.setPointerCapture(event.pointerId);
      this.targetYaw-=dx*.005;this.targetPitch=clamp(this.targetPitch+dy*.004,.05,.65);
      this.x=event.clientX;this.y=event.clientY;
    };
    const up=()=>{this.down=false;this.canvas.classList.remove('dragging');};
    const wheel=(event:WheelEvent)=>{
      if (world.renderer.xr.isPresenting||event.ctrlKey) return;
      event.preventDefault();this.targetDistance=clamp(this.targetDistance+event.deltaY*.0015,1.8,3.3);
    };
    const release=()=>up();
    this.canvas.addEventListener('pointerdown',down);this.canvas.addEventListener('pointermove',move);
    this.canvas.addEventListener('pointerup',up);this.canvas.addEventListener('pointercancel',up);
    this.canvas.addEventListener('wheel',wheel,{passive:false});window.addEventListener('blur',release);
    this.cleanup.push(()=>this.canvas.removeEventListener('pointerdown',down),()=>this.canvas.removeEventListener('pointermove',move),
      ()=>this.canvas.removeEventListener('pointerup',up),()=>this.canvas.removeEventListener('pointercancel',up),
      ()=>this.canvas.removeEventListener('wheel',wheel),()=>window.removeEventListener('blur',release));
    this.apply();
  }

  reset():void { this.targetYaw=.24;this.targetPitch=.20;this.targetDistance=2.35; }
  private apply():void {
    const horizontal=Math.cos(this.pitch)*this.distance;
    this.world.camera.position.set(center.x+Math.sin(this.yaw)*horizontal,
      center.y+Math.sin(this.pitch)*this.distance,center.z+Math.cos(this.yaw)*horizontal);
    this.world.camera.lookAt(center);
  }
  update(delta:number):void {
    const xr=this.world.renderer.xr.isPresenting;
    if (xr) {this.wasXR=true;return;}
    const changed=this.wasXR||Math.abs(this.yaw-this.targetYaw)>.0001||Math.abs(this.pitch-this.targetPitch)>.0001||Math.abs(this.distance-this.targetDistance)>.0001;
    this.wasXR=false;
    if (!changed) return;
    const weight=Math.min(1,delta*12);
    this.yaw+=(this.targetYaw-this.yaw)*weight;this.pitch+=(this.targetPitch-this.pitch)*weight;
    this.distance+=(this.targetDistance-this.distance)*weight;this.apply();
  }
  dispose():void {for (const dispose of this.cleanup) dispose();}
}
