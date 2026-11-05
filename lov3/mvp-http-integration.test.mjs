import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,dirname,extname,sep} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const mime={'.html':'text/html; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.json':'application/json; charset=utf-8'};
const paths=['/','/index.html','/lov3/explorer.html','/lov3/knowledge.html?id=lov3%3A0001','/lov3/discovery.html','/lov3/contribute.html','/lov3/genesis.json','/lov3/portal-state.mjs','/lov3/discovery-workspace.mjs','/lov3/archive-guide.mjs'];

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
  }finally{await new Promise((resolve,reject)=>server.close(err=>err?reject(err):resolve()));}
});
