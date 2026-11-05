import test from 'node:test';
import assert from 'node:assert/strict';
import {navigateKnowledgeTrail} from './discovery-workspace.mjs';

const ids=new Set(['lov3:0001','lov3:0002','lov3:0003']);
const state=trail=>({capacity:3,pins:['lov3:0001'],trail});

test('backtrack through repeated visits removes only the latest actual visit',()=>{
  const original=state(['lov3:0001','lov3:0002','lov3:0001']);
  const result=navigateKnowledgeTrail(original,'lov3:0002',ids,true);
  assert.deepEqual(result.trail,['lov3:0001','lov3:0002']);
  assert.deepEqual(result.pins,['lov3:0001']);
  assert.deepEqual(original.trail,['lov3:0001','lov3:0002','lov3:0001']);
});

test('forged backtrack cannot erase unrelated visits',()=>{
  const original=state(['lov3:0001','lov3:0002','lov3:0003']);
  const result=navigateKnowledgeTrail(original,'lov3:0001',ids,true);
  assert.deepEqual(result.trail,['lov3:0001','lov3:0002','lov3:0003','lov3:0001']);
});

test('backtrack with no preceding visit does not invent one',()=>{
  assert.deepEqual(navigateKnowledgeTrail(state(['lov3:0001']),'lov3:0001',ids,true).trail,['lov3:0001']);
});

test('invalid backtrack target cannot enter trail',()=>{
  assert.deepEqual(navigateKnowledgeTrail(state(['lov3:0001','lov3:0002']),'lov3:9999',ids,true).trail,['lov3:0001','lov3:0002']);
});
