import {defineArrayMember,defineField,defineType} from 'sanity'
import {createBulkImageArrayInput} from '../components/BulkImageArrayInput.jsx'

const galleryBulkImageInput=createBulkImageArrayInput()

const artworkObject=(name,title,template)=>defineArrayMember({name,title,type:'object',validation:Rule=>Rule.custom(item=>item?.image?.asset||item?.vimeoUrl?true:'Chọn hình ảnh hoặc nhập URL Vimeo.'),fields:[
  defineField({name:'image',title:'Hình ảnh (hoặc thumbnail cho video)',type:'image',options:{hotspot:true},fields:[defineField({name:'alt',title:'Mô tả hình',type:'string'})]}),
  defineField({name:'vimeoUrl',title:'URL video Vimeo',type:'url',description:'Ví dụ: https://vimeo.com/123456789. Nếu có cả hình, hình sẽ làm thumbnail trong gallery.',validation:Rule=>Rule.uri({scheme:['https']}).custom(value=>!value||/^https:\/\/(?:www\.)?(?:vimeo\.com|player\.vimeo\.com)\//i.test(value)||'Chỉ dùng URL từ Vimeo.')}),
  defineField({name:'videoAspectRatio',title:'Tỉ lệ video',type:'string',initialValue:'16/9',options:{list:[{title:'Ngang 16:9',value:'16/9'},{title:'Vuông 1:1',value:'1/1'},{title:'Dọc 9:16',value:'9/16'},{title:'Ngang 4:3',value:'4/3'}]}}),
  ...(template==='branding'?[defineField({name:'layout',title:'Bố cục hình',type:'string',initialValue:'full',options:{layout:'radio',list:[{title:'Rộng cả hàng',value:'full'},{title:'Vuông nửa hàng',value:'square'}]}})]:[]),
  defineField({name:'label',title:'Nhãn hiển thị',type:'string'}),
  defineField({name:'caption',title:'Chú thích',type:'string'})
],preview:{select:{media:'image',title:'label',subtitle:'caption',vimeoUrl:'vimeoUrl'},prepare:({media,title,subtitle,vimeoUrl})=>({title:title||subtitle||(vimeoUrl?'Vimeo video':'Artwork'),subtitle,media})}})

const artwork=(name,title,template)=>defineField({
  name,title,type:'array',hidden:({parent})=>parent?.template!==template,description:template==='gallery'?'Có thể chọn và upload nhiều hình cùng lúc. Dùng “Gallery item / Vimeo” khi cần thêm video hoặc chú thích riêng.':undefined,options:template==='gallery'?{layout:'grid'}:undefined,components:template==='gallery'?{input:galleryBulkImageInput}:undefined,of:[
  ...(template==='gallery'?[defineArrayMember({type:'image',options:{hotspot:true},fields:[defineField({name:'alt',title:'Mô tả hình',type:'string'})]})]:[]),
  artworkObject('object','Artwork cũ',template),
  artworkObject(`${template}ArtworkItem`,template==='gallery'?'Gallery item / Vimeo':'Artwork',template)
  ]
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
