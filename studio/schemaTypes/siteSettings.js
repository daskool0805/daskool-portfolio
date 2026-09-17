import {defineArrayMember,defineField,defineType} from 'sanity'

const imageField=(name,title,count)=>defineField({
  name,title,type:'array',
  validation:Rule=>Rule.max(count).warning(`Tối đa ${count} hình`),
  of:[defineArrayMember({type:'image',options:{hotspot:true},fields:[defineField({name:'alt',title:'Mô tả hình',type:'string'})]})]
})

const categoryImageGroup=(name,title,count)=>defineField({
  name,title,type:'object',fields:[
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
      name:'aboutHoverImages',title:'About — 50 hình hover',type:'array',
      description:'Nhập hình theo thứ tự 1–50. Website xáo trộn và cố định mỗi hình vào một trong 50 vị trí trên desktop; tải lại trang không đổi vị trí.',
      validation:Rule=>Rule.max(50).error('Tối đa 50 hình'),
      of:[defineArrayMember({type:'object',fields:[
        defineField({name:'orientation',title:'Kiểu khung',type:'string',initialValue:'portrait',options:{layout:'radio',list:[{title:'Dọc',value:'portrait'},{title:'Ngang',value:'landscape'}]}}),
        defineField({name:'image',title:'Hình ảnh',type:'image',options:{hotspot:true},fields:[defineField({name:'alt',title:'Mô tả hình',type:'string'})]})
      ],preview:{select:{media:'image',orientation:'orientation'},prepare:({media,orientation})=>({title:orientation==='landscape'?'Hình ngang':'Hình dọc',media})}})]
    }),
    categoryImageGroup('workCategoryMotionImages','Work — 4 hình motion cho mỗi danh mục',4)
  ],
  preview:{prepare:()=>({title:'Site Images — Landing, About & Work'})}
})
