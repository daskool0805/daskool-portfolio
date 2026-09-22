import {cp, mkdir, rm} from "node:fs/promises";
import path from "node:path";
const root=process.cwd(), dist=path.join(root,"dist");
await rm(dist,{recursive:true,force:true}); await mkdir(dist,{recursive:true});
for(const name of ["index.html","about.html","work.html","styles.css","script.js","cms.js","cms-config.js","project-data.js","project-detail.js","cms-projects.js","work"]) await cp(path.join(root,name),path.join(dist,name),{recursive:true});
await cp(path.join(root,"assets"),path.join(dist,"assets"),{recursive:true,filter:source=>!(/\.(?:jpe?g|png)$/i.test(source))});
await cp(path.join(root,"studio","dist"),path.join(dist,"admin"),{recursive:true});
