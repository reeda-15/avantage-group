const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function setup(reduced=false) {
  const events={},ticks=new Set(),instances=[];
  const motion={matches:reduced,addEventListener(n,fn){this.change=fn;}};
  class Lenis {
    constructor(options){this.options=options;instances.push(this);}
    on(n,fn){this.onScroll=fn;}
    raf(t){this.time=t;}
    resize(){}
    scrollTo(target,options){this.target=target;this.immediate=options.immediate;}
    destroy(){this.destroyed=true;}
  }
  const window={Lenis,gsap:{registerPlugin(){},ticker:{add:f=>ticks.add(f),remove:f=>ticks.delete(f),lagSmoothing(){}}},
    ScrollTrigger:{update(){},addEventListener(){},removeEventListener(){}},
    addEventListener:(n,f)=>events[n]=f,scrollTo(options){this.nativeTarget=options.top;}};
  vm.runInNewContext(fs.readFileSync('dist/smooth-scroll.js','utf8'),{window,document:{querySelector:()=>({})},matchMedia:()=>motion});
  return {window,motion,events,ticks,instances};
}
test('one GSAP clock drives smooth scrolling and immediate jumps cancel momentum',()=>{
  const s=setup();assert.equal(s.ticks.size,1);
  [...s.ticks][0](2);assert.equal(s.instances[0].time,2000);
  assert.equal(s.instances[0].options.syncTouch,false);
  s.window.AvantageScroll.scrollTo(500,{immediate:true});
  assert.equal(s.instances[0].target,500);assert.equal(s.instances[0].immediate,true);
  s.events.pagehide();assert.equal(s.ticks.size,0);assert.equal(s.instances[0].destroyed,true);
  s.events.pageshow();s.events.pageshow();assert.equal(s.ticks.size,1);assert.equal(s.instances.length,2);
});
test('reduced motion bypasses smoothing and removes an active ticker on preference change',()=>{
  const s=setup(true);assert.equal(s.instances.length,0);
  s.window.AvantageScroll.scrollTo(300,{immediate:true});assert.equal(s.window.nativeTarget,300);
  s.motion.matches=false;s.motion.change();assert.equal(s.ticks.size,1);
  s.motion.matches=true;s.motion.change();assert.equal(s.ticks.size,0);
});
