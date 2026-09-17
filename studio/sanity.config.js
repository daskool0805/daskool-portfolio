import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {schemaTypes} from './schemaTypes/index.js'

const projectId=process.env.SANITY_STUDIO_PROJECT_ID||'rk9s9iog'
const dataset=process.env.SANITY_STUDIO_DATASET||'production'
export default defineConfig({name:'default',title:'Daskool Portfolio CMS',projectId,dataset,plugins:[structureTool(),visionTool()],schema:{types:schemaTypes},document:{actions:(actions,{schemaType})=>schemaType==='project'?actions:actions}})
