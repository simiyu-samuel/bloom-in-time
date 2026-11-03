import {
  createSystem, Grabbed, Pressed, GrabSystem, VisibilityState, UIKitMLAsset,
  UIKit, Mesh, MeshBasicMaterial, SphereGeometry, Vector3,
} from '@iwsdk/core';
import type { Entity, Object3D, CatmullRomCurve3 } from '@iwsdk/core';
import { GardenPiece, GardenSocket, GardenState } from './garden-components.ts';
import { GardenSession } from './application/session.ts';
import { readSave, writeSave, defaults } from './application/storage.ts';
import type { Preferences } from './application/storage.ts';
import { firstLevel } from './content/first-level.ts';
import { points, routes, makeCurve } from './scene-assets/garden.scene-asset.ts';
import { GardenAudio } from './adapters-audio.ts';

type Action = 'play'|'bend'|'delay'|'place'|'return'|'turn'|'undo'|'hint'|'reset'|'confirm'|'cancel'|
  'mute'|'motion'|'contrast'|'left'|'right'|'recenter'|'near'|'far'|'lower'|'higher'|'xr'|'exit';

const domActions: Record<string, Action> = {
  play:'play','select-bend':'bend','select-delay':'delay',place:'place',return:'return',turn:'turn',
  undo:'undo',hint:'hint',reset:'reset','confirm-reset':'confirm','cancel-reset':'cancel',
  mute:'mute',motion:'motion',contrast:'contrast','view-left':'left','view-right':'right',
  recenter:'recenter',nearer:'near',farther:'far',lower:'lower',higher:'higher','enter-vr':'xr',
};
const spatialActions: Record<string, Action> = {
  Btn_Play:'play',Btn_Bend:'bend',Btn_Delay:'delay',Btn_Place:'place',Btn_Return:'return',
  Btn_Turn:'turn',Btn_Undo:'undo',Btn_Hint:'hint',Btn_Reset:'reset',Btn_ConfirmReset:'confirm',
  Btn_Mute:'mute',Btn_Motion:'motion',Btn_Contrast:'contrast',Btn_ViewLeft:'left',Btn_ViewRight:'right',
  Btn_Recenter:'recenter',Btn_Near:'near',Btn_Far:'far',Btn_Lower:'lower',Btn_Higher:'higher',
  Btn_XR:'xr',Btn_Exit:'exit',
};

export class GardenSystem extends createSystem({
  pieces: { required:[GardenPiece] },
  pressedPieces: { required:[GardenPiece,Pressed] },
  held: { required:[GardenPiece,Grabbed] },
  sockets: { required:[GardenSocket] },
  pressedSockets: { required:[GardenSocket,Pressed] },
}) {
  session = new GardenSession(firstLevel);
  private preferences: Preferences = { ...defaults };
  private audio = new GardenAudio();
  private tree!: Object3D;
  private state!: Entity;
  private panel!: UIKitMLAsset;
  private flowers: Object3D[] = [];
  private pulses: { mesh:Mesh; curve:CatmullRomCurve3; linkId:string; start:number; duration:number }[] = [];
  private beatDots: HTMLElement[] = [];
  private scratch = new Vector3();
  private second = new Vector3();
  private previousBeat = -1;
  private uiTime = 0;
  private confirming = false;
  private cancelling = false;
  private ready = false;
  private stored = true;

  init(): void {
    this.tree = this.world.requireSceneObject('garden');
    this.state = this.world.requireSceneEntity('garden');
    this.panel = this.world.requireSceneObject<UIKitMLAsset>('garden-controls');
    const save = readSave(firstLevel);
    this.preferences = save.preferences;
    this.session = new GardenSession(firstLevel, save.placements);
    this.flowers = [this.tree.getObjectByName('flower-a')!, this.tree.getObjectByName('flower-b')!];
    for (const [linkId, values] of Object.entries(routes)) {
      const mesh = new Mesh(new SphereGeometry(.012,10,8),new MeshBasicMaterial({color:'#ffe4a4'}));
      mesh.name = 'Pulse '+linkId; mesh.visible=false;
      this.world.createTransformEntity(mesh);
      this.pulses.push({ mesh, curve:makeCurve(values), linkId, start:-1, duration:firstLevel.links.find(link=>link.id===linkId)!.travelBeats });
    }
    const track = document.getElementById('beat-track')!;
    for (let index=0;index<8;index++) {
      const dot=document.createElement('span'); dot.className='beat'; track.append(dot); this.beatDots.push(dot);
    }
    for (const [id,action] of Object.entries(domActions)) {
      const element=document.getElementById(id);
      if (!element) continue;
      const listener=()=>this.act(action);
      element.addEventListener('click',listener);
      this.cleanupFuncs.push(()=>element.removeEventListener('click',listener));
    }
    for (const [id,action] of Object.entries(spatialActions)) {
      const element=this.panel.requireElementById(id);
      element.name=id;
      const listener=()=>this.act(action);
      element.addEventListener('click',listener);
      this.cleanupFuncs.push(()=>element.removeEventListener('click',listener));
    }
    const toggle=document.getElementById('settings-toggle')!;
    const close=document.getElementById('settings-close')!;
    const setSettings=(open:boolean)=>{
      document.getElementById('settings-panel')!.hidden=!open;
      toggle.setAttribute('aria-expanded',String(open));
      if (open) close.focus(); else toggle.focus();
    };
    const openSettings=()=>setSettings(document.getElementById('settings-panel')!.hidden);
    const closeSettings=()=>setSettings(false);
    toggle.addEventListener('click',openSettings); close.addEventListener('click',closeSettings);
    this.cleanupFuncs.push(()=>toggle.removeEventListener('click',openSettings),()=>close.removeEventListener('click',closeSettings));

    this.cleanupFuncs.push(
      this.queries.pressedPieces.subscribe('qualify',(entity)=>{
        if (!this.ready) return;
        this.session.select(entity.getValue(GardenPiece,'pieceId'));
      }),
      this.queries.pressedSockets.subscribe('qualify',(entity)=>{
        if (this.ready) this.place(entity.getValue(GardenSocket,'socketId') ?? undefined);
      }),
      this.queries.held.subscribe('qualify',(entity)=>{
        if (!this.ready || this.cancelling) return;
        this.session.select(entity.getValue(GardenPiece,'pieceId'));
        this.session.beginManipulation(); this.audio.suspend();
      }),
      this.queries.held.subscribe('disqualify',(entity)=>{
        if (!this.ready || this.cancelling) return;
        const object=entity.object3D;
        if (!object) { this.session.endManipulation(); return; }
        object.getWorldPosition(this.scratch);
        this.tree.worldToLocal(this.scratch);
        this.second.set(...points.hold);
        if (this.scratch.distanceTo(this.second)<.09) this.place('hold');
        else if (this.scratch.z>.19) this.removeSelected();
        this.session.endManipulation();
        if (!this.session.paused) this.audio.unlock();
        this.syncPieces();
      }),
      this.world.visibilityState.subscribe((visibility)=>{
        const immersive=visibility!==VisibilityState.NonImmersive;
        document.body.classList.toggle('immersive',immersive);
        if (this.panel) this.panel.visible=immersive;
        if (visibility===VisibilityState.VisibleBlurred) this.cancelAndPause();
        this.panel?.requireElementById('Btn_XR').setProperties({display:immersive?'none':'flex'});
        this.panel?.requireElementById('Btn_Exit').setProperties({display:immersive?'flex':'none'});
      }),
      this.session.subscribe(()=>this.refresh()),
    );
    const onHidden=()=>{ if (document.hidden) this.cancelAndPause(); };
    let detachInputWatch: (()=>void) | undefined;
    const attachInputWatch=()=>{
      detachInputWatch?.();
      const xrSession=this.world.renderer.xr.getSession();
      if (!xrSession) return;
      const lostInput=(event:XRInputSourcesChangeEvent)=>{ if (event.removed.length) this.cancelAndPause(); };
      xrSession.addEventListener('inputsourceschange',lostInput);
      detachInputWatch=()=>xrSession.removeEventListener('inputsourceschange',lostInput);
    };
    const onSessionEnd=()=>{ this.confirming=false; this.cancelAndPause(); detachInputWatch?.(); document.body.classList.remove('immersive'); };
    document.addEventListener('visibilitychange',onHidden);
    this.world.renderer.xr.addEventListener('sessionend',onSessionEnd);
    this.world.renderer.xr.addEventListener('sessionstart',attachInputWatch);
    attachInputWatch();
    this.cleanupFuncs.push(
      ()=>document.removeEventListener('visibilitychange',onHidden),
      ()=>this.world.renderer.xr.removeEventListener('sessionend',onSessionEnd),
      ()=>this.world.renderer.xr.removeEventListener('sessionstart',attachInputWatch),
      ()=>detachInputWatch?.(),
      ()=>this.audio.dispose(),
    );
    this.ready=true;
    this.syncPieces(); this.refresh();
    document.getElementById('loading')!.hidden=true;
  }

  private cancelAndPause(): void {
    this.cancelling=true;
    const grabbing=this.world.getSystem(GrabSystem);
    for (const entity of this.queries.held.entities) grabbing?.forceRelease(entity);
    this.session.pause(); this.audio.suspend();
    this.cancelling=false; this.syncPieces();
  }

  private place(socketId='hold'): void {
    if (!this.session.selected) {
      this.session.message='Choose the bend or delay pod first.'; this.session.notify(); return;
    }
    this.session.dispatch({type:'place',socketId,pieceId:this.session.selected,orientationId:'forward'});
  }

  private removeSelected(): void {
    const entry=Object.entries(this.session.placements).find(([,p])=>p.pieceId===this.session.selected);
    if (entry) this.session.dispatch({type:'remove',socketId:entry[0]});
  }

  private act(action:Action): void {
    this.audio.unlock();
    switch (action) {
      case 'play':
        if (this.session.paused) this.session.play(); else this.cancelAndPause();
        break;
      case 'bend': this.session.select('bend-1'); break;
      case 'delay': this.session.select('delay-1'); break;
      case 'place': this.place(); break;
      case 'return': this.removeSelected(); break;
      case 'turn': {
        const entry=Object.entries(this.session.placements).find(([,p])=>p.pieceId===this.session.selected);
        if (entry && entry[0]==='hold') this.session.dispatch({type:'rotate',socketId:'hold',orientationId:entry[1].orientationId==='forward'?'reverse':'forward'});
        break;
      }
      case 'undo': this.session.dispatch({type:'undo'}); break;
      case 'hint': this.session.dispatch({type:'requestHint'}); break;
      case 'reset': this.confirming=!this.confirming; break;
      case 'confirm':
        this.session.dispatch({type:'reset'}); this.confirming=false; this.session.select(null); break;
      case 'cancel': this.confirming=false; break;
      case 'mute': this.preferences.muted=!this.preferences.muted; break;
      case 'motion': this.preferences.reducedMotion=!this.preferences.reducedMotion; break;
      case 'contrast': this.preferences.highContrast=!this.preferences.highContrast; break;
      case 'left': this.tree.rotation.y-=Math.PI/8; break;
      case 'right': this.tree.rotation.y+=Math.PI/8; break;
      case 'near': this.tree.position.z=Math.min(-.55,this.tree.position.z+.1); break;
      case 'far': this.tree.position.z=Math.max(-1.5,this.tree.position.z-.1); break;
      case 'lower': this.tree.position.y=Math.max(.65,this.tree.position.y-.05); break;
      case 'higher': this.tree.position.y=Math.min(1.3,this.tree.position.y+.05); break;
      case 'recenter': this.tree.position.set(0,1.05,-.95); this.tree.rotation.set(0,0,0); break;
      case 'xr': void Promise.resolve(this.world.launchXR()).catch(()=>{this.session.message='VR entry was unavailable. You can keep playing here.';this.session.notify();}); break;
      case 'exit': this.cancelAndPause(); void this.world.exitXR(); break;
    }
    this.refresh();
  }

  private syncPieces(): void {
    if (!this.ready) return;
    for (const entity of this.queries.pieces.entities) {
      if (entity.hasComponent(Grabbed) || !entity.object3D) continue;
      const id=entity.getValue(GardenPiece,'pieceId');
      const entry=Object.entries(this.session.placements).find(([,p])=>p.pieceId===id);
      const object=entity.object3D;
      if (entry) {
        const point=points[entry[0] as 'hold'|'fork'];
        object.position.set(point[0],point[1]+.012,point[2]);
        object.rotation.y=entry[1].orientationId==='reverse'?Math.PI:0;
      } else {
        object.position.set(id==='delay-1'?.15:id==='fork-1'?0:-.15,.06,.27);
        object.rotation.set(0,0,0);
      }
      object.scale.setScalar(this.session.selected===id?1.12:1);
    }
  }

  private refresh(): void {
    if (!this.ready) return;
    const session=this.session, a=session.evaluation.arrivals['flower-a']?.[0], b=session.evaluation.arrivals['flower-b']?.[0];
    this.syncPieces(); this.previousBeat=-1;
    for (const pulse of this.pulses) {
      const event=session.evaluation.events.find(e=>e.type==='depart'&&e.linkId===pulse.linkId);
      pulse.start=event?.cycleBeat ?? -1;
    }
    this.audio.muted=this.preferences.muted;
    document.body.classList.toggle('reduced-motion',this.preferences.reducedMotion);
    document.body.classList.toggle('high-contrast',this.preferences.highContrast);
    document.body.dataset.complete=String(session.complete);
    document.body.dataset.revision=String(session.revision);
    const text=(id:string,value:string)=>{document.getElementById(id)!.textContent=value;};
    text('arrival-a',a===undefined?'Waiting':a+' beats'); text('arrival-b',b===undefined?'Waiting':b+' beats');
    text('harmony-status',session.complete?'A little world, awake.':session.evaluation.solved?'In harmony':a!==undefined&&b!==undefined?'Almost in harmony':'A flower is waiting');
    text('garden-message',session.message);
    text('play-label',session.paused?'Wake the garden':'Pause a moment');
    text('play-note',session.complete?'You made something beautiful.':'Take your time. There is no rush.');
    text('mute',this.preferences.muted?'Sound off':'Sound on');
    document.getElementById('select-bend')!.classList.toggle('selected',session.selected==='bend-1');
    document.getElementById('select-delay')!.classList.toggle('selected',session.selected==='delay-1');
    (document.getElementById('undo') as HTMLButtonElement).disabled=!session.canUndo;
    for (const [id,value] of [['mute',this.preferences.muted],['motion',this.preferences.reducedMotion],['contrast',this.preferences.highContrast]] as const) {
      document.getElementById(id)!.setAttribute('aria-pressed',String(value));
    }
    document.getElementById('reset-dialog')!.hidden=!this.confirming;
    this.panel.requireElementById<UIKit.Text>('GardenStatus').setProperties({text:session.message,color:this.preferences.highContrast?'#102a1b':'#465a48'});
    this.panel.requireElementById<UIKit.Text>('ArrivalStatus').setProperties({text:'Flower A: '+(a??'waiting')+'   Flower B: '+(b??'waiting')});
    this.panel.requireElementById('PanelRoot').setProperties({backgroundColor:this.preferences.highContrast?'#ffffff':session.complete?'#d1e1b5':'#f4f1df'});
    this.panel.requireElementById('Btn_PlayLabel').setProperties({text:session.paused?'Play':'Pause'});
    this.panel.requireElementById('Btn_ResetLabel').setProperties({text:this.confirming?'Cancel':'Reset'});
    this.panel.requireElementById('Btn_ConfirmReset').setProperties({display:this.confirming?'flex':'none'});
    this.panel.requireElementById('Btn_MuteLabel').setProperties({text:this.preferences.muted?'Sound off':'Sound on'});
    this.panel.requireElementById('Btn_MotionLabel').setProperties({text:this.preferences.reducedMotion?'Motion reduced':'Motion on'});
    this.state.setValue(GardenState,'revision',session.revision);
    this.state.setValue(GardenState,'complete',session.complete);
    this.state.setValue(GardenState,'paused',session.paused);
    this.state.setValue(GardenState,'leftArrival',a??-1);
    this.state.setValue(GardenState,'rightArrival',b??-1);
    this.stored=writeSave(firstLevel,session.placements,this.preferences);
    if (!this.stored) text('play-note','Progress cannot be saved in this browser. You can still play.');
  }

  update(delta:number): void {
    if (!this.ready) return;
    this.session.advance(delta);
    const beat=this.session.beat;
    this.state.setValue(GardenState,'beat',beat);
    const visible=!this.session.paused&&!this.session.manipulating;
    for (const pulse of this.pulses) {
      const progress=pulse.start>=0?(beat-pulse.start)/pulse.duration:-1;
      pulse.mesh.visible=visible&&progress>=0&&progress<1;
      if (pulse.mesh.visible) {
        pulse.curve.getPointAt(progress,this.scratch);
        this.tree.localToWorld(this.scratch); pulse.mesh.position.copy(this.scratch);
      }
    }
    const wrapped=beat<this.previousBeat;
    for (let index=0;index<2;index++) {
      const arrival=this.session.evaluation.arrivals[index===0?'flower-a':'flower-b']?.[0];
      const fresh=arrival!==undefined&&visible&&beat>=arrival&&(wrapped||this.previousBeat<arrival);
      if (fresh) this.audio.note(index===0?72:76);
      const bloom=this.session.complete || (arrival!==undefined&&visible&&beat>=arrival&&beat<arrival+.7);
      const target=bloom?1.12:.60;
      const flower=this.flowers[index];
      const scale=this.preferences.reducedMotion?target:flower.scale.x+(target-flower.scale.x)*Math.min(1,delta*7);
      flower.scale.setScalar(scale);
    }
    this.previousBeat=beat;
    this.uiTime+=delta;
    if (this.uiTime>.12) {
      this.uiTime=0;
      for (let index=0;index<this.beatDots.length;index++) this.beatDots[index].classList.toggle('active',visible&&Math.floor(beat)===index);
    }
  }
}
