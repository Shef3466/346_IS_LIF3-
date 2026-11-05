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
