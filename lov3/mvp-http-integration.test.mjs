import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
const paths=['/','/index.html','/lov3/explorer.html','/lov3/knowledge.html?id=lov3%3A0001','/lov3/discovery.html','/lov3/contribute.html','/lov3/genesis.json','/lov3/portal-state.mjs','/lov3/discovery-workspace.mjs','/lov3/archive-guide.mjs','/lov3/contribution-draft.mjs','/lov3/section-transitions.mjs','/lov3/graph.mjs','/lov3/sources.mjs'];

test('MVP can be served as a coherent HTTP experience with correct resource types',async()=>{
  const server=createServer(async(req,res)=>{
    const pathname=new URL(req.url,'http://localhost').pathname;
    const path=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
    try{
      const info=await stat(path);
      if(!info.isFile())throw Error('not a file');
      res.writeHead(200,{'Content-Type':mime[extname(path)]||'application/octet-stream'});
      res.end(await readFile(path));
    }catch{res.writeHead(404).end('Not found');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  try{
    const origin='http://127.0.0.1:'+server.address().port;
    for(const path of paths){
      const response=await fetch(origin+path);
      assert.equal(response.status,200,path+' must load over HTTP');
      const body=await response.text();
      assert.ok(body.length>100,path+' must not be an empty placeholder');
      const expected=mime[extname(new URL(path,origin).pathname)||'.html'];
      assert.ok(response.headers.get('content-type').startsWith(expected.split(';')[0]),path+' MIME type');
      if(path.endsWith('.json'))assert.ok(JSON.parse(body).entries?.length>0);
    }
    // Verify every relative static module import reachable from the MVP pages, not just a hand-picked list.
    // A missing nested import otherwise produces a blank page despite HTTP 200 for its HTML.
    const visited=new Set();
    const pending=['/index.html','/lov3/explorer.html','/lov3/knowledge.html','/lov3/discovery.html','/lov3/contribute.html'];
    while(pending.length){
      const path=pending.shift();
      if(visited.has(path))continue;
      visited.add(path);
      const response=await fetch(origin+path);
      assert.equal(response.status,200,'module dependency '+path+' must load');
      const source=await response.text();
      // External module entry points are dependencies too; do not silently skip them.
      if(path.endsWith('.html')){
        for(const tag of source.matchAll(/<script\\b([^>]*)>/gi)){
          if(!/\\btype\\s*=\\s*["']module["']/i.test(tag[1]))continue;
          const src=tag[1].match(/\\bsrc\\s*=\\s*["']([^"']+)["']/i);
          if(!src)continue;
          const dependency=new URL(src[1],origin+path);
          assert.equal(dependency.origin,origin,'external module script must stay on preview origin');
          if(!visited.has(dependency.pathname))pending.push(dependency.pathname);
        }
      }
      const scripts=path.endsWith('.html')
        ? [...source.matchAll(/<script\b[^>]*type=["']module["'][^>]*>([\s\S]*?)<\/script>/gi)].map(match=>match[1])
        : [source];
      for(const script of scripts){
        const imports=[...script.matchAll(/\b(?:import|export)\s+(?:[^;'"\n]*?\s+from\s*)?["'](\.[^"']+)["']/g)];
        for(const match of imports){
          const dependency=new URL(match[1],origin+path);
          assert.equal(dependency.origin,origin,'local module import must stay on preview origin');
          if(!visited.has(dependency.pathname))pending.push(dependency.pathname);
        }
      }
    }
    assert.ok(visited.size>paths.length,'nested module dependencies must be checked');
    // The creator must not mistake a missing or stale knowledge asset for a working preview.
    const missing=await fetch(origin+'/lov3/this-file-must-not-exist.json');
    assert.equal(missing.status,404,'missing preview resources must fail visibly');
    const missingBody=await missing.text();
    assert.match(missingBody,/Not found/);
  }finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
});
