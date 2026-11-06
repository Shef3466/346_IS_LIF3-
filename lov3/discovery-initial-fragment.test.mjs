import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const html=readFileSync(new URL('./discovery.html',import.meta.url),'utf8');

test('bookmarked workspace sections restore keyboard focus after rendering',()=>{
 assert.match(html,/function focusInitialSection\(\)/);
 assert.match(html,/location\.hash\.slice\(1\)/);
 assert.match(html,/\['cards','comparison-heading','history-heading'\]\.includes\(id\)/);
 assert.match(html,/requestAnimationFrame\(\(\)=>target\.focus\(\)\)/);
 assert.match(html,/persist\(\);render\(\);focusInitialSection\(\)/);
});

test('unknown and malformed fragments are not used as focus selectors',()=>{
 assert.doesNotMatch(html,/decodeURIComponent\(location\.hash/);
 assert.match(html,/if\(!\['cards','comparison-heading','history-heading'\]\.includes\(id\)\)return/);
 assert.match(html,/document\.getElementById\(id\)/);
});
