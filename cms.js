(function(){
  const config=window.DASKOOL_CMS_CONFIG||{};
  const state={settings:null,projects:[],connected:false,usingLegacy:false};
  const categoryKeys=["branding","social","motion","photo"];
  const clean=value=>(value||"").trim();
  const imageUrl=value=>value&&typeof value==="object"?(value.asset&&value.asset.url)||value.url||"":value||"";
  const imageAlt=value=>value&&typeof value==="object"?value.alt||"":"";
  const setImage=(element,value)=>{
    const url=imageUrl(value);
    if(!element||!url)return;
    element.style.backgroundImage=`url("${url.replace(/"/g,"%22")}")`;
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
    img.addEventListener('load',()=>{
      const ratio=img.naturalWidth/img.naturalHeight;
      if(!Number.isFinite(ratio)||ratio<=0)return;
      element.style.setProperty('--image-ratio',ratio);
      element.style.setProperty('--fit-w',Math.min(1,ratio/frameRatio));
      element.style.setProperty('--fit-h',Math.min(1,frameRatio/ratio));
      element.classList.add('has-cms-image');
    },{once:true});
    img.src=url;
    element.replaceChildren(img);
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
        const frame=document.createElement("div");frame.className="brand-frame";
        setImage(frame,item.image||item);
        const label=document.createElement("span");label.textContent=item.label||`project image / ${String(index+1).padStart(2,"0")}`;frame.append(label);canvas.append(frame);
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
    const title=root.querySelector("[data-gallery-category]"),tabs=root.querySelector("[data-gallery-projects]"),copy=root.querySelector("[data-gallery-copy]"),grid=root.querySelector("[data-art-grid]"),preview=root.querySelector("[data-gallery-preview]"),previewLabel=root.querySelector("[data-preview-label]");
    title.textContent=labels[key]||key;
    const selectArtwork=(button,item,index,project)=>{
      [...grid.children].forEach(node=>node.classList.toggle("is-active",node===button));
      preview.style.backgroundImage="";setImage(preview,item.image||item);
      previewLabel.textContent=item.caption||`${project.title} / ${String(index+1).padStart(2,"0")}`;
    };
    const activate=project=>{
      [...tabs.children].forEach(button=>{const active=button.dataset.slug===project.slug;button.classList.toggle("is-active",active);button.setAttribute("aria-selected",String(active))});
      copy.textContent=project.description||"";grid.replaceChildren();
      (project.galleryItems||[]).forEach((item,index)=>{const button=document.createElement("button");button.className="art-thumb";button.type="button";button.setAttribute("aria-label",`${project.title} ${index+1}`);setImage(button,item.image||item);const number=document.createElement("span");number.textContent=String(index+1).padStart(2,"0");button.append(number);["pointerenter","focus","click"].forEach(event=>button.addEventListener(event,()=>selectArtwork(button,item,index,project)));grid.append(button)});
      if(grid.firstElementChild&&project.galleryItems&&project.galleryItems[0])selectArtwork(grid.firstElementChild,project.galleryItems[0],0,project);
      syncUrl(project,key);
    };
    tabs.replaceChildren();
    projects.forEach(project=>{const button=document.createElement("button");button.className="showcase-project";button.type="button";button.dataset.slug=project.slug;button.textContent=project.title;button.addEventListener("click",()=>activate(project));tabs.append(button)});
    activate(projectFromUrl(projects));
  }

  function applyAll(){applyLanding();applyAbout();if(!state.usingLegacy)applyWorkIndex();renderBranding();renderGallery();document.dispatchEvent(new CustomEvent("daskool:cms-ready",{detail:state}))}
  async function load(){
    if(!config.projectId){applyAll();return state}
    const query=`{\"settings\":*[_type==\"siteSettings\"][0]{landingMotionImages[]{alt,orientation,asset->{url}},landingCategoryImages{branding[]{alt,asset->{url}},social[]{alt,asset->{url}},motion[]{alt,asset->{url}},photo[]{alt,asset->{url}}},aboutHoverImages[]{orientation,image{alt,asset->{url}}},workCategoryMotionImages{branding[]{alt,asset->{url}},social[]{alt,asset->{url}},motion[]{alt,asset->{url}},photo[]{alt,asset->{url}}}},\"projects\":*[_type==\"showcaseProject\" && defined(slug.current) && defined(template)]|order(order asc){_id,title,\"slug\":slug.current,categories,template,description,brandingItems[]{label,image{alt,asset->{url}}},galleryItems[]{caption,image{alt,asset->{url}}}},\"legacy\":*[_type==\"project\" && status==\"published\"]|order(projectOrder asc){_id,title,\"slug\":slug.current,category,shortDescription,thumbnail{alt,asset->{url}},coverImage{alt,asset->{url}}}}`;
    const host=config.useCdn!==false?"apicdn":"api";
    const url=`https://${config.projectId}.${host}.sanity.io/v${config.apiVersion||"2026-09-01"}/data/query/${config.dataset||"production"}?query=${encodeURIComponent(query)}`;
    try{const response=await fetch(url);if(!response.ok)throw new Error(`CMS ${response.status}`);const payload=await response.json();state.settings=payload.result&&payload.result.settings;const result=payload.result||{};const legacy=(result.legacy||[]).flatMap(project=>{const categories=(project.category||[]).filter(category=>categoryKeys.includes(category));const image=project.coverImage?.asset?.url?project.coverImage:project.thumbnail;return categories.map(category=>({title:project.title,slug:`${project.slug}-${category}`,categories:[category],template:category==='branding'?'branding':'gallery',description:project.shortDescription||'',brandingItems:image?[{image,label:project.title}]:[],galleryItems:image?[{image,caption:project.title}]:[]}))});state.usingLegacy=!result.projects?.length;state.projects=state.usingLegacy?legacy:result.projects;state.connected=true;applyAll()}catch(error){console.warn("Daskool CMS fallback active:",error);applyAll()}
    return state;
  }
  window.DASKOOL_CMS={state,load,applyAll,applyAbout,applyWorkCategory,uniqueProjects};
  load();
})();
