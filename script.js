const mockFrames=[...document.querySelectorAll('.mock-frame')];
if(mockFrames.length){mockFrames.forEach((frame,i)=>frame.dataset.pos=i);const paint=()=>{const focusPos=matchMedia('(max-width:760px)').matches?1:3;mockFrames.forEach(frame=>{const p=Number(frame.dataset.pos);frame.style.setProperty('--p',p);frame.style.setProperty('--angle',`${56-p*20}deg`);frame.classList.toggle('is-focus',p===focusPos)})};paint();if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(()=>{const wrapping=mockFrames.find(frame=>Number(frame.dataset.pos)===7);mockFrames.forEach(frame=>frame.dataset.pos=Number(frame.dataset.pos)+1);paint();setTimeout(()=>{if(!wrapping)return;wrapping.classList.add('no-transition');wrapping.dataset.pos=0;paint();requestAnimationFrame(()=>requestAnimationFrame(()=>wrapping.classList.remove('no-transition')))},900)},1450)}
let cursorAction=document.querySelector('.cursor-action');
if(!cursorAction){cursorAction=document.createElement('span');cursorAction.className='cursor-action';cursorAction.setAttribute('aria-hidden','true');cursorAction.textContent='DRAG';document.body.append(cursorAction)}
if(cursorAction&&matchMedia('(pointer:fine)').matches){const echoes=Array.from({length:4},(_,i)=>{const echo=document.createElement('i');echo.className=`cursor-echo echo-${i+1}`;document.body.append(echo);return{x:0,y:0,el:echo}});let tx=0,ty=0,cx=0,cy=0,started=false;addEventListener('pointermove',e=>{tx=e.clientX+18;ty=e.clientY+20;const categoryArea=e.target.closest('.landing-categories a');const categoryHot=categoryArea&&e.target.closest('small,.category-thumbs,span:not(.category-thumbs)');const clickable=categoryHot||(!categoryArea&&e.target.closest('a,button'));cursorAction.textContent=clickable?'CLICK':'DRAG';cursorAction.classList.add('visible');echoes.forEach(x=>x.el.classList.add('visible'));if(!started){cx=tx;cy=ty;echoes.forEach(x=>{x.x=tx;x.y=ty});started=true;requestAnimationFrame(follow)}});function follow(){cx+=(tx-cx)*.34;cy+=(ty-cy)*.34;cursorAction.style.transform=`translate3d(${cx}px,${cy}px,0)`;let leadX=cx,leadY=cy;echoes.forEach((echo,i)=>{const ease=.22-i*.035;echo.x+=(leadX-echo.x)*ease;echo.y+=(leadY-echo.y)*ease;echo.el.style.transform=`translate3d(${echo.x}px,${echo.y}px,0)`;leadX=echo.x;leadY=echo.y});requestAnimationFrame(follow)}document.documentElement.addEventListener('mouseleave',()=>{cursorAction.classList.remove('visible');echoes.forEach(x=>x.el.classList.remove('visible'))})}
const landingHeroBio=document.querySelector('.landing-body .hero-bio');
if(landingHeroBio){
  let logoFramePending=false;
  const updateHeroLogo=()=>{
    logoFramePending=false;
    const range=Math.max(1,innerHeight*.72);
    const progress=Math.max(0,Math.min(1,scrollY/range));
    const startTop=innerHeight-(matchMedia('(max-width:760px)').matches?320:270);
    const endTop=18;
    const translateY=(endTop-startTop)*progress;
    const scale=1-progress*.7;
    landingHeroBio.style.transform=`translate3d(0,${translateY}px,0) scale(${scale})`;
    landingHeroBio.classList.toggle('is-corner-logo',progress>.96);
  };
  const requestHeroLogo=()=>{if(!logoFramePending){logoFramePending=true;requestAnimationFrame(updateHeroLogo)}};
  addEventListener('scroll',requestHeroLogo,{passive:true});
  addEventListener('resize',requestHeroLogo);
  updateHeroLogo();
}
const contactDetails=document.querySelector('.landing-body .contact-details');function updateLandingScroll(){if(!contactDetails)return;if(matchMedia('(max-width:760px)').matches){contactDetails.style.transform='none';return}const max=document.documentElement.scrollHeight-innerHeight;const photography=document.querySelector('.landing-categories a:last-child');const start=photography?photography.offsetTop+photography.offsetHeight-innerHeight*.82:max*.72;const range=Math.max(1,max-start);const p=Math.max(0,Math.min(1,(scrollY-start)/range));contactDetails.style.transform=`translate3d(${(1-p)*62}vw,0,0)`}addEventListener('scroll',updateLandingScroll,{passive:true});addEventListener('resize',updateLandingScroll);updateLandingScroll();
const morphText=document.querySelector('.hero-bio p');
if(morphText){const original=morphText.textContent.trim();morphText.classList.add('morph-text');morphText.setAttribute('aria-label',original);morphText.setAttribute('tabindex','0');const image=new Image();image.src='/assets/horse-letter-mask.webp';Promise.all([document.fonts.ready,new Promise(resolve=>{image.onload=resolve;image.onerror=resolve})]).then(()=>{const layout=()=>{if(morphText.dataset.asciiHorse)return;const width=morphText.clientWidth||470,height=morphText.clientHeight||300,style=getComputedStyle(morphText),measure=document.createElement('canvas').getContext('2d');measure.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;const line=parseFloat(style.lineHeight)||22,xStart=0;let x=xStart,y=3;const chars=[];original.match(/\S+|\s+/g).forEach(token=>{if(/^\s+$/.test(token)){x+=measure.measureText(' ').width;return}const wordWidth=measure.measureText(token).width;if(x&&x+wordWidth>width){x=xStart;y+=line}for(const char of token){chars.push({char,x,y});x+=measure.measureText(char).width}});const targetCount=Math.max(chars.length+130,360),points=[];if(image.naturalWidth){const c=document.createElement('canvas'),ctx=c.getContext('2d');c.width=image.naturalWidth;c.height=image.naturalHeight;ctx.drawImage(image,0,0);const data=ctx.getImageData(0,0,c.width,c.height).data;for(let yy=0;yy<c.height;yy+=3)for(let xx=0;xx<c.width;xx+=3){const i=(yy*c.width+xx)*4;if(data[i]+data[i+1]+data[i+2]<650)points.push({x:xx,y:yy})}}let minX=Infinity,minY=Infinity,maxX=0,maxY=0;points.forEach(pt=>{minX=Math.min(minX,pt.x);minY=Math.min(minY,pt.y);maxX=Math.max(maxX,pt.x);maxY=Math.max(maxY,pt.y)});const cloud=[];for(let i=0;i<targetCount;i++){const pt=points.length?points[Math.floor(i*points.length/targetCount)]:{x:(i%30)*10,y:Math.floor(i/30)*10};cloud.push({x:((pt.x-minX)/(maxX-minX||1))*width*.96+width*.02,y:((pt.y-minY)/(maxY-minY||1))*height*.96+height*.01})}morphText.replaceChildren();const alphabet='DASKOOLGRAPHICDESIGN0123456789';for(let i=0;i<targetCount;i++){const span=document.createElement('span'),target=chars[i],horse=cloud[i];const nx=horse.x/width,ny=horse.y/height;const region=ny>.54?(nx>.56?'front-leg':nx<.5?'rear-leg':'mid-leg'):nx>.78?'horse-head':nx>.62?'horse-neck':nx>.48?'horse-shoulder':nx<.18?'horse-tail':nx<.34?'horse-rump':'horse-torso';span.className=`morph-letter ${region}`;span.textContent=target?target.char:alphabet[(i*7)%alphabet.length];span.setAttribute('aria-hidden','true');span.style.setProperty('--hx',`${horse.x}px`);span.style.setProperty('--hy',`${horse.y}px`);span.style.setProperty('--tx',`${target?target.x:width*.5}px`);span.style.setProperty('--ty',`${target?target.y+55:height*.5}px`);span.style.setProperty('--read-opacity',target?'1':'0');span.style.setProperty('--delay',`${(i%23)*7}ms`);morphText.append(span)}if(!morphText.classList.contains('horse-enter'))requestAnimationFrame(()=>morphText.classList.add('horse-enter'))};layout();let timer;addEventListener('resize',()=>{clearTimeout(timer);timer=setTimeout(layout,180)});morphText.addEventListener('mouseenter',()=>morphText.classList.add('is-reading'));morphText.addEventListener('mouseleave',()=>morphText.classList.remove('is-reading'));morphText.addEventListener('focus',()=>morphText.classList.add('is-reading'));morphText.addEventListener('blur',()=>morphText.classList.remove('is-reading'))})}
const cats=[...document.querySelectorAll('.category')],categoryArtStack=document.querySelector('.category-art-stack');
if(cats.length){
  const shuffle=list=>list.map(value=>({value,sort:Math.random()})).sort((a,b)=>a.sort-b.sort).map(item=>item.value);
  const set=c=>{
    cats.forEach(category=>category.classList.toggle('is-selected',category===c));
    document.body.classList.add('has-category-focus');
    document.querySelectorAll('.project-name').forEach(p=>p.classList.toggle('highlight',(p.dataset.categories||'').split(/\s+/).includes(c.dataset.category)));
    if(categoryArtStack){
      window.DASKOOL_CMS?.applyWorkCategory(c.dataset.category,categoryArtStack.children);
      shuffle([...categoryArtStack.children]).forEach(frame=>categoryArtStack.append(frame));
      categoryArtStack.dataset.category=c.dataset.category;
      categoryArtStack.classList.remove('is-active');
      void categoryArtStack.offsetWidth;
      categoryArtStack.classList.add('is-active');
    }
  };
  cats.forEach(c=>{c.addEventListener('mouseenter',()=>set(c));c.addEventListener('focus',()=>set(c))});
  const clearCategory=()=>{cats.forEach(category=>category.classList.remove('is-selected'));document.body.classList.remove('has-category-focus');document.querySelectorAll('.project-name').forEach(p=>p.classList.remove('highlight'));categoryArtStack?.classList.remove('is-active')};
  const categoryDock=document.querySelector('.category-dock');
  categoryDock?.addEventListener('mouseleave',clearCategory);
  categoryDock?.addEventListener('focusout',event=>{if(!categoryDock.contains(event.relatedTarget))clearCategory()});
  document.addEventListener('daskool:cms-ready',()=>{
    if(categoryArtStack?.dataset.category)window.DASKOOL_CMS?.applyWorkCategory(categoryArtStack.dataset.category,categoryArtStack.children);
  });
}

const workProjectList=document.querySelector('.work-page .project-list');
if(workProjectList){
  const layoutProjects=()=>{
    if(matchMedia('(max-width: 760px)').matches){workProjectList.style.removeProperty('--project-rows');return}
    const names=workProjectList.querySelectorAll('.project-name');
    if(!names.length)return;
    const page=document.querySelector('.work-page');
    const stack=page.querySelector('.category-art-stack');
    const pageStyle=getComputedStyle(page);
    const available=innerHeight-parseFloat(pageStyle.paddingTop)-parseFloat(pageStyle.paddingBottom)-stack.offsetHeight-34;
    let rows=Math.max(2,Math.min(names.length,Math.floor(available/(names[0].getBoundingClientRect().height||1))));
    workProjectList.style.setProperty('--project-rows',rows);
    const maxWidth=innerWidth-2*parseFloat(pageStyle.paddingLeft);
    while(rows<names.length&&workProjectList.scrollWidth>maxWidth){
      workProjectList.style.setProperty('--project-rows',++rows);
    }
  };
  layoutProjects();
  document.fonts?.ready.then(layoutProjects);
  addEventListener('resize',layoutProjects);
  addEventListener('workprojectschange',layoutProjects);
}

if(cats.length){
  const alphabet='abcdefghijklmnopqrstuvwxyz';
  const measure=()=>cats.forEach(category=>category.style.setProperty('--expanded-width',`${category.scrollWidth}px`));
  measure();
  addEventListener('resize',measure);
  const scatter=category=>{
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const rect=category.getBoundingClientRect();
    for(let i=0;i<30;i++){
      const grain=document.createElement('i');
      grain.className='sand-letter';
      grain.textContent=alphabet[(i*7+Math.floor(Math.random()*alphabet.length))%alphabet.length];
      grain.style.left=`${rect.left+Math.random()*Math.min(rect.width,230)}px`;
      grain.style.top=`${rect.top+Math.random()*rect.height}px`;
      grain.style.setProperty('--sand-x',`${(Math.random()-.35)*190}px`);
      grain.style.setProperty('--sand-y',`${-35-Math.random()*120}px`);
      grain.style.setProperty('--sand-r',`${(Math.random()-.5)*180}deg`);
      grain.style.animationDelay=`${Math.random()*90}ms`;
      document.body.append(grain);
      grain.addEventListener('animationend',()=>grain.remove(),{once:true});
    }
  };
  cats.forEach(category=>category.addEventListener('pointerenter',()=>scatter(category)));
}

const landingCategoryLinks=[...document.querySelectorAll('.landing-categories a')];
if(landingCategoryLinks.length){
  landingCategoryLinks.forEach(link=>link.addEventListener('click',event=>{
    if(matchMedia('(min-width:761px) and (hover:hover) and (pointer:fine)').matches&&!event.target.closest('small,.category-thumbs,span:not(.category-thumbs)'))event.preventDefault();
  }));
  let categoryFramePending=false;
  const updateCategoryFocus=()=>{
    categoryFramePending=false;
    const focusLine=innerHeight*.68;
    let activeIndex=-1;
    landingCategoryLinks.forEach((link,index)=>{
      const rect=link.getBoundingClientRect();
      if(rect.top<=focusLine)activeIndex=index;
    });
    const atPageEnd=scrollY+innerHeight>=document.documentElement.scrollHeight-3;
    if(atPageEnd)activeIndex=landingCategoryLinks.length-1;
    landingCategoryLinks.forEach((link,index)=>{
      const active=index===activeIndex;
      link.classList.toggle('is-scroll-active',active);
      const rect=link.getBoundingClientRect();
      const progress=Math.max(0,Math.min(1,(focusLine-rect.top)/Math.max(1,rect.height)));
      const imagePosition=progress*2;
      link.querySelectorAll('.category-thumbs i').forEach((image,imageIndex)=>{
        const opacity=active?Math.max(0,1-Math.abs(imagePosition-imageIndex)):0;
        image.style.opacity=opacity.toFixed(3);
      });
    });
  };
  const requestCategoryFocus=()=>{if(!categoryFramePending){categoryFramePending=true;requestAnimationFrame(updateCategoryFocus)}};
  addEventListener('scroll',requestCategoryFocus,{passive:true});
  addEventListener('resize',requestCategoryFocus);
  updateCategoryFocus();
}

const asciiHorse=document.querySelector('.hero-bio .morph-text');
const sharedHorseTemplates=[
`                                                               ##
                                                              ####
                                                       #  #########
                                                     ##############
                                                   #################
                                                #####################
                                               ########################
                                              ################ #########
                                            ################      ######
                                             ###############         ###
                              # ###########################
              #######      ################################
          #################################################
   ###################  ###################################
   # ##############    ######################################
   ###############     #####################################
#  #############        #######################################
 # #### ###            ###########   #############################
       #              ###########        ############################
                   #############                      #####       #####
                   #########                            ####        #####
                  ####                                   ####          ####
                ####                                      ###            #####
              ####                                         ###             ###
           ######                                            ##
           ####                                              ###
         ###                                                  ###
         ##                                                   ####`,
`                                                                    ###
                                                                   ####
                                                            #############
                                                         ################
                                                       ###################
                                                     #######################
                                                    #########################
                                                  ###############    #########
                                                 ################       ######
                                    #####       #################         ###
                              ##################################
                            ####################################
                 ##############################################
             ##################################################
       #################   ####################################
   ##################       ##################################
   #################         ################################
#  ###############            ###########     ################
 # #### # ##                    #########         ##############
                               #########            ####   ######
                              ####  ###              ####     ###
                              ###########            ####    ###
                                   ########        #####   ####
                                      ######  ########    ####
                                      ### ##  #####       ###
                                       ###
                                        ###
                                         ###`,
`                                                                    ###
                                                                  #####
                                                           ##############
                                                        #################
                                                       ####################
                                                     #######################
                                                   ##########################
                                                   ###############   #########
                                                 ################        #####
                                 ######         #################          ###
                             ###################################
               ########    ####################################
   #### #######################################################
# ############################################################
 #  ##################    ####################################
   #################       ###################################
    ###############         #################################
          ###                ##########       ################
                             ##########           #############
                               #######              ####   ######
                               ########              ####     ####
                               ### ######             ###       ###
                               ##     ######         ####       ####
                               ##        ####       ###           ###
                                #          ####  #####             ###
                                ##          ###  ###                ###
                                ###                                  ###
                                 ###`,
`                                                                    ##
                                                                   ####
                                                           ## ###########
                                                       ## ###############
                                                      ####################
                                                    #######################
                                                  ##########################
                                                 #############################
                                 ######          ################     ########
                             ###################################         #####
        ###   # #          ####################################            #
   ###########################################################
     ########################################################
## ###################   ####################################
 ###################     #####################################
   # #############         ##################################
          ###               #################################
                              ##########   #######################
                              #########         ##################
                             ####  ####             ####      ####
                             ###########             ###      ###
                                 ###########          ###    ###
                                   ########## ###  ######  ####
                                     ######## ########     ##
                                       ####      ##        #
                                         ###
                                          ###
                                           ###`
  ];
if(asciiHorse){
  const copy=asciiHorse.getAttribute('aria-label')||'';
  const art=document.createElement('pre');
  art.className='ascii-horse';
  art.setAttribute('aria-hidden','true');
  const readable=document.createElement('span');
  readable.className='ascii-copy';
  readable.textContent=copy;
  asciiHorse.dataset.asciiHorse='true';
  asciiHorse.classList.add('ascii-mode');
  asciiHorse.replaceChildren(art,readable);
  if(matchMedia('(max-width:760px), (hover:none)').matches){
    asciiHorse.setAttribute('role','button');
    asciiHorse.setAttribute('aria-label','About Daskool — tap to read');
    asciiHorse.setAttribute('aria-pressed','false');
    const toggleReading=()=>{
      const reading=asciiHorse.getAttribute('aria-pressed')!=='true';
      asciiHorse.setAttribute('aria-pressed',String(reading));
      asciiHorse.classList.toggle('is-reading',reading);
    };
    asciiHorse.addEventListener('click',toggleReading);
    asciiHorse.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleReading()}});
  }
  let frame=0;
  const glyphs='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?@#$%&*+'.split('');
  const compose=template=>template.replace(/#/g,()=>glyphs[Math.floor(Math.random()*glyphs.length)]);
  const renderedFrames=sharedHorseTemplates.map(compose);
  const draw=()=>{art.textContent=renderedFrames[frame];art.dataset.phase=String(frame+1);frame=(frame+1)%renderedFrames.length};
  draw();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(draw,115);
}

const asciiEyes=[...document.querySelectorAll('.ascii-eye-motion')];
if(asciiEyes.length){
  const width=58,height=34,letters='abcdefghijklmnopqrstuvwxyz';
  const pupilSizes=[.34,.27,.19,.3];
  const pupilShift=[[-.02,.01],[.035,-.015],[-.045,.025],[.015,0]];
  const makeEyeFrame=frame=>{
    const lines=[];
    for(let y=0;y<height;y++){
      let line='';
      for(let x=0;x<width;x++){
        const nx=(x-(width-1)/2)/(width*.48);
        const ny=(y-(height-1)/2)/(height*.48);
        const angle=Math.atan2(ny,nx);
        const radius=Math.hypot(nx,ny);
        const [shiftX,shiftY]=pupilShift[frame];
        const pupilRadius=Math.hypot(nx-shiftX,ny-shiftY);
        const inner=pupilSizes[frame]+Math.sin(angle*10+frame*1.7)*.025;
        const outer=.98+Math.sin(angle*13-frame)*.018;
        const grain=((x*17+y*31+frame*47)%19)/19;
        const radialThread=Math.sin(angle*34+radius*21+frame*1.9)>.05;
        const visible=radius<outer&&pupilRadius>inner&&(grain>.12||radialThread);
        line+=visible?letters[(x*11+y*7+frame*5)%letters.length]:' ';
      }
      lines.push(line.replace(/\s+$/,''));
    }
    return lines.join('\n');
  };
  const frames=[0,1,2,3].map(makeEyeFrame);
  let eyeFrame=0;
  const drawEye=()=>{asciiEyes.forEach((eye,index)=>eye.textContent=frames[(eyeFrame+index*2)%frames.length]);eyeFrame=(eyeFrame+1)%frames.length};
  drawEye();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(drawEye,170);
}

const asciiSunflower=document.querySelector('.ascii-sunflower');
if(asciiSunflower){
  const width=58,height=50,letters='abcdefghijklmnopqrstuvwxyz';
  const stages=[.08,.11,.15,.19,.24,.3,.37,.45,.54,.63,.72,.8,.87,.93,.97,1];
  const makeFlowerFrame=(stageIndex)=>{
    const stage=stages[stageIndex],cx=30,cy=15+(1-stage)*8,stemTop=Math.round(cy+5+stage*4),lines=[];
    for(let y=0;y<height;y++){
      let line='';
      for(let x=0;x<width;x++){
        const dx=x-cx,dy=(y-cy)*1.45;
        const angle=Math.atan2(dy,dx),radius=Math.hypot(dx,dy);
        const bloomRadius=2.6+stage*12.7;
        const petalEdge=bloomRadius*(.72+.28*Math.abs(Math.cos(angle*(6+Math.round(stage*8)))));
        const bloom=radius<petalEdge;
        const center=stage>.48&&radius<bloomRadius*.36;
        const bud=stage<.48&&Math.abs(dx)<2.4+stage*6&&y>=cy-4-stage*4&&y<=cy+5+stage*4;
        const stem=y>=stemTop&&y<height-1&&Math.abs(x-cx-Math.sin(y*.43+stageIndex)*.45)<1;
        const leftLeaf=stage>.2&&y>stemTop+7&&y<stemTop+17&&x<cx&&x>cx-15&&Math.abs(y-(stemTop+11+(cx-x)*.18))<2.4;
        const rightLeaf=stage>.32&&y>stemTop+13&&y<stemTop+23&&x>cx&&x<cx+15&&Math.abs(y-(stemTop+18-(x-cx)*.2))<2.4;
        const visible=bloom||bud||stem||leftLeaf||rightLeaf;
        const index=(x*7+y*11+stageIndex*5)%letters.length;
        line+=visible?(center?letters[(index+13)%letters.length]:letters[index]):' ';
      }
      lines.push(line.replace(/\s+$/,''));
    }
    return lines.join('\n');
  };
  const frames=stages.map((_,index)=>makeFlowerFrame(index));
  let frame=0;
  const draw=()=>{asciiSunflower.textContent=frames[frame];frame=(frame+1)%frames.length};
  draw();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(draw,155);
}

const cornerHorses=[...document.querySelectorAll('.corner-horse')];
if(cornerHorses.length){
  const glyphs='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!?@#$%&*+'.split('');
  const frames=sharedHorseTemplates.map(template=>template.replace(/#/g,()=>glyphs[Math.floor(Math.random()*glyphs.length)]));
  let frame=0;
  const draw=()=>{cornerHorses.forEach(horse=>horse.textContent=frames[frame]);frame=(frame+1)%frames.length};
  draw();
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches)setInterval(draw,135);
}

/* About: one hover target per grid slot, with the CMS images shuffled across slots. */
const aboutHoverField=document.querySelector('.about-hover-field');
if(aboutHoverField){
  const aboutPage=document.querySelector('.about-body .about');
  const aboutCopy=aboutPage?.querySelector('.about-copy');
  if(aboutCopy){
    const fitAboutCopy=()=>{
      aboutCopy.style.width='100%';
      aboutCopy.style.transform='none';
      if(matchMedia('(max-width:760px)').matches)return;
      const style=getComputedStyle(aboutPage);
      const available=aboutPage.clientHeight-parseFloat(style.paddingTop)-parseFloat(style.paddingBottom);
      let scale=Math.min(1,available/aboutCopy.scrollHeight);
      aboutCopy.style.width=`${100/scale}%`;
      scale=Math.min(1,available/aboutCopy.scrollHeight);
      aboutCopy.style.width=`${100/scale}%`;
      aboutCopy.style.transform=`scale(${scale})`;
    };
    fitAboutCopy();
    document.fonts?.ready.then(fitAboutCopy);
    addEventListener('resize',fitAboutCopy);
  }
  const fragment=document.createDocumentFragment();
  const imageOrder=Array.from({length:100},(_,index)=>index);
  let shuffleSeed=0xD45C0026;
  const fixedRandom=()=>{
    shuffleSeed=(shuffleSeed+0x6D2B79F5)>>>0;
    let value=shuffleSeed;
    value=Math.imul(value^(value>>>15),value|1);
    value^=value+Math.imul(value^(value>>>7),value|61);
    return ((value^(value>>>14))>>>0)/4294967296;
  };
  for(let index=imageOrder.length-1;index>0;index--){
    const swap=Math.floor(fixedRandom()*(index+1));
    [imageOrder[index],imageOrder[swap]]=[imageOrder[swap],imageOrder[index]];
  }
  for(let index=0;index<imageOrder.length;index++){
    const cell=document.createElement('span');
    const frame=document.createElement('i');
    const portrait=index%3!==0;
    cell.className='about-hover-cell';
    cell.dataset.imageIndex=imageOrder[index];
    cell.tabIndex=-1;
    frame.className=`about-hover-frame ${portrait?'is-portrait':'is-landscape'} tone-${index%5+1}`;
    cell.append(frame);
    fragment.append(cell);
  }
  aboutHoverField.append(fragment);
  window.DASKOOL_CMS?.applyAbout();

  /* Touch screens have no hover: a tap briefly reveals the selected frame. */
  if(matchMedia('(hover: none)').matches){
    aboutHoverField.addEventListener('pointerdown',event=>{
      const cell=event.target.closest('.about-hover-cell');
      if(!cell)return;
      aboutHoverField.querySelectorAll('.is-touch-active').forEach(item=>item.classList.remove('is-touch-active'));
      cell.classList.add('is-touch-active');
      clearTimeout(cell._hideTimer);
      cell._hideTimer=setTimeout(()=>cell.classList.remove('is-touch-active'),900);
    });
  }
}

const brandingTabs=[...document.querySelectorAll('.branding-showcase .showcase-project')];
if(brandingTabs.length){
  const brandingProjects={
    lang:{copy:'A lively identity system that connects local culture, everyday movement and a distinctly contemporary visual voice.',tones:['green','cool','warm'],labels:['hero identity / 01','brand application / 02','campaign system / 03']},
    vinamilk:{copy:'A flexible brand and campaign system that brings product stories into a clear, friendly and recognizable visual world.',tones:['cool','green','warm'],labels:['brand direction / 01','campaign system / 02','brand application / 03']},
    karrots:{copy:'A playful identity built from bold shapes, energetic color and a modular language designed to grow across touchpoints.',tones:['warm','cool','green'],labels:['identity direction / 01','visual language / 02','brand world / 03']}
  };
  const copy=document.querySelector('[data-project-copy]'),frames=[...document.querySelectorAll('.brand-frame')];
  const activate=tab=>{
    const data=brandingProjects[tab.dataset.project];
    brandingTabs.forEach(item=>{const active=item===tab;item.classList.toggle('is-active',active);item.setAttribute('aria-selected',String(active))});
    copy.textContent=data.copy;
    frames.forEach((frame,index)=>{frame.classList.remove('warm','cool','green');frame.classList.add(data.tones[index%data.tones.length])});
  };
  brandingTabs.forEach(tab=>tab.addEventListener('click',()=>activate(tab)));
}

const galleryRoot=document.querySelector('.gallery-showcase');
if(galleryRoot){
  const sets={
    social:{title:'social creative design',projects:[['Vinamilk','A modular social system designed for fast-moving product stories.'],['V.DienGiaHuy','Editorial social content with a graphic, personality-led rhythm.'],['ExoTrails','Social storytelling for exploration, community and outdoor culture.'],['Deye','A flexible campaign toolkit for community milestones.'],['Karrots','Playful social content built from a bold and modular brand language.']]},
    motion:{title:'video & motion',projects:[['ExoTrails','Motion-led storytelling for exploration, community and outdoor culture.'],['Deye','Short-form motion assets built for product and social campaigns.']]},
    photo:{title:'photography',projects:[['Lăng Ông Bà Chiểu','A photographic study of local culture, architecture and place.'],['V.DienGiaHuy','Character-led imagery shaped by personal expression and context.'],['ExoTrails','Outdoor photography focused on movement, community and discovery.']]}
  };
  const params=new URLSearchParams(location.search),key=sets[params.get('category')]?params.get('category'):'social',set=sets[key];
  const title=document.querySelector('[data-gallery-category]'),tabs=document.querySelector('[data-gallery-projects]'),copy=document.querySelector('[data-gallery-copy]'),grid=document.querySelector('[data-art-grid]'),preview=document.querySelector('[data-gallery-preview]');
  document.title=`${set.title} — Daskool`;title.textContent=set.title;
  const clearPreview=()=>{[...grid.children].forEach(item=>item.classList.remove('is-active'));preview.classList.remove('warm','cool','green','is-showing-media')};
  const selectArtwork=(button,index)=>{[...grid.children].forEach(item=>item.classList.toggle('is-active',item===button));preview.classList.remove('warm','cool','green');preview.classList.add(['green','cool','warm'][index%3],'is-showing-media')};
  const renderArtworks=project=>{
    grid.replaceChildren();
    const touchLayout=matchMedia('(max-width:760px), (hover:none)').matches;
    Array.from({length:12},(_,index)=>{const button=document.createElement('button');button.className='art-thumb';button.type='button';button.setAttribute('aria-label',`${project} artwork ${index+1}`);if(!touchLayout){button.addEventListener('pointerenter',()=>selectArtwork(button,index));button.addEventListener('pointerleave',clearPreview);button.addEventListener('focus',()=>selectArtwork(button,index));button.addEventListener('blur',clearPreview)}else button.addEventListener('click',()=>selectArtwork(button,index));grid.append(button);return button});
    if(touchLayout)selectArtwork(grid.firstElementChild,0);else clearPreview();
  };
  set.projects.forEach(([name,description],index)=>{const button=document.createElement('button');button.className=`showcase-project${index===0?' is-active':''}`;button.type='button';button.textContent=name;button.setAttribute('aria-selected',String(index===0));button.addEventListener('click',()=>{[...tabs.children].forEach(item=>{const active=item===button;item.classList.toggle('is-active',active);item.setAttribute('aria-selected',String(active))});copy.textContent=description;renderArtworks(name)});tabs.append(button)});
  copy.textContent=set.projects[0][1];renderArtworks(set.projects[0][0]);
}
