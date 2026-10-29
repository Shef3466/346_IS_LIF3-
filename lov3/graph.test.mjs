import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validate,connect,related} from "./graph.mjs";
const book=JSON.parse(readFileSync(new URL("./genesis.json",import.meta.url),"utf8"));
test("Genesis validates",()=>assert.equal(validate(book),true));
test("13 foundation entries",()=>assert.equal(book.entries.length,13));
test("relations resolve",()=>assert.ok(related(book,"lov3:0002").length>1));
test("immutable edit",()=>{
 const result=connect(book,"lov3:0001","lov3:0006");
 assert.equal(book.entries[0].links.length,1);
 assert.equal(result.entries[0].links.length,2);
});
test("reject dangling relation",()=>assert.throws(()=>connect(book,"lov3:0001","lov3:9999")));
