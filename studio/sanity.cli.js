import {defineCliConfig} from 'sanity/cli'
export default defineCliConfig({project:{basePath:'/admin'},api:{projectId:process.env.SANITY_STUDIO_PROJECT_ID||'rk9s9iog',dataset:process.env.SANITY_STUDIO_DATASET||'production'}})
