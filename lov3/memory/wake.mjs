import { readFileSync } from "node:fs";
import { resolve } from "node:path";
export function wake(root=process.cwd()){
  const seed=JSON.parse(readFileSync(resolve(root,"lov3/memory/mustard-seed.json"),"utf8"));
  const nonempty = x => typeof x === "string" && x.trim().length > 0;
  const strings = x => Array.isArray(x) && x.length > 0 && x.every(nonempty);
  if(seed.schema!=="lov3.continuity-kernel.v1" || !nonempty(seed.activation) ||
     !nonempty(seed.name) || !nonempty(seed.purpose) ||
     !nonempty(seed.baseline?.framework) || !strings(seed.baseline?.conversation) ||
     !strings(seed.baseline?.relationships) || !strings(seed.workflow) ||
     !nonempty(seed.privacy) || !nonempty(seed.scope))
    throw new Error("Invalid LOV3 continuity kernel");
  const perspective=seed.perspective;
  if(!perspective || !nonempty(perspective.purpose) ||
     !strings(perspective.voice) || !strings(perspective.judgment) ||
     !strings(perspective.continuity))
    throw new Error("Missing or invalid collaborator perspective");
  const lines=[seed.activation,"# "+seed.name,seed.purpose];
  for(const [name,items] of Object.entries(seed.baseline)){
    if(typeof items==="string") lines.push("## "+name,items);
    else if(Array.isArray(items) && items.every(x=>typeof x==="string")) lines.push("## "+name,...items.map(x=>"- "+x));
    else throw new Error("Invalid baseline section: "+name);
  }
  lines.push("## Collaborator perspective",perspective.purpose);
  for(const section of ["voice","judgment","continuity"]){
    lines.push("### "+section,...perspective[section].map(x=>"- "+x));
  }
  lines.push("## Mandatory startup",...seed.workflow.map((x,i)=>(i+1)+". "+x));
  lines.push("## Boundaries",seed.privacy,seed.scope);
  return lines.join("\n");
}
if(process.argv[1]&&import.meta.url===new URL("file://"+resolve(process.argv[1])).href){
  try{process.stdout.write(wake()+"\n");}catch(e){console.error(e.message);process.exitCode=1;}
}
