"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export type RoomAppearance = { system: number; base: string; accent: string; sheen: number; room: number; yaw: number; elevation: number; zoom: number; warm: boolean };
type V3 = [number, number, number];
type V2 = [number, number];
const subtract = (a: V3, b: V3): V3 => [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
const dot = (a: V3, b: V3) => a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
const unit = (v: V3): V3 => { const l=Math.hypot(...v); return [v[0]/l,v[1]/l,v[2]/l]; };
const cross = (a: V3,b: V3): V3 => [a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];

// Seeded material artwork, separate from authentic project photographs.
function material(a: RoomAppearance) {
  const tile=document.createElement("canvas");tile.width=768;tile.height=768;
  const ctx=tile.getContext("2d",{willReadFrequently:true})!;
  let seed=31;
  const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  ctx.fillStyle=a.base;ctx.fillRect(0,0,768,768);
  if(a.system===0){
    const gradient=ctx.createLinearGradient(0,0,768,768);gradient.addColorStop(0,a.base);gradient.addColorStop(.45,a.accent);gradient.addColorStop(.7,a.base);gradient.addColorStop(1,a.accent);ctx.fillStyle=gradient;ctx.fillRect(0,0,768,768);
    for(let i=0;i<155;i++){
      const y=i*8-240;ctx.beginPath();ctx.moveTo(-80,y);
      ctx.bezierCurveTo(190,y+270+Math.sin(i*.09)*150,390,y-200,850,y+180);
      ctx.strokeStyle=i%3===0?a.accent:a.base;ctx.globalAlpha=.12+random()*.22;ctx.lineWidth=2+random()*22;ctx.stroke();
    }
  }else if(a.system===1){
    for(let i=0;i<24000;i++){const x=random()*768,y=random()*768,r=1+random()*3;ctx.fillStyle=[a.accent,a.base,"#272b30","#e7e4dd"][i%4];ctx.globalAlpha=.65+random()*.35;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+r*1.6,y+r*.3);ctx.lineTo(x+r,y+r);ctx.lineTo(x-r*.2,y+r*.8);ctx.closePath();ctx.fill();}
  }else{
    for(let i=0;i<450;i++){const x=random()*768,y=random()*768,r=25+random()*95;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,a.accent);g.addColorStop(1,"transparent");ctx.globalAlpha=.05+random()*.08;ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
    for(let i=0;i<16000;i++){ctx.globalAlpha=random()*.11;ctx.fillStyle=i%2?a.accent:"#333333";ctx.fillRect(random()*768,random()*768,1,1);}
  }
  ctx.globalAlpha=1;
  const light=ctx.createLinearGradient(0,0,768,600);light.addColorStop(0,"#00000040");light.addColorStop(1,"#00000000");ctx.fillStyle=light;ctx.fillRect(0,0,768,768);
  if(a.sheen>0){ctx.save();ctx.translate(80,300);ctx.transform(1,.45,-.25,1,0,0);ctx.fillStyle=`rgba(237,245,250,${a.sheen*.19})`;for(let x=0;x<2;x++)for(let y=0;y<2;y++)ctx.fillRect(x*105,y*130,96,120);ctx.restore();}
  return tile;
}

/** Perspective projection on a software-backed canvas avoids WebGL driver failures. */
export function FloorRoom({ appearance, onOrbit, exportRef }: { appearance: RoomAppearance; onOrbit: (yaw:number,elevation:number)=>void; exportRef:RefObject<(()=>void)|null> }) {
  const canvasRef=useRef<HTMLCanvasElement>(null);
  const latest=useRef(appearance);
  const renderRef=useRef<(()=>void)|null>(null);
  const drag=useRef<{x:number;y:number;yaw:number;elevation:number}|null>(null);
  const [ready,setReady]=useState(false);
  useEffect(()=>{latest.current=appearance;renderRef.current?.();},[appearance]);
  useEffect(()=>{
    const canvas=canvasRef.current;if(!canvas)return;
    const ctx=canvas.getContext("2d",{alpha:false,willReadFrequently:true});if(!ctx)return;
    let texture:HTMLCanvasElement;let materialKey="";let frame=0;
    const render=()=>{
      const a=latest.current,bounds=canvas.getBoundingClientRect(),ratio=Math.min(devicePixelRatio||1,1.5);
      const w=Math.max(1,Math.round(bounds.width*ratio)),h=Math.max(1,Math.round(bounds.height*ratio));
      if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
      const key=[a.system,a.base,a.accent,a.sheen].join(":");if(key!==materialKey){texture=material(a);materialKey=key;}
      const yaw=a.yaw*Math.PI/180,el=a.elevation*Math.PI/180;
      const camera:V3=[Math.sin(yaw)*Math.cos(el)*a.zoom,.6+Math.sin(el)*a.zoom,Math.cos(yaw)*Math.cos(el)*a.zoom];
      const forward=unit(subtract([0,.6,0],camera)),right=unit(cross(forward,[0,1,0])),up=cross(right,forward);
      const project=(p:V3):V2=>{const d=subtract(p,camera),z=dot(d,forward),f=Math.min(w*.95,h*1.1);return [w/2+dot(d,right)*f/z,h*.53-dot(d,up)*f/z];};
      const polygon=(points:V3[],color:string)=>{const p=points.map(project);ctx.beginPath();p.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fillStyle=color;ctx.fill();};
      const bg=ctx.createLinearGradient(0,0,0,h);bg.addColorStop(0,"#28212f");bg.addColorStop(1,"#15111b");ctx.fillStyle=bg;ctx.fillRect(0,0,w,h);
      const shadow=ctx.createRadialGradient(w*.5,h*.72,0,w*.5,h*.72,w*.44);shadow.addColorStop(0,"#00000099");shadow.addColorStop(1,"#00000000");ctx.fillStyle=shadow;ctx.fillRect(0,0,w,h);
      // Architectural shell: a six-by-six floor, two open walls and slab edge.
      polygon([[-3,0,-3],[3,0,-3],[3,2.8,-3],[-3,2.8,-3]],a.warm?"#d3c5b2":"#c8c7c8");
      polygon([[-3,0,3],[-3,0,-3],[-3,2.8,-3],[-3,2.8,3]],a.warm?"#e7d9c4":"#e0dfe0");
      polygon([[-2.99,.85,-.6],[-2.99,.85,1.9],[-2.99,2.35,1.9],[-2.99,2.35,-.6]],"#8fa8b4");
      for(let x=0;x<2;x++)for(let y=0;y<2;y++){const z=-.53+x*1.22,top=.92+y*.72;polygon([[-2.98,top,z],[-2.98,top,z+1.1],[-2.98,top+.62,z+1.1],[-2.98,top+.62,z]],a.warm?"#e4ddd0":"#d7e8ec");}
      polygon([[-3,-.14,3],[3,-.14,3],[3,0,3],[-3,0,3]],"#66636a");
      polygon([[3,-.14,3],[3,-.14,-3],[3,0,-3],[3,0,3]],"#45434a");
      // Affine texture triangles tessellate the projected floor plane.
      const triangle=(src:V2[],dst:V2[])=>{
        const [s0,s1,s2]=src,[d0,d1,d2]=dst;
        const sx1=s1[0]-s0[0],sy1=s1[1]-s0[1],sx2=s2[0]-s0[0],sy2=s2[1]-s0[1],det=sx1*sy2-sx2*sy1;
        const ax=((d1[0]-d0[0])*sy2-(d2[0]-d0[0])*sy1)/det,bx=((d1[1]-d0[1])*sy2-(d2[1]-d0[1])*sy1)/det;
        const cy=((d2[0]-d0[0])*sx1-(d1[0]-d0[0])*sx2)/det,dy=((d2[1]-d0[1])*sx1-(d1[1]-d0[1])*sx2)/det;
        const center:V2=[(d0[0]+d1[0]+d2[0])/3,(d0[1]+d1[1]+d2[1])/3];
        ctx.save();ctx.beginPath();dst.forEach(([x,y],i)=>{const dx=x-center[0],dy=y-center[1],length=Math.hypot(dx,dy);const px=x+dx/length*.65,py=y+dy/length*.65;if(i)ctx.lineTo(px,py);else ctx.moveTo(px,py);});ctx.closePath();ctx.clip();ctx.setTransform(ax,bx,cy,dy,d0[0]-ax*s0[0]-cy*s0[1],d0[1]-bx*s0[0]-dy*s0[1]);ctx.drawImage(texture,0,0);ctx.restore();
      };
      polygon([[-3,0,-3],[-3,0,3],[3,0,3],[3,0,-3]],a.base);
      const n=18;
      for(let z=0;z<n;z++)for(let x=0;x<n;x++){
        const uv:V2[]=[[x*768/n,z*768/n],[(x+1)*768/n,z*768/n],[(x+1)*768/n,(z+1)*768/n],[x*768/n,(z+1)*768/n]];
        const pts=uv.map(([u,v])=>project([u/128-3,.002,v/128-3]));triangle([uv[0],uv[1],uv[2]],[pts[0],pts[1],pts[2]]);triangle([uv[0],uv[2],uv[3]],[pts[0],pts[2],pts[3]]);
      }
      polygon([[-3,.01,-3],[3,.01,-3],[3,.09,-3],[-3,.09,-3]],"#8b878a");
      const boxes:{lo:V3;hi:V3;colors:string[]}[]=[];
      const box=(lo:V3,hi:V3,colors:string[])=>boxes.push({lo,hi,colors});
      if(a.room===0){
        box([-2.45,.12,-2.55],[-.35,.5,-1.85],["#82634f","#ab8a6c","#674c3d"]);
        box([-2.4,.5,-2.48],[-.4,.63,-1.9],["#bcb3a8","#d7cec2","#a99d91"]);
        box([1.85,0,-2.5],[2.4,.6,-1.95],["#a49b91","#c4b8a8","#877c72"]);
        box([2.02,.6,-2.35],[2.22,1.4,-2.15],["#546650","#7d8e6c","#40523e"]);
      }else if(a.room===1){
        for(let i=0;i<3;i++)box([-2.65+i*.72,0,-2.8],[-1.98+i*.72,1.85,-2.2],["#535962","#747a82","#3d424b"]);
        box([.2,0,-2.8],[2.6,.85,-2.15],["#4d535b","#b4b1aa","#343942"]);
      }else{
        box([-2.25,0,-2.25],[-1.25,.7,-1.25],["#c6beb4","#eee6dd","#a99f94"]);
        box([1.3,0,-2.3],[2.3,1.15,-1.3],["#c6beb4","#eee6dd","#a99f94"]);
        polygon([[-.9,1.3,-2.99],[.9,1.3,-2.99],[.9,2.35,-2.99],[-.9,2.35,-2.99]],"#514453");
      }
      boxes.sort((a,b)=>dot(subtract(b.lo,camera),forward)-dot(subtract(a.lo,camera),forward));
      for(const {lo:[x,y,z],hi:[X,Y,Z],colors:c} of boxes){
        polygon([[x-.08,.006,z],[X+.15,.006,z],[X+.3,.006,Z+.3],[x,.006,Z+.25]],"#00000026");
        polygon([[x,y,Z],[X,y,Z],[X,Y,Z],[x,Y,Z]],c[0]);
        if(camera[0]>0)polygon([[X,y,Z],[X,y,z],[X,Y,z],[X,Y,Z]],c[2]);else polygon([[x,y,z],[x,y,Z],[x,Y,Z],[x,Y,z]],c[2]);
        polygon([[x,Y,z],[X,Y,z],[X,Y,Z],[x,Y,Z]],c[1]);
      }
      if(a.warm){ctx.fillStyle="#ffd1980a";ctx.fillRect(0,0,w,h);}
      setReady(true);
    };
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(render);};
    renderRef.current=schedule;const observer=new ResizeObserver(schedule);observer.observe(canvas);schedule();
    exportRef.current=()=>{render();const out=document.createElement("canvas");out.width=Math.max(canvas.width,600);out.height=Math.round(canvas.height*out.width/canvas.width)+64;const c=out.getContext("2d")!;c.drawImage(canvas,0,0,out.width,out.height-64);c.fillStyle="#17121e";c.fillRect(0,out.height-64,out.width,64);c.fillStyle="#eee4f4";c.font="12px sans-serif";c.fillText("110% COATINGS / FLOOR STUDIO",18,out.height-38);c.font="10px sans-serif";c.fillText("Illustrative concept. Confirm final color, pattern and sheen with a physical sample.",18,out.height-18);const link=document.createElement("a");link.download="110-coatings-floor-concept.png";link.href=out.toDataURL("image/png");link.click();};
    return()=>{cancelAnimationFrame(frame);observer.disconnect();renderRef.current=null;exportRef.current=null;};
  },[exportRef]);
  return <div className="floor-room">
    {!ready&&<div className="room-fallback"><p>Preparing your room preview…</p></div>}
    <canvas ref={canvasRef} className={ready?"ready":""} aria-label="Interactive three-dimensional floor concept. Use the camera sliders to change the view." onPointerDown={e=>{if(!ready)return;e.currentTarget.setPointerCapture(e.pointerId);drag.current={x:e.clientX,y:e.clientY,yaw:appearance.yaw,elevation:appearance.elevation};}} onPointerMove={e=>{const d=drag.current;if(d)onOrbit(Math.max(-35,Math.min(35,d.yaw+(e.clientX-d.x)*.2)),Math.max(20,Math.min(60,d.elevation+(e.clientY-d.y)*.16)));}} onPointerUp={()=>{drag.current=null;}} onPointerCancel={()=>{drag.current=null;}} onLostPointerCapture={()=>{drag.current=null;}} />
    <div className="room-badge">{ready?"LIVE 3D PREVIEW":"LOADING PREVIEW"}</div><div className="room-caption">Drag to look around · or use the camera controls</div>
  </div>;
}
