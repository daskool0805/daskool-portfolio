import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import path from 'node:path';
const projectId=process.env.SANITY_PROJECT_ID||'rk9s9iog', dataset=process.env.SANITY_DATASET||'production',token=process.env.SANITY_WRITE_TOKEN;
if(!token)throw Error('Set SANITY_WRITE_TOKEN before migration.');
const base=`https://${projectId}.api.sanity.io/v2026-09-01`,headers={Authorization:`Bearer ${token}`};
const sandbox={window:{}};vm.runInNewContext(await readFile('project-data.js','utf8'),sandbox);
const categories={'lang-ong-ba-chieu':['branding','photo'],vinamilk:['branding','social'],exotrails:['social','motion','photo'],deye:['social','motion'],karrots:['branding','social']};
const uploaded=new Map();
async function image(data){
 const filename=path.basename(data.src);
 if(!uploaded.has(filename)){
  const response=await fetch(`${base}/assets/images/${dataset}?filename=${encodeURIComponent(filename)}`,{method:'POST',headers:{...headers,'Content-Type':filename.endsWith('.png')?'image/png':'image/jpeg'},body:await readFile(path.join('assets',filename))});
  if(!response.ok)throw Error(`Image upload failed: ${response.status}`);
  uploaded.set(filename,(await response.json()).document._id);
 }
 return {_type:'image',alt:data.alt||'',caption:data.caption||'',asset:{_type:'reference',_ref:uploaded.get(filename)}};
}
const mutations=[];
for(const [index,[slug,p]] of Object.entries(sandbox.window.DASKOOL_PROJECTS).entries()){
 const content=[];
 for(const [i,b] of p.blocks.entries()){
  const block={_key:`block${i}`,_type:b.type};
  if(b.type==='fullImage')block.image=await image(b);
  if(b.type==='twoImages')block.images=await Promise.all(b.images.map(async (item,j)=>({...await image(item),_key:`image${j}`})));
  content.push(block);
 }
 const cover=await image(p.blocks[0]);
 mutations.push({createIfNotExists:{_id:`project-${slug}`,_type:'project',title:p.title,slug:{_type:'slug',current:slug},category:categories[slug],shortDescription:p.intro,fullDescription:p.intro,status:'published',featured:true,projectOrder:index+1,thumbnail:cover,coverImage:cover,legacyEyebrow:p.eyebrow,content}});
}
const response=await fetch(`${base}/data/mutate/${dataset}`,{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify({mutations})});
if(!response.ok)throw Error(`Migration failed: ${response.status}`);
console.log(`Imported ${mutations.length} projects; existing CMS documents were preserved.`);
