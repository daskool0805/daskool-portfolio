(async function(){
  const params=new URLSearchParams(location.search);
  const projectId=document.body.dataset.projectId||params.get('slug')||location.pathname.split('/').filter(Boolean).pop().replace(/\.html$/,'');
  let project, cmsResponded = false;
  try{const response=await fetch(`/api/project?slug=${encodeURIComponent(projectId)}`);if(response.ok){project=await response.json();cmsResponded=true}else if(response.status===404){cmsResponded=true}}catch(error){}
  project=project||(!cmsResponded&&window.DASKOOL_PROJECTS&&window.DASKOOL_PROJECTS[projectId]);
  if(!project){document.querySelector('[data-project-detail]').innerHTML='<p class="project-not-found">Project not found.</p>';return}

  const one=(tag,className)=>{const el=document.createElement(tag);if(className)el.className=className;return el};
  const imageUrl=(data,width)=>{const raw=data&&((data.url)||(data.asset&&data.asset.url)||data.src);if(!raw)return'';if(!raw.includes('cdn.sanity.io'))return raw;const join=raw.includes('?')?'&':'?';return `${raw}${join}auto=format&fit=max&w=${width}`};
  const image=(data)=>{const img=one("img");img.src=imageUrl(data,1800);if((data&&data.url)||(data&&data.asset&&data.asset.url)){img.srcset=`${imageUrl(data,640)} 640w, ${imageUrl(data,1200)} 1200w, ${imageUrl(data,1800)} 1800w, ${imageUrl(data,2400)} 2400w`;img.sizes="(max-width:760px) 100vw, 90vw"}img.alt=data&&data.alt||data&&data.caption||project.title.replace(/\n/g,' ');img.loading="lazy";img.decoding="async";return img};
  const caption=(text)=>{if(!text)return null;const el=one("figcaption","project-caption");el.textContent=text;return el};
  const paragraphs=(items,parent)=>{(items||[]).forEach(text=>{const p=one("p");p.textContent=text;parent.appendChild(p)})};

  const renderers={
    fullImage(block){const section=one("section","project-block project-full-image");const figure=one("figure");figure.appendChild(image(block.image||block));const cap=caption(block.caption);if(cap)figure.appendChild(cap);section.appendChild(figure);return section},
    landscapeImage(block){return this.fullImage(block)},
    portraitImage(block){const section=this.fullImage(block);section.classList.add('project-portrait-image');return section},
    squareImage(block){const section=this.fullImage(block);section.classList.add('project-square-image');return section},
    twoImages(block){const section=one("section","project-block project-two-images");(block.images||[]).slice(0,2).forEach(item=>{const figure=one("figure");figure.appendChild(image(item));const cap=caption(item.caption);if(cap)figure.appendChild(cap);section.appendChild(figure)});return section},
    threeImages(block){const section=one("section","project-block project-three-images");(block.images||[]).slice(0,3).forEach(item=>{const figure=one("figure");figure.appendChild(image(item));const cap=caption(item.caption);if(cap)figure.appendChild(cap);section.appendChild(figure)});return section},
    video(block){const section=one("section","project-block project-video");section.style.setProperty("--video-ratio",block.aspectRatio||"16 / 9");const src=block.url||(block.file&&block.file.asset&&block.file.asset.url)||block.src;if(src){const video=one("video");video.src=src;if(block.poster)video.poster=imageUrl(block.poster,1800);video.controls=block.controls!==false;video.loop=!!block.loop;video.muted=block.muted!==false;video.playsInline=true;section.appendChild(video)}return section},
    gif(block){return this.fullImage(block)},
    textBlock(block){const section=one("section","project-block project-text");if(block.heading){const h=one("h2");h.textContent=block.heading;section.appendChild(h)}const text=(block.body||[]).map(item=>item.children?item.children.map(c=>c.text).join(''):item).filter(Boolean);paragraphs(text,section);return section},
    text(block){const section=one("section","project-block project-text");if(block.title){const h=one("h2");h.textContent=block.title;section.appendChild(h)}paragraphs(block.paragraphs,section);const cap=caption(block.caption);if(cap)section.appendChild(cap);return section},
    imageText(block){const section=one("section","project-block project-image-text "+(block.imagePosition==="right"?"is-text-left":"is-image-left"));const media=one("figure","project-image-text-media");media.appendChild(image(block.image||{}));const cap=caption(block.image&&block.image.caption);if(cap)media.appendChild(cap);const copy=one("div","project-image-text-copy");if(block.title){const h=one("h2");h.textContent=block.title;copy.appendChild(h)}paragraphs(block.paragraphs,copy);section.append(media,copy);return section},
    spacer(block){return one("div","project-block project-spacer project-spacer--"+(["small","medium","large"].includes(block.size)?block.size:"medium"))}
  };

  const category=Array.isArray(project.category)?project.category.join(' / '):project.category;
  document.querySelector("[data-project-eyebrow]").textContent=project.eyebrow||project.legacyEyebrow||[project.year,category].filter(Boolean).join(' — ');
  document.querySelector("[data-project-title]").innerHTML=project.title.split("\n").map(part=>part.replace(/[&<>]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[char])).join("<br>");
  document.querySelector("[data-project-intro]").textContent=project.fullDescription||project.shortDescription||project.intro||'';
  document.title=`${project.title.replace(/\n/g,' ')} — Daskool`;
  const blocks=document.querySelector("[data-project-blocks]");
  (project.content||project.blocks||[]).forEach(block=>{const type=block._type||block.type;if(renderers[type])blocks.appendChild(renderers[type](block))});
})();
