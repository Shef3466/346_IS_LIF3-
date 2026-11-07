import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const pages=['index.html','lov3/explorer.html','lov3/knowledge.html','lov3/discovery.html','lov3/contribute.html'];

test('MVP pages exist and all relative HTML navigation destinations resolve',()=>{
  for(const page of pages){
    const filename=resolve(root,page);
    assert.ok(existsSync(filename),page+' must exist');
    const html=readFileSync(filename,'utf8');
    for(const match of html.matchAll(/\bhref=["'](\.[^"']+\.html(?:[?#][^"']*)?)["']/g)){
      const target=match[1].split(/[?#]/)[0];
      assert.ok(existsSync(resolve(dirname(filename),target)),page+' links to missing '+target);
    }
  }
});

test('MVP exposes the core journey without six-slot copy',()=>{
  const home=readFileSync(resolve(root,'index.html'),'utf8');
  assert.ok(home.includes('./lov3/explorer.html'));
  assert.ok(home.includes('./lov3/discovery.html'));
  assert.ok(home.includes('./lov3/contribute.html'));
  const workspace=readFileSync(resolve(root,'lov3/discovery-workspace.mjs'),'utf8');
  assert.ok(workspace.includes('capacity:3'));
  assert.ok(workspace.includes('state.pins.length>=3'));
});


test('homepage knowledge entry opens a real Genesis record instead of an error page',()=>{
  const home=readFileSync(resolve(root,'index.html'),'utf8');
  const book=JSON.parse(readFileSync(resolve(root,'lov3/genesis.json'),'utf8'));
  const match=home.match(/href=["']\.\/lov3\/knowledge\.html\?id=([^"']+)["']/);
  assert.ok(match,'homepage knowledge link must select a concept');
  const id=decodeURIComponent(match[1]);
  assert.ok(book.entries.some(entry=>entry.id===id),'homepage target must exist in Genesis');
});


test('MVP HTML module imports and local data fetches resolve to real files',()=>{
  for(const page of pages){
    const filename=resolve(root,page);
    const html=readFileSync(filename,'utf8');
    for(const match of html.matchAll(/(?:import\s+(?:[^;]*?\s+from\s+)?|import\s*\()\s*['"](\.[^'"]+\.mjs)['"]/g)){
      const target=resolve(dirname(filename),match[1]);
      assert.ok(existsSync(target),page+' imports missing '+match[1]);
    }
    for(const match of html.matchAll(/fetch\(\s*['"](\.[^'"]+\.json)['"]/g)){
      const target=resolve(dirname(filename),match[1]);
      assert.ok(existsSync(target),page+' fetches missing '+match[1]);
    }
  }
});

// An outdated shared knowledge link must not contaminate a visitor's trail.
test('knowledge page rejects missing Genesis IDs before recording a visit',()=>{
  const html=readFileSync(resolve(root,'lov3/knowledge.html'),'utf8');
  const check=html.indexOf('if(!ids.has(id))');
  const visit=html.indexOf('navigateKnowledgeTrail(');
  assert.ok(check>=0,'knowledge page must validate the requested concept');
  assert.ok(visit>check,'unknown concept must be rejected before writing the trail');
});
