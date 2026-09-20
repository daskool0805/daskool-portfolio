import React,{useRef,useState} from 'react'
import {PatchEvent,insert,setIfMissing,useClient} from 'sanity'

const keyFor=assetId=>`${assetId.replace(/^image-/, '').slice(0,24)}-${Math.random().toString(36).slice(2,8)}`

export const createBulkImageArrayInput=(maxCount=Infinity)=>function BulkImageArrayInput(props){
  const client=useClient({apiVersion:'2026-09-01'})
  const picker=useRef(null)
  const [uploading,setUploading]=useState(false)
  const [progress,setProgress]=useState('')
  const [message,setMessage]=useState('')

  const upload=async event=>{
    const chosen=Array.from(event.currentTarget.files||[])
    event.currentTarget.value=''
    if(!chosen.length)return
    const current=Array.isArray(props.value)?props.value.length:0
    const room=Math.max(0,maxCount-current)
    const files=chosen.slice(0,room)
    if(!files.length){setMessage(`Đã đạt giới hạn ${maxCount} hình`);return}
    if(files.length<chosen.length)setMessage(`Chỉ thêm ${files.length} hình để không vượt giới hạn ${maxCount}`)
    setUploading(true)
    try{
      const images=[]
      for(let index=0;index<files.length;index++){
        setProgress(`${index+1}/${files.length}`)
        const asset=await client.assets.upload('image',files[index],{filename:files[index].name})
        images.push({_type:'image',_key:keyFor(asset._id),asset:{_type:'reference',_ref:asset._id}})
      }
      props.onChange(PatchEvent.from([setIfMissing([]),insert(images,'after',[-1])]))
      setMessage(`Đã thêm ${images.length} hình — Publish để cập nhật website`)
    }catch(error){
      setMessage(`Không thể upload toàn bộ hình: ${error.message}`)
    }finally{
      setUploading(false)
      setProgress('')
    }
  }

  return <div style={{display:'grid',gap:'12px'}}>
    <div style={{padding:'12px',border:'1px solid var(--card-border-color)',borderRadius:'3px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'12px',flexWrap:'wrap'}}>
        <button type="button" disabled={uploading} onClick={()=>picker.current?.click()} style={{minHeight:'36px',padding:'8px 12px',border:0,borderRadius:'3px',background:'#2276fc',color:'#fff',font:'inherit',fontWeight:600,cursor:uploading?'wait':'pointer'}}>
          {uploading?`Đang upload ${progress}`:'Thêm hình — chọn nhiều file'}
        </button>
        <span style={{fontSize:'13px',color:'var(--card-muted-fg-color)'}}>Chọn nhiều ảnh trong một lần, sau đó Publish một lần.</span>
      </div>
      {message&&<div role="status" style={{marginTop:'8px',fontSize:'13px'}}>{message}</div>}
      <input ref={picker} type="file" accept="image/*" multiple hidden onChange={upload}/>
    </div>
    {props.renderDefault(props)}
  </div>
}
