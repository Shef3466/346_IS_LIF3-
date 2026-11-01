import { readFileSync } from "node:fs";
import { resolve } from "node:path";
export function wake(root=process.cwd()){
  const seed=JSON.parse(readFileSync(resolve(root,"lov3/memory/mustard-seed.json"),"utf8"));
  if(seed.schema!=="lov3.continuity-kernel.v1"||!seed.activation||!Array.isArray(seed.workflow)||!seed.baseline?.conversation?.length)throw new Error("Invalid LOV3 continuity kernel");
  const lines=[seed.activation,"# "+seed.name,seed.purpose];
  for(const [name,items] of Object.entries(seed.baseline)){
    lines.push("## "+name,...items.map(x=>"- "+x));
  }
  lines.push("## Mandatory startup",...seed.workflow.map((x,i)=>(i+1)+". "+x));
  lines.push("## Boundaries",seed.privacy,seed.scope);
  return lines.join("\n");
}
if(process.argv[1]&&import.meta.url===new URL("file://"+resolve(process.argv[1])).href){
  try{process.stdout.write(wake()+"\n");}catch(e){console.error(e.message);process.exitCode=1;}
}
