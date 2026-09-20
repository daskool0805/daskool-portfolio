(function(){
  const config=window.DASKOOL_CMS_CONFIG||{};
  const state={settings:null,projects:[],connected:false,usingLegacy:false};
  const categoryKeys=["branding","social","motion","photo"];
  const clean=value=>(value||"").trim();
  const imageUrl=value=>value&&typeof value==="object"?(value.asset&&value.asset.url)||value.url||"":value||"";
  const imageAlt=value=>value&&typeof value==="object"?value.alt||"":"";
  const sizedImage=(url,width)=>url.includes("cdn.sanity.io")?`${url}${url.includes("?")?"&":"?"}auto=format&fit=max&w=${width}`:url;
  const setImage=(element,value)=>{
    const url=imageUrl(value);
    if(!element||!url)return;
    element.style.backgroundImage=`url("${sizedImage(url,480).replace(/"/g,"%22")}")`;
    element.style.backgroundSize="cover";
    element.style.backgroundPosition="center";
    element.classList.add("has-cms-image");
  };
  const setAdaptiveImage=(element,value,frameRatio)=>{
    const url=imageUrl(value);
    if(!element||!url)return;
    const img=document.createElement('img');
    img.alt=imageAlt(value);
    img.decoding='async';
    img.loading='lazy';
    if(url.includes('cdn.sanity.io')){
      img.srcset=`${sizedImage(url,640)} 640w, ${sizedImage(url,1200)} 1200w, ${sizedImage(url,1800)} 1800w`;
      img.sizes='(max-width:760px) 100vw, 50vw';
    }
    img.addEventListener('load',()=>{
      const ratio=img.naturalWidth/img.naturalHeight;
      if(!Number.isFinite(ratio)||ratio<=0)return;
      element.style.setProperty('--image-ratio',ratio);
      element.style.setProperty('--fit-w',Math.min(1,ratio/frameRatio));
      element.style.setProperty('--fit-h',Math.min(1,frameRatio/ratio));
      element.classList.add('has-cms-image');
    },{once:true});
    img.src=sizedImage(url,1200);
    element.replaceChildren(img);
  };
  const vimeoEmbed=value=>{
    if(!value)return "";
    try{
      const url=new URL(value);
      if(url.protocol!=="https:"||!["vimeo.com","www.vimeo.com","player.vimeo.com"].includes(url.hostname))return "";
      const parts=url.pathname.split("/").filter(Boolean),id=parts.find(part=>/^\d+$/.test(part));
      if(!id)return "";
      const following=parts[parts.indexOf(id)+1];
      const hash=url.searchParams.get("h")||(/^[a-f\d]+$/i.test(following||"")?following:"");
      return `https://player.vimeo.com/video/${id}${hash?`?h=${encodeURIComponent(hash)}`:""}`;
    }catch{return ""}
  };
  const mediaNode=(item,autoplay=false)=>{
    const video=vimeoEmbed(item.vimeoUrl);
    if(video){
      const iframe=document.createElement("iframe");
      iframe.src=video+(autoplay?`${video.includes("?")?"&":"?"}autoplay=1&muted=1&loop=1&autopause=0&playsinline=1`:"");iframe.title=item.caption||item.label||"Vimeo video";
      iframe.loading="lazy";iframe.allow="autoplay; fullscreen; picture-in-picture";iframe.allowFullscreen=true;
      iframe.className="showcase-video";
      const ratio=/^(?:16\/9|9\/16|1\/1|4\/3)$/.test(item.videoAspectRatio||"")?item.videoAspectRatio:"16/9";
      iframe.style.aspectRatio=ratio;
      iframe.style.setProperty("--media-ratio",String(ratio.split("/").map(Number).reduce((width,height)=>width/height)));
      const natural={width:0,height:0};
      const receiveDimension=event=>{
        if(event.origin!=="https://player.vimeo.com"||event.source!==iframe.contentWindow)return;
        let data=event.data;
        if(typeof data==="string")try{data=JSON.parse(data)}catch{return}
        if(data?.method==="getVideoWidth")natural.width=Number(data.value)||0;
        if(data?.method==="getVideoHeight")natural.height=Number(data.value)||0;
        if(!natural.width||!natural.height)return;
        iframe.style.aspectRatio=`${natural.width} / ${natural.height}`;
        iframe.style.setProperty("--media-ratio",String(natural.width/natural.height));
        removeEventListener("message",receiveDimension);
      };
      addEventListener("message",receiveDimension);
      iframe.addEventListener("load",()=>{
        const request=()=>["getVideoWidth","getVideoHeight"].forEach(method=>iframe.contentWindow?.postMessage(JSON.stringify({method}),"https://player.vimeo.com"));
        request();setTimeout(request,500);
      },{once:true});
      return iframe;
    }
    const url=imageUrl(item.image||item);
    if(!url)return null;
    const img=document.createElement("img");img.src=sizedImage(url,1200);img.alt=imageAlt(item.image||item)||item.caption||item.label||"";img.decoding="async";img.loading="lazy";
    if(url.includes("cdn.sanity.io")){img.srcset=`${sizedImage(url,640)} 640w, ${sizedImage(url,1200)} 1200w, ${sizedImage(url,1800)} 1800w`;img.sizes="(max-width:760px) 100vw, 66vw"}
    return img;
  };
  const uniqueProjects=projects=>{
    const map=new Map();
    projects.forEach(project=>{
      const key=clean(project.title).toLocaleLowerCase();
      if(!key)return;
      if(!map.has(key))map.set(key,{title:project.title,categories:new Set()});
      (project.categories||[]).forEach(category=>map.get(key).categories.add(category));
    });
    return [...map.values()];
  };
  const categoryProjects=key=>state.projects.filter(project=>(project.categories||[]).includes(key));
  const projectFromUrl=projects=>{
    const slug=new URLSearchParams(location.search).get("project");
    return projects.find(project=>project.slug===slug)||projects[0];
  };
  const syncUrl=(project,category)=>{
    if(!project||!project.slug)return;
    const url=new URL(location.href);
    if(category)url.searchParams.set("category",category);
    url.searchParams.set("project",project.slug);
    history.replaceState({},"",url);
  };

  function applyLanding(){
    const settings=state.settings||{};
    const motion=settings.landingMotionImages||[];
    document.querySelectorAll(".mock-frame").forEach((frame,index)=>setAdaptiveImage(frame,motion[index],1.25));
    const groups=settings.landingCategoryImages||{};
    document.querySelectorAll(".landing-categories a[data-category]").forEach(link=>{
      const images=groups[link.dataset.category]||[];
      link.querySelectorAll(".category-thumbs i").forEach((frame,index)=>setAdaptiveImage(frame,images[index],1));
    });
  }

  function applyAbout(){
    const images=(state.settings&&state.settings.aboutHoverImages)||[];
    document.querySelectorAll(".about-hover-frame").forEach(frame=>{
      const item=images[Number(frame.parentElement.dataset.imageIndex)];
      if(!item)return;
      frame.classList.toggle("is-landscape",item.orientation==="landscape");
      frame.classList.toggle("is-portrait",item.orientation!=="landscape");
      setAdaptiveImage(frame,item.image||item,item.orientation==="landscape"?4/3:3/4);
    });
  }

  function applyWorkIndex(){
    const list=document.querySelector(".work-page .project-list");
    if(!list||!state.projects.length)return;
    const entries=uniqueProjects(state.projects);
    list.replaceChildren();
    entries.forEach((entry,index)=>{
      const name=document.createElement("span");
      name.className="project-name";
      name.dataset.categories=[...entry.categories].join(" ");
      name.textContent=entry.title+(index<entries.length-1?",":"");
      list.append(name);
    });
    window.dispatchEvent(new Event("workprojectschange"));
  }

  function applyWorkCategory(category,frames){
    const groups=(state.settings&&state.settings.workCategoryMotionImages)||{};
    const images=groups[category]||[];
    [...frames].forEach(frame=>{
      frame.style.removeProperty("background-image");
      frame.classList.remove("has-cms-image");
      setImage(frame,images[Number(frame.dataset.slot)]);
    });
  }

  function renderBranding(){
    const root=document.querySelector(".branding-showcase");
    if(!root)return;
    const projects=categoryProjects("branding").filter(project=>project.template==="branding");
    if(!projects.length)return;
    const tabs=root.querySelector(".project-tabs"),copy=root.querySelector("[data-project-copy]"),canvas=root.querySelector(".brand-canvas");
    const activate=project=>{
      [...tabs.children].forEach(button=>{const active=button.dataset.slug===project.slug;button.classList.toggle("is-active",active);button.setAttribute("aria-selected",String(active))});
      copy.textContent=project.description||"";
      canvas.replaceChildren();
      (project.brandingItems||[]).forEach((item,index)=>{
        const media=mediaNode(item,true);
        if(!media)return;
        const frame=document.createElement("div");frame.className="brand-frame";
        if(item.layout==="square"&&!item.vimeoUrl)frame.classList.add("is-square");
        frame.append(media);canvas.append(frame);
      });
      syncUrl(project);
    };
    tabs.replaceChildren();
    projects.forEach(project=>{const button=document.createElement("button");button.className="showcase-project";button.type="button";button.dataset.slug=project.slug;button.textContent=project.title;button.addEventListener("click",()=>activate(project));tabs.append(button)});
    activate(projectFromUrl(projects));
  }

  function renderGallery(){
    const root=document.querySelector(".gallery-showcase");
    if(!root)return;
    const key=categoryKeys.includes(new URLSearchParams(location.search).get("category"))?new URLSearchParams(location.search).get("category"):"social";
    const projects=categoryProjects(key).filter(project=>project.template==="gallery");
    if(!projects.length)return;
    const labels={social:"creative social design",motion:"video & motion",photo:"photography"};
    const title=root.querySelector("[data-gallery-category]"),tabs=root.querySelector("[data-gallery-projects]"),copy=root.querySelector("[data-gallery-copy]"),grid=root.querySelector("[data-art-grid]"),mediaLayer=root.querySelector("[data-gallery-media]");
    title.textContent=labels[key]||key;
    const clearPreview=()=>{[...grid.children].forEach(node=>node.classList.remove("is-active"));mediaLayer.replaceChildren()};
    const selectArtwork=(button,item)=>{
      [...grid.children].forEach(node=>node.classList.toggle("is-active",node===button));
      const media=mediaNode(item,true);mediaLayer.replaceChildren(...(media?[media]:[]));
    };
    const activate=project=>{
      [...tabs.children].forEach(button=>{const active=button.dataset.slug===project.slug;button.classList.toggle("is-active",active);button.setAttribute("aria-selected",String(active))});
      copy.textContent=project.description||"";grid.replaceChildren();
      const touchLayout=matchMedia("(max-width:760px), (hover:none)").matches;
      (project.galleryItems||[]).forEach((item,index)=>{const button=document.createElement("button");button.className="art-thumb";button.type="button";button.setAttribute("aria-label",`${project.title} ${item.vimeoUrl?'video':`artwork ${index+1}`}`);setImage(button,item.image||item);if(item.vimeoUrl&&!imageUrl(item.image||item))button.classList.add("is-video");if(touchLayout)button.addEventListener("click",()=>selectArtwork(button,item));else{button.addEventListener("pointerenter",()=>selectArtwork(button,item));button.addEventListener("pointerleave",clearPreview);button.addEventListener("focus",()=>selectArtwork(button,item));button.addEventListener("blur",clearPreview)}grid.append(button)});
      if(touchLayout&&project.galleryItems?.length)selectArtwork(grid.firstElementChild,project.galleryItems[0]);else clearPreview();
      syncUrl(project,key);
    };
    tabs.replaceChildren();
    projects.forEach(project=>{const button=document.createElement("button");button.className="showcase-project";button.type="button";button.dataset.slug=project.slug;button.textContent=project.title;button.addEventListener("click",()=>activate(project));tabs.append(button)});
    activate(projectFromUrl(projects));
  }

  function applyAll(){applyLanding();applyAbout();if(!state.usingLegacy)applyWorkIndex();renderBranding();renderGallery();document.dispatchEvent(new CustomEvent("daskool:cms-ready",{detail:state}))}
  async function load(){
    if(!config.projectId){applyAll();return state}
    const query=`{\"settings\":*[_type==\"siteSettings\"][0]{landingMotionImages[]{alt,orientation,asset->{url}},landingCategoryImages{branding[]{alt,asset->{url}},social[]{alt,asset->{url}},motion[]{alt,asset->{url}},photo[]{alt,asset->{url}}},aboutHoverImages[]{orientation,image{alt,asset->{url}}},workCategoryMotionImages{branding[]{alt,asset->{url}},social[]{alt,asset->{url}},motion[]{alt,asset->{url}},photo[]{alt,asset->{url}}}},\"projects\":*[_type==\"showcaseProject\" && defined(slug.current) && defined(template)]|order(order asc){_id,title,\"slug\":slug.current,categories,template,description,brandingItems[]{label,layout,vimeoUrl,videoAspectRatio,image{alt,asset->{url}}},galleryItems[]{alt,asset->{url},caption,vimeoUrl,videoAspectRatio,image{alt,asset->{url}}}},\"legacy\":*[_type==\"project\" && status==\"published\"]|order(projectOrder asc){_id,title,\"slug\":slug.current,category,shortDescription,thumbnail{alt,asset->{url}},coverImage{alt,asset->{url}}}}`;
    const host=config.useCdn!==false?"apicdn":"api";
    const url=`https://${config.projectId}.${host}.sanity.io/v${config.apiVersion||"2026-09-01"}/data/query/${config.dataset||"production"}?query=${encodeURIComponent(query)}`;
    try{const response=await fetch(url);if(!response.ok)throw new Error(`CMS ${response.status}`);const payload=await response.json();state.settings=payload.result&&payload.result.settings;const result=payload.result||{};const legacy=(result.legacy||[]).flatMap(project=>{const categories=(project.category||[]).filter(category=>categoryKeys.includes(category));const image=project.coverImage?.asset?.url?project.coverImage:project.thumbnail;return categories.map(category=>({title:project.title,slug:`${project.slug}-${category}`,categories:[category],template:category==='branding'?'branding':'gallery',description:project.shortDescription||'',brandingItems:image?[{image,label:project.title}]:[],galleryItems:image?[{image,caption:project.title}]:[]}))});state.usingLegacy=!result.projects?.length;state.projects=state.usingLegacy?legacy:result.projects;state.connected=true;applyAll()}catch(error){console.warn("Daskool CMS fallback active:",error);applyAll()}
    return state;
  }
  window.DASKOOL_CMS={state,load,applyAll,applyAbout,applyWorkCategory,uniqueProjects};
  load();
})();
