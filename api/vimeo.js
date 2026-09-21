const send=(res,status,body)=>{
  res.statusCode=status
  res.setHeader('Content-Type','application/json; charset=utf-8')
  res.setHeader('Cache-Control','public, s-maxage=86400, stale-while-revalidate=604800')
  res.end(JSON.stringify(body))
}

export default async function handler(req,res){
  const value=String(req.query.url||'')
  let url
  try{url=new URL(value)}catch{return send(res,400,{error:'Invalid Vimeo URL'})}
  if(url.protocol!=='https:'||!['vimeo.com','www.vimeo.com','player.vimeo.com'].includes(url.hostname))return send(res,400,{error:'Invalid Vimeo URL'})
  try{
    const response=await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url.href)}`)
    if(!response.ok)throw new Error(`Vimeo ${response.status}`)
    const data=await response.json()
    const width=Number(data.width)||0,height=Number(data.height)||0
    if(!width||!height)throw new Error('Missing video dimensions')
    return send(res,200,{width,height,ratio:width/height})
  }catch(error){return send(res,502,{error:error.message})}
}
