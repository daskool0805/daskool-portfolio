import {defineArrayMember,defineField,defineType} from 'sanity'

const imageField=(name,title,count)=>defineField({
  name,title,type:'array',
  validation:Rule=>Rule.max(count).warning(`Tối đa ${count} hình`),
  of:[defineArrayMember({type:'image',options:{hotspot:true},fields:[defineField({name:'alt',title:'Mô tả hình',type:'string'})]})]
})

const categoryImageGroup=(name,title,count,description)=>defineField({
  name,title,type:'object',description,fields:[
    imageField('branding','Branding Design',count),
    imageField('social','Creative Social Design',count),
    imageField('motion','Video & Motion',count),
    imageField('photo','Photography',count)
  ]
})

export const siteSettings=defineType({
  name:'siteSettings',title:'Site Images',type:'document',
  fields:[
    imageField('landingMotionImages','Landing — 8 hình motion',8),
    categoryImageGroup('landingCategoryImages','Landing — 3 hình cho mỗi danh mục',3),
    defineField({
      name:'aboutHoverImages',title:'About — 100 hình hover',type:'array',
      description:'Có thể chọn và upload nhiều hình cùng lúc, tối đa 100 hình. Website xáo trộn và cố định mỗi hình vào một trong 100 vị trí.',
      validation:Rule=>Rule.max(100).error('Tối đa 100 hình'),
      options:{layout:'grid'},
      of:[
        defineArrayMember({type:'image',options:{hotspot:true},fields:[defineField({name:'alt',title:'Mô tả hình',type:'string'})]}),
        defineArrayMember({name:'legacyAboutHoverImage',title:'Hình hover cũ',type:'object',fields:[
        defineField({name:'orientation',title:'Kiểu khung',type:'string',initialValue:'portrait',options:{layout:'radio',list:[{title:'Dọc',value:'portrait'},{title:'Ngang',value:'landscape'}]}}),
        defineField({name:'image',title:'Hình ảnh',type:'image',options:{hotspot:true},fields:[defineField({name:'alt',title:'Mô tả hình',type:'string'})]})
      ],preview:{select:{media:'image',orientation:'orientation'},prepare:({media,orientation})=>({title:orientation==='landscape'?'Hình ngang cũ':'Hình dọc cũ',media})}})
      ]
    }),
    categoryImageGroup('workCategoryMotionImages','Work — 4 hình motion cho mỗi danh mục',4,'Upload 4 hình riêng cho từng danh mục: Branding, Social, Motion và Photography (tổng cộng 16 hình).')
  ],
  preview:{prepare:()=>({title:'Site Images — Landing, About & Work'})}
})
