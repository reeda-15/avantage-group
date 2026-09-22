const {test}=require('node:test');
const assert=require('node:assert/strict');
const {beats,total,sample}=require('../dist/cinematic-story.js');
test('story video remains monotonic across every hold and chapter boundary',()=>{
  let previous=-1;
  for(let i=0;i<=10000;i++){const s=sample(i/10000);assert.ok(s.time>=previous-1e-8);previous=s.time;}
  assert.equal(sample(0).time,0);assert.equal(sample(1).time,31.458333);
});
test('every content beat keeps moving through the reading interval',()=>{
  let start=0;
  for(const beat of beats){
    const a=sample((start+beat[3]*.35)/total),b=sample((start+beat[3]*.65)/total);
    assert.equal(a.index,b.index);assert.ok(b.time>a.time,'camera must not freeze during text');start+=beat[3];
  }
});
test('camera velocity stays positive and continuous at chapter boundaries',()=>{
  let units=0;const epsilon=1e-6;
  for(const beat of beats.slice(0,-1)){
    units+=beat[3];const p=units/total;
    const left=(sample(p).time-sample(p-epsilon).time)/epsilon;
    const right=(sample(p+epsilon).time-sample(p).time)/epsilon;
    assert.ok(left>0&&right>0);assert.ok(Math.abs(left-right)<.05);
  }
});
test('reverse seeks and jumps return to deterministic chapter positions',()=>{
  const result=sample(.42);sample(1);sample(.8);assert.deepEqual(sample(.42),result);
  assert.equal(sample(-1).index,0);assert.equal(sample(2).index,beats.length-1);
});
