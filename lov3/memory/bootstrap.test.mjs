import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {loadContext,brief} from "./bootstrap.mjs";
function fixture(fn){const dir=mkdtempSync(join(tmpdir(),"lov3-"));mkdirSync(join(dir,"lov3/memory"),{recursive:true});try{return fn(dir);}finally{rmSync(dir,{recursive:true,force:true});}}
function seed(dir,m={schema:"lov3.project-memory.v1",principles:["Create Innovate Sustain"],decisions:[{date:"2026-11-01",decision:"Preserve code"}],project:{domain:"346Is.life",roadmap:["Test"]}},g={entries:[{id:"lov3:0001"}],publicationStatus:"unpublished"}){
 writeFileSync(join(dir,"lov3/memory/project-memory.json"),JSON.stringify(m));
 writeFileSync(join(dir,"lov3/genesis.json"),JSON.stringify(g));
}
test("loads curated memory",()=>fixture(d=>{seed(d);assert.equal(loadContext(d).genesis.entries.length,1);}));
test("brief includes decisions and publication status",()=>fixture(d=>{seed(d);const output=brief(loadContext(d));assert.match(output,/Preserve code/);assert.match(output,/unpublished/);}));
test("missing context fails closed",()=>fixture(d=>assert.throws(()=>loadContext(d),/Missing required/)));
test("wrong memory schema rejected",()=>fixture(d=>{seed(d,{schema:"wrong",principles:[],decisions:[]});assert.throws(()=>loadContext(d),/Unexpected/);}));
test("duplicate Genesis IDs rejected",()=>fixture(d=>{seed(d,undefined,{entries:[{id:"a"},{id:"a"}]});assert.throws(()=>loadContext(d),/Duplicate/);}));

test("engineering rationale survives the briefing with provenance label",()=>fixture(d=>{seed(d,{schema:"lov3.project-memory.v1",principles:[],decisions:[{date:"2026-11-01",decision:"Build a bounded graph",rationale:"Reduce early complexity"}]});const output=brief(loadContext(d));assert.match(output,/Build a bounded graph/);assert.match(output,/Engineering rationale \(inferred; not the user's stated motive\): Reduce early complexity/);}));
test("malformed decision rationale fails closed",()=>fixture(d=>{seed(d,{schema:"lov3.project-memory.v1",principles:[],decisions:[{date:"2026-11-01",decision:"Preserve code",rationale:""}]});assert.throws(()=>loadContext(d),/Invalid project decision or rationale/);}));
test("missing rationale remains backward compatible",()=>fixture(d=>{seed(d);assert.doesNotMatch(brief(loadContext(d)),/Engineering rationale/);}));
