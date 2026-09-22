(function(root) {
  'use strict';
  const beats = [
    ['intro',0,2,.7],['hero',2,2.8,1.4],['message',2.8,9.5,1.3],['benefits',9.5,13.2,1.6],
    ['project-0',13.2,14.5,1.1],['project-1',14.5,15.8,1.1],['project-2',15.8,17,1.1],['project-3',17,19.5,1.1],
    ['team',19.5,22.7,2],['process',22.7,25.8,1.7],
    ...Array.from({length:6},(_,i)=>[`service-${i}`,25.8+i*2.5/6,25.8+(i+1)*2.5/6,.8]),
    ...Array.from({length:5},(_,i)=>[`quote-${i}`,28.3+i*1.7/5,28.3+(i+1)*1.7/5,1.2]),
    ['contact',30,31.458333,1.4]
  ];
  const total = beats.reduce((sum,b)=>sum+b[3],0);
  const speeds=beats.map(b=>(b[2]-b[1])/b[3]);
  // Positive, monotone Hermite slopes keep camera speed continuous at chapter
  // boundaries without introducing reading freezes or backward overshoot.
  const slopes=[speeds[0],...speeds.slice(1).map((speed,i)=>{
    const before=beats[i][3],after=beats[i+1][3];
    const w1=2*after+before,w2=after+2*before;
    return (w1+w2)/(w1/speeds[i]+w2/speed);
  }),speeds[speeds.length-1]];
  const clamp = n=>Math.max(0,Math.min(1,n));
  function sample(progress) {
    if (progress >= 1) return {index:beats.length-1,local:1,time:beats[beats.length-1][2]};
    let units=clamp(progress)*total,index=0;
    while(index<beats.length-1 && units>=beats[index][3]) units-=beats[index++][3];
    const b=beats[index],local=clamp(units/b[3]);
    const t2=local*local,t3=t2*local;
    const time=(2*t3-3*t2+1)*b[1]+(t3-2*t2+local)*b[3]*slopes[index]
      +(-2*t3+3*t2)*b[2]+(t3-t2)*b[3]*slopes[index+1];
    return {index,local,time};
  }
  const api={beats,total,sample};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.CinematicStory=api;
})(typeof window==='undefined'?{}:window);
