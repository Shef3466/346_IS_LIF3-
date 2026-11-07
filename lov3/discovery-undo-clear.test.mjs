import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const page=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');
test('clear preserves a recoverable copy of both pins and trail',()=>{
 assert.match(page,/clearedSnapshot=\{\.\.\.state,pins:\[\.\.\.state\.pins\],trail:\[\.\.\.state\.trail\]\}/);
 assert.match(page,/state=emptyWorkspace\(\);persist\(\);render\(\);undoClear\.hidden=false;undoClear\.focus\(\)/);
});
test('undo restores session and returns focus to clear control',()=>{
 assert.match(page,/state=clearedSnapshot;clearedSnapshot=null;persist\(\);render\(\);undoClear\.hidden=true;q\('#clear'\)\.focus\(\)/);
 assert.match(page,/<button id="undo-clear" type="button" hidden>Undo clear<\/button>/);
});
test('import invalidates stale undo snapshot',()=>{
 assert.match(page,/clearedSnapshot=null;undoClear\.hidden=true;\s*state=result\.workspace/);
});
