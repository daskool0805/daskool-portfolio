import {defineArrayMember,defineField,defineType} from 'sanity'

const artwork=(name,title,template)=>defineField({
  name,title,type:'array',hidden:({parent})=>parent?.template!==template,of:[defineArrayMember({type:'object',fields:[
    defineField({name:'image',title:'Hình ảnh',type:'image',options:{hotspot:true},validation:Rule=>Rule.required(),fields:[defineField({name:'alt',title:'Mô tả hình',type:'string'})]}),
    defineField({name:'label',title:'Nhãn hiển thị',type:'string'}),
    defineField({name:'caption',title:'Chú thích',type:'string'})
  ],preview:{select:{media:'image',title:'label',subtitle:'caption'},prepare:({media,title,subtitle})=>({title:title||subtitle||'Artwork',subtitle,media})}})]
})

export const project=defineType({
  name:'showcaseProject',title:'Work Showcase',type:'document',
  validation:Rule=>Rule.custom(document=>{
    const categories=document?.categories||[]
    if(document?.template==='branding'&&(categories.length!==1||categories[0]!=='branding'))return 'Template 1 chỉ dùng cho một entry thuộc Branding Design.'
    if(document?.template==='gallery'&&categories.includes('branding'))return 'Template 2 chỉ dùng cho Creative Social, Video & Motion hoặc Photography.'
    return true
  }),
  fields:[
    defineField({name:'title',title:'Tên project',type:'string',validation:Rule=>Rule.required()}),
    defineField({name:'slug',title:'Đường dẫn riêng',type:'slug',options:{source:'title',maxLength:96},validation:Rule=>Rule.required()}),
    defineField({name:'order',title:'Thứ tự hiển thị',type:'number',initialValue:100}),
    defineField({name:'categories',title:'Danh mục',type:'array',validation:Rule=>Rule.required().min(1),of:[defineArrayMember({type:'string'})],options:{layout:'grid',list:[
      {title:'Branding Design',value:'branding'},
      {title:'Creative Social Design',value:'social'},
      {title:'Video & Motion',value:'motion'},
      {title:'Photography',value:'photo'}
    ]}}),
    defineField({name:'template',title:'Template showcase',type:'string',initialValue:'gallery',validation:Rule=>Rule.required(),options:{layout:'radio',list:[
      {title:'Template 1 — Branding: thông tin cố định + 2 cột scroll',value:'branding'},
      {title:'Template 2 — Gallery: thumbnail trái + preview lớn phải',value:'gallery'}
    ]}}),
    defineField({name:'description',title:'Mô tả project',type:'text',rows:4}),
    artwork('brandingItems','Template 1 — Hình showcase','branding'),
    artwork('galleryItems','Template 2 — Gallery & preview','gallery')
  ],
  preview:{select:{title:'title',categories:'categories',template:'template',media:'brandingItems.0.image'},prepare:({title,categories,template,media})=>({title,subtitle:`${template==='branding'?'Template 1':'Template 2'} · ${(categories||[]).join(', ')}`,media})}
})
