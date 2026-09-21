const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
test('preview serves video byte ranges, HEAD, and rejects invalid ranges', async () => {
  const {createPreviewServer} = require('../preview-server.cjs');
  assert.equal(typeof createPreviewServer, 'function');
  const server = createPreviewServer();
  await new Promise(resolve => server.listen(0,'127.0.0.1',resolve));
  try {
    const url=`http://127.0.0.1:${server.address().port}/assets/cinematic/phase-1.mp4`;
    const size=fs.statSync('dist/assets/cinematic/phase-1.mp4').size;
    const head=await fetch(url,{method:'HEAD'});
    assert.equal(head.headers.get('content-type'),'video/mp4');
    assert.equal(Number(head.headers.get('content-length')),size);
    const part=await fetch(url,{headers:{Range:'bytes=0-99'}});
    assert.equal(part.status,206);
    assert.equal(part.headers.get('content-range'),`bytes 0-99/${size}`);
    assert.equal((await part.arrayBuffer()).byteLength,100);
    const suffix=await fetch(url,{headers:{Range:'bytes=-20'}});
    assert.equal((await suffix.arrayBuffer()).byteLength,20);
    const invalid=await fetch(url,{headers:{Range:`bytes=${size}-`}});
    assert.equal(invalid.status,416);
  } finally {server.closeAllConnections(); await new Promise(resolve=>server.close(resolve));}
});
