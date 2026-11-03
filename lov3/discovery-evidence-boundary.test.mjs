import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');

test('workspace cards label reviewed sources as not factually verified',()=>{
  assert.match(html,/source\.title\+' \\('\+source\.kind\+'; '\+source\.reviewStatus\+'; factual verification not established\\)'/);
});

test('directed comparison source links carry the same factual-verification boundary',()=>{
  assert.match(html,/for\(const source of cited\)item\(sourceList,source\.title\+' \\('\+source\.kind\+'; '\+source\.reviewStatus\+'; factual verification not established\\)'/);
});
