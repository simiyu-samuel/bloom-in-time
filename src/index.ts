import { World } from '@iwsdk/core';
import projectOptions from 'virtual:iwsdk-project';
import { GardenSystem } from './garden-system.ts';
import './style.css';

World.create(document.getElementById('scene-container') as HTMLDivElement,projectOptions)
  .then(world=>world.registerSystem(GardenSystem))
  .catch(error=>{
    document.getElementById('loading')!.hidden=true;
    const panel=document.getElementById('error')!;
    panel.hidden=false;
    const title=document.createElement('h2');title.textContent='The garden could not wake just yet.';
    const message=document.createElement('p');message.textContent='Reload the page in a browser with WebGL enabled. Your saved progress stays in this browser.';
    const retry=document.createElement('button');retry.textContent='Try again';retry.onclick=()=>location.reload();
    panel.replaceChildren(title,message,retry);
    console.error('Bloom in Time failed to start',error);
  });
