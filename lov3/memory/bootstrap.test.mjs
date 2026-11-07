import test from "node:test";
import assert from "node:assert/strict";
import {mkdtempSync,mkdirSync,writeFileSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {loadContext,brief} from "./bootstrap.mjs";
function fixture(fn){const dir=mkdtempSync(join(tmpdir(),"lov3-"));mkdirSync(join(dir,"lov3/memory"),{recursive:true});try{return fn(dir);}finally{rmSync(dir,{recursive:true,force:true});}}
function seed(dir,m={schema:"lov3.project-memory.v1",principles:["Create Innovate Sustain"],decisions:[{date:"2026-11-01",decision:"Preserve code"}],project:{domain:"346Is.life",roadmap:["Test"]}},g={schema:"lov3.v1",entries:[{id:"lov3:0001",title:"First",links:[]}],publicationStatus:"unpublished"}){
 writeFileSync(join(dir,"lov3/memory/project-memory.json"),JSON.stringify(m));
 writeFileSync(join(dir,"lov3/genesis.json"),JSON.stringify(g));
}
test("loads curated memory",()=>fixture(d=>{seed(d);assert.equal(loadContext(d).genesis.entries.length,1);}));
test("brief includes decisions and publication status",()=>fixture(d=>{seed(d);const output=brief(loadContext(d));assert.match(output,/Preserve code/);assert.match(output,/unpublished/);}));
test("missing context fails closed",()=>fixture(d=>assert.throws(()=>loadContext(d),/Missing required/)));
test("wrong memory schema rejected",()=>fixture(d=>{seed(d,{schema:"wrong",principles:[],decisions:[]});assert.throws(()=>loadContext(d),/Unexpected/);}));
test("duplicate Genesis IDs rejected",()=>fixture(d=>{seed(d,undefined,{schema:"lov3.v1",entries:[{id:"a",title:"A",links:[]},{id:"a",title:"B",links:[]}]});assert.throws(()=>loadContext(d),/Duplicate/);}));

test("engineering rationale survives the briefing with provenance label",()=>fixture(d=>{seed(d,{schema:"lov3.project-memory.v1",principles:[],decisions:[{date:"2026-11-01",decision:"Build a bounded graph",rationale:"Reduce early complexity"}]});const output=brief(loadContext(d));assert.match(output,/Build a bounded graph/);assert.match(output,/Engineering rationale \(inferred; not the user's stated motive\): Reduce early complexity/);}));
test("malformed decision rationale fails closed",()=>fixture(d=>{seed(d,{schema:"lov3.project-memory.v1",principles:[],decisions:[{date:"2026-11-01",decision:"Preserve code",rationale:""}]});assert.throws(()=>loadContext(d),/Invalid project decision or rationale/);}));
test("missing rationale remains backward compatible",()=>fixture(d=>{seed(d);assert.doesNotMatch(brief(loadContext(d)),/Engineering rationale/);}));
test("wrong Genesis schema fails closed",()=>fixture(d=>{seed(d,undefined,{schema:"wrong",entries:[{id:"lov3:0001",title:"First",links:[]}]});assert.throws(()=>loadContext(d),/Invalid book/);}));
test("dangling Genesis relation fails closed",()=>fixture(d=>{seed(d,undefined,{schema:"lov3.v1",entries:[{id:"lov3:0001",title:"First",links:[{to:"lov3:9999",type:"relates-to"}]}]});assert.throws(()=>loadContext(d),/Invalid link/);}));
test("invalid editorial citation fails closed",()=>fixture(d=>{seed(d,undefined,{schema:"lov3.v1",entries:[{id:"lov3:0001",title:"First",links:[],sources:[{id:"s1",title:"Example",kind:"primary",reviewStatus:"reviewed",url:"http://example.com"}]}]});assert.throws(()=>loadContext(d),/Editorial source URL/);}));
test("malformed project principles fail closed",()=>fixture(d=>{for(const value of [null,{},"  "]){seed(d,{schema:"lov3.project-memory.v1",principles:[value],decisions:[]});assert.throws(()=>loadContext(d),/Invalid project principle/);}}));
test("malformed project roadmap fails closed",()=>fixture(d=>{for(const roadmap of ["not a list",["Ready",null],["  "]]){seed(d,{schema:"lov3.project-memory.v1",principles:[],decisions:[],project:{roadmap}});assert.throws(()=>loadContext(d),/Invalid project roadmap/);}}));
test("malformed next action fails closed",()=>fixture(d=>{for(const next of [null,{},"  "]){seed(d,{schema:"lov3.project-memory.v1",principles:[],decisions:[],next});assert.throws(()=>loadContext(d),/Invalid project next action/);}}));
