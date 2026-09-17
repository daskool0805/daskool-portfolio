import {defineArrayMember,defineField,defineType} from 'sanity'

const imageField=(name,title)=>defineField({name,title,type:'image',options:{hotspot:true},fields:[defineField({name:'alt',title:'Alt text',type:'string'}),defineField({name:'caption',title:'Caption',type:'string'})],validation:r=>r.required()})
const galleryImage=defineArrayMember({type:'image',options:{hotspot:true},fields:[defineField({name:'alt',type:'string',title:'Alt text'}),defineField({name:'caption',type:'string',title:'Caption'})]})
const single=(name,title)=>defineArrayMember({name,title,type:'object',fields:[imageField('image','Image'),defineField({name:'caption',title:'Caption',type:'string'})],preview:{select:{media:'image',title:'caption'},prepare:({media,title:caption})=>({media,title:caption||title})}})

export default defineType({name:'project',title:'Project',type:'document',groups:[{name:'info',title:'Project information',default:true},{name:'content',title:'Content / Gallery'}],fields:[
  defineField({name:'title',title:'Project Title',type:'string',group:'info',validation:r=>r.required()}),
  defineField({name:'slug',title:'Slug',type:'slug',group:'info',options:{source:'title',maxLength:96},validation:r=>r.required()}),
  defineField({name:'legacyEyebrow',title:'Original project label',type:'string',hidden:true}),
  defineField({name:'year',title:'Year',type:'number',group:'info'}),
  defineField({name:'category',title:'Category',type:'array',group:'info',of:[{type:'string'}],options:{list:[{title:'Branding Design',value:'branding'},{title:'Social Creative Design',value:'social'},{title:'Video & Motion',value:'motion'},{title:'Photography',value:'photo'}]}}),
  defineField({name:'client',title:'Client',type:'string',group:'info'}),
  defineField({name:'shortDescription',title:'Short Description',type:'text',rows:3,group:'info'}),
  defineField({name:'fullDescription',title:'Full Description',type:'text',rows:6,group:'info'}),
  imageField('thumbnail','Thumbnail'),imageField('coverImage','Cover Image'),
  defineField({name:'featured',title:'Featured',type:'boolean',initialValue:false,group:'info'}),
  defineField({name:'status',title:'Publishing status',type:'string',group:'info',initialValue:'draft',options:{layout:'radio',list:[{title:'Draft',value:'draft'},{title:'Published',value:'published'}]},validation:r=>r.required()}),
  defineField({name:'projectOrder',title:'Project Order',type:'number',group:'info',initialValue:100}),
  defineField({name:'content',title:'Project Content / Gallery',description:'Add, duplicate, delete and drag blocks to reorder them.',type:'array',group:'content',of:[
    single('fullImage','Full Width Image'),single('landscapeImage','Landscape Image'),single('portraitImage','Portrait Image'),single('squareImage','Square Image'),
    defineArrayMember({name:'twoImages',title:'Two Images / 2 Columns',type:'object',fields:[
      defineField({name:'images',type:'array',of:[galleryImage],validation:r=>r.length(2)})
    ]}),
    defineArrayMember({name:'threeImages',title:'Three Images / 3 Columns',type:'object',fields:[
      defineField({name:'images',type:'array',of:[galleryImage],validation:r=>r.length(3)})
    ]}),
    defineArrayMember({name:'video',title:'Video',type:'object',fields:[defineField({name:'file',title:'Uploaded video',type:'file',options:{accept:'video/*'}}),defineField({name:'url',title:'External video URL',type:'url'}),imageField('poster','Poster image'),defineField({name:'controls',type:'boolean',initialValue:true}),defineField({name:'loop',type:'boolean',initialValue:false})]}),
    defineArrayMember({name:'gif',title:'GIF',type:'object',fields:[imageField('image','GIF image'),defineField({name:'caption',type:'string'})]}),
    defineArrayMember({name:'textBlock',title:'Text Block',type:'object',fields:[defineField({name:'heading',type:'string'}),defineField({name:'body',type:'array',of:[{type:'block'}]})]}),
    defineArrayMember({name:'spacer',title:'Spacer / Section Break',type:'object',fields:[defineField({name:'size',type:'string',initialValue:'medium',options:{layout:'radio',list:['small','medium','large']}})]})
  ]})
],preview:{select:{title:'title',subtitle:'status',media:'thumbnail'},prepare:({title,subtitle,media})=>({title,subtitle:subtitle==='published'?'Published':'Draft',media})}})
