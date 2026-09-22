window.createCinematicBillboards = function(stage) {
  'use strict';
  const viewport=document.createElement('div');
  viewport.className='billboard-viewport';viewport.setAttribute('aria-hidden','true');
  const world=document.createElement('div');world.className='billboard-world';viewport.append(world);
  stage.querySelector('#picture').after(viewport);
  let data,faces=[],time=0,disposed=false,ready=false;
  const request=new AbortController();
  function resize(){
    const r=stage.getBoundingClientRect();
    world.style.transform=`translate(-50%,-50%) scale(${Math.max(r.width/1920,r.height/1080)})`;
  }
  function matrix(p){
    const [x0,y0,x1,y1,x2,y2,x3,y3]=p;
    const dx1=x1-x2,dx2=x3-x2,dy1=y1-y2,dy2=y3-y2;
    const sx=x0-x1+x2-x3,sy=y0-y1+y2-y3,den=dx1*dy2-dx2*dy1;
    if(Math.abs(den)<.001)return null;
    const g=(sx*dy2-dx2*sy)/den,h=(dx1*sy-sx*dy1)/den;
    return `matrix3d(${(x1-x0+g*x1)/800},${(y1-y0+g*y1)/800},0,${g/800},${(x3-x0+h*x3)/560},${(y3-y0+h*y3)/560},0,${h/560},0,0,1,0,${x0},${y0},0,1)`;
  }
  function render(){
    if(disposed||!ready)return;
    // Only replace actual photograph areas. Frames, paper borders, and robots
    // remain part of the original video. Fade with the generated fog/dissolve.
    const opacity=Math.min(1,Math.max(0,(time-12.95)/.5),Math.max(0,(19.15-time)/.5));
    viewport.style.opacity=String(opacity);
    if(!opacity)return;
    const f=time*data.fps;
    const index=Math.max(0,Math.min(data.frames.length-2,Math.floor((f-data.frames[0][0])/2)));
    const a=data.frames[index],b=data.frames[index+1],t=Math.max(0,Math.min(1,(f-a[0])/(b[0]-a[0])));
    faces.forEach((face,j)=>{
      const points=Array.from({length:8},(_,k)=>a[1+j*8+k]*(1-t)+b[1+j*8+k]*t);
      const transform=matrix(points);face.style.visibility=transform?'visible':'hidden';
      if(transform)face.style.transform=transform;
    });
  }
  fetch('assets/cinematic-content/billboard-tracks.json',{signal:request.signal})
    .then(response=>{if(!response.ok)throw new Error('Billboard tracks unavailable');return response.json();})
    .then(async tracks=>{
      if(disposed)return;data=tracks;
      const loads=[];
      faces=data.images.map((file,i)=>{
        const face=document.createElement('div');face.className='billboard-face';
        const label=document.createElement('span');label.textContent=data.titles[i];
        const img=new Image();img.alt='';img.src=`assets/cinematic-content/${file}`;
        loads.push(img.decode());face.append(label,img);world.append(face);return face;
      });
      await Promise.all(loads);if(disposed)return;ready=true;resize();render();
    }).catch(()=>{if(!disposed)viewport.remove();});
  // ScrollTrigger finishes resizing the pinned stage after the window event.
  // Observe its actual size so the billboard and video cover crops stay identical.
  const observer=new ResizeObserver(resize);observer.observe(stage);
  window.addEventListener('resize',resize);resize();
  return {update(t){time=t;render();},dispose(){disposed=true;request.abort();observer.disconnect();window.removeEventListener('resize',resize);viewport.remove();}};
};
