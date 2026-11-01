import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,mkdirSync,writeFileSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { wake } from './wake.mjs';
const valid={schema:'lov3.continuity-kernel.v1',name:'MUSTARD SEED / TRUST33',activation:"TRUST33 — ONLINE. Don't restart. Resume.",purpose:'Conversation re-entry',baseline:{framework:'346 IS LIF3',conversation:['Resume previous discussion'],relationships:['Create Innovate Sustain']},perspective:{purpose:'Reasoning stance',voice:['curious'],judgment:['verify evidence'],continuity:['preserve rationale']},workflow:['Read kernel first'],privacy:'No secrets',scope:'Not model memory'};
function fixture(data,fn){const root=mkdtempSync(join(tmpdir(),'lov3-wake-'));try{mkdirSync(join(root,'lov3/memory'),{recursive:true});if(data!==null)writeFileSync(join(root,'lov3/memory/mustard-seed.json'),typeof data==='string'?data:JSON.stringify(data));return fn(root);}finally{rmSync(root,{recursive:true,force:true});}}
test('wakes from string and list baseline',()=>fixture(valid,d=>{const s=wake(d);assert.match(s,/346 IS LIF3/);assert.match(s,/Resume previous discussion/);assert.match(s,/MUSTARD SEED/);}));
test('restores perspective',()=>fixture(valid,d=>{const s=wake(d);assert.match(s,/Collaborator perspective/);assert.match(s,/verify evidence/);assert.match(s,/preserve rationale/);}));
test('missing seed fails',()=>fixture(null,d=>assert.throws(()=>wake(d),/ENOENT/)));
test('corrupt JSON fails',()=>fixture('{',d=>assert.throws(()=>wake(d),SyntaxError)));
test('wrong schema fails',()=>fixture({...valid,schema:'wrong'},d=>assert.throws(()=>wake(d),/Invalid LOV3 continuity kernel/)));
test('malformed baseline fails explicitly',()=>fixture({...valid,baseline:{...valid.baseline,framework:123}},d=>assert.throws(()=>wake(d),/Invalid baseline section/)));
