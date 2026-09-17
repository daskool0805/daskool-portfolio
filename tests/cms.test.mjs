import {test} from 'node:test';
import assert from 'node:assert/strict';
import projectHandler from '../api/project.js';
import projectsHandler from '../api/projects.js';
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(s){this.code=s;return this},json(b){this.body=b}}}
test('public data uses published perspective and preserves an empty CMS',async()=>{
 const old=global.fetch;let url;
 global.fetch=async u=>{url=u;return {ok:true,json:async()=>({result:[]})}};
 try{const res=response();await projectsHandler({query:{}},res);assert.equal(url.searchParams.get('perspective'),'published');assert.deepEqual(res.body,[])}finally{global.fetch=old}
});
test('missing preview credentials cannot bypass auth with Bearer undefined',async()=>{
 const res=response();await projectHandler({query:{slug:'test',preview:'1'},headers:{authorization:'Bearer undefined'}},res);assert.equal(res.code,401);assert.equal(res.headers['Cache-Control'],'no-store');
});
test('authorized preview cannot enter the public cache',async()=>{
 const old=global.fetch;process.env.SANITY_PREVIEW_SECRET='test-secret';process.env.SANITY_API_READ_TOKEN='test-token';let url;
 global.fetch=async u=>{url=u;return {ok:true,json:async()=>({result:{title:'Draft'}})}};
 try{const res=response();await projectHandler({query:{slug:'test',preview:'1'},headers:{authorization:'Bearer test-secret'}},res);assert.equal(res.code,200);assert.equal(url.searchParams.get('perspective'),'drafts');assert.equal(res.headers['Cache-Control'],'no-store')}finally{global.fetch=old;delete process.env.SANITY_PREVIEW_SECRET;delete process.env.SANITY_API_READ_TOKEN}
});
test('unpublished project returns 404',async()=>{
 const old=global.fetch;global.fetch=async()=>({ok:true,json:async()=>({result:null})});
 try{const res=response();await projectHandler({query:{slug:'hidden'},headers:{}},res);assert.equal(res.code,404)}finally{global.fetch=old}
});
