(function(){
  const projectId=document.body.dataset.projectId;
  const project=window.DASKOOL_PROJECTS&&window.DASKOOL_PROJECTS[projectId];
  if(!project)return;

  const one=(tag,className)=>{const el=document.createElement(tag);if(className)el.className=className;return el};
  const image=(data)=>{const img=one("img");img.src=data.src;img.alt=data.alt||"";img.loading="lazy";img.decoding="async";return img};
  const caption=(text)=>{if(!text)return null;const el=one("figcaption","project-caption");el.textContent=text;return el};
  const paragraphs=(items,parent)=>{(items||[]).forEach(text=>{const p=one("p");p.textContent=text;parent.appendChild(p)})};

  const renderers={
    fullImage(block){const section=one("section","project-block project-full-image");const figure=one("figure");figure.appendChild(image(block));const cap=caption(block.caption);if(cap)figure.appendChild(cap);section.appendChild(figure);return section},
    twoImages(block){const section=one("section","project-block project-two-images");(block.images||[]).slice(0,2).forEach(item=>{const figure=one("figure");figure.appendChild(image(item));const cap=caption(item.caption);if(cap)figure.appendChild(cap);section.appendChild(figure)});return section},
    video(block){const section=one("section","project-block project-video");section.style.setProperty("--video-ratio",block.aspectRatio||"16 / 9");if(block.src){const video=one("video");video.src=block.src;if(block.poster)video.poster=block.poster;video.controls=block.controls!==false;video.loop=!!block.loop;video.muted=block.muted!==false;video.playsInline=true;section.appendChild(video)}else{const placeholder=one("div","project-video-placeholder");const label=one("span");label.textContent=block.label||"VIDEO / MOTION PLACEHOLDER";placeholder.appendChild(label);section.appendChild(placeholder)}return section},
    text(block){const section=one("section","project-block project-text");if(block.title){const h=one("h2");h.textContent=block.title;section.appendChild(h)}paragraphs(block.paragraphs,section);const cap=caption(block.caption);if(cap)section.appendChild(cap);return section},
    imageText(block){const section=one("section","project-block project-image-text "+(block.imagePosition==="right"?"is-text-left":"is-image-left"));const media=one("figure","project-image-text-media");media.appendChild(image(block.image||{}));const cap=caption(block.image&&block.image.caption);if(cap)media.appendChild(cap);const copy=one("div","project-image-text-copy");if(block.title){const h=one("h2");h.textContent=block.title;copy.appendChild(h)}paragraphs(block.paragraphs,copy);section.append(media,copy);return section},
    spacer(block){return one("div","project-block project-spacer project-spacer--"+(["small","medium","large"].includes(block.size)?block.size:"medium"))}
  };

  document.querySelector("[data-project-eyebrow]").textContent=project.eyebrow;
  document.querySelector("[data-project-title]").innerHTML=project.title.split("\n").map(part=>part.replace(/[&<>]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;"})[char])).join("<br>");
  document.querySelector("[data-project-intro]").textContent=project.intro;
  const blocks=document.querySelector("[data-project-blocks]");
  project.blocks.forEach(block=>{if(renderers[block.type])blocks.appendChild(renderers[block.type](block))});
})();
