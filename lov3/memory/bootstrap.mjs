import {readFileSync,existsSync} from "node:fs";
import {join} from "node:path";
export function loadContext(root=process.cwd()){
 const paths=["lov3/memory/project-memory.json","lov3/genesis.json"];
 const [memory,genesis]=paths.map(path=>{
  const file=join(root,path);
  if(!existsSync(file))throw Error("Missing required project context: "+path);
  return JSON.parse(readFileSync(file,"utf8"));
 });
 if(memory.schema!=="lov3.project-memory.v1")throw Error("Unexpected project memory schema");
 if(!Array.isArray(memory.decisions)||!Array.isArray(memory.principles))throw Error("Incomplete project memory");
 if(memory.decisions.some(d=>!d || typeof d.date!=="string" || !d.date.trim() || typeof d.decision!=="string" || !d.decision.trim() || (d.rationale!==undefined && (typeof d.rationale!=="string" || !d.rationale.trim()))))throw Error("Invalid project decision or rationale");
 if(!Array.isArray(genesis.entries))throw Error("Invalid Genesis entries");
 if(new Set(genesis.entries.map(e=>e.id)).size!==genesis.entries.length)throw Error("Duplicate Genesis IDs");
 return {memory,genesis};
}
export function brief({memory,genesis}){
 return [
 "# LOV3 Development Session — Context First",
 "Repository: "+(memory.project?.repo??"unknown"),
 "Domain: "+(memory.project?.domain??"unknown"),
 "Publication status: "+(genesis.publicationStatus??"unknown"),
 "Genesis entries: "+genesis.entries.length,
 "\n## Principles",...memory.principles.map(p=>"- "+p),
 "\n## Prior decisions",...memory.decisions.flatMap(d=>["- "+d.date+": "+d.decision,...(d.rationale?["  Engineering rationale (inferred; not the user\'s stated motive): "+d.rationale]:[])]),
 "\n## Roadmap",...(memory.project?.roadmap??[]).map(p=>"- "+p),
 "\n## Next action\n"+(memory.next??"Not documented"),
 "\n## Development rules\nReview open PRs and tests before coding. Never publish private chats, keys, or unverified deployment claims. Preserve prior work, test changes, and do not spend or deploy to mainnet without approval."
 ].join("\n");
}
if(process.argv[1]&&import.meta.url===new URL("file://"+process.argv[1]).href){
 try{process.stdout.write(brief(loadContext())+"\n");}
 catch(e){console.error(e.message);process.exitCode=1;}
}
