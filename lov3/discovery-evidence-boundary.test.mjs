import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
const caveat="source.title+' ('+source.kind+'; '+source.reviewStatus+'; factual verification not established)'";

test('workspace cards show editorial status without implying factual verification',()=>{
  assert.ok(html.includes('for(const source of sources)item(list,'+caveat));
});

test('directed comparison sources display the same verification boundary',()=>{
  assert.ok(html.includes('for(const source of cited)item(sourceList,'+caveat));
});
