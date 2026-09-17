(async function () {
  const list = document.querySelector('[data-cms-project-list]');
  const tabs = document.querySelector('.showcase-shell .project-tabs');
  if (!list && !tabs) return;
  try {
    const response = await fetch('/api/projects');
    if (!response.ok) return;
    const projects = await response.json();
    if (!Array.isArray(projects)) return;
    const linkFor = project => {
      const link = document.createElement('a');
      link.href = `/work/${encodeURIComponent(project.slug)}`;
      link.textContent = project.title;
      return link;
    };
    if (list) {
      list.replaceChildren(...projects.map((project, index) => {
        const link = linkFor(project);
        link.className = 'project-name project-link';
        link.dataset.categories = (project.category || []).join(' ');
        if (index < projects.length - 1) link.append(',');
        return link;
      }));
      if (!projects.length) list.textContent = 'Projects coming soon.';
      document.dispatchEvent(new CustomEvent('daskool:projects-loaded'));
    }
    if (tabs) {
      const category = document.body.classList.contains('branding-showcase') ? 'branding' : new URLSearchParams(location.search).get('category') || 'social';
      const selected = projects.filter(p => (p.category || []).includes(category));
      tabs.removeAttribute('role');
      tabs.replaceChildren(...selected.map(project => {const link=linkFor(project);link.className='showcase-project';return link;}));
      const canvas = document.querySelector('.brand-canvas,.gallery-stage');
      canvas.replaceChildren(...selected.map(project => {
        const link=linkFor(project);link.className='cms-project-card';
        if(project.thumbnail?.url){const img=document.createElement('img');img.src=project.thumbnail.url+'?auto=format&w=1200';img.alt=project.title;img.loading='lazy';link.prepend(img);}
        return link;
      }));
      if(!selected.length) canvas.textContent='Projects coming soon.';
      document.querySelector('[data-art-grid]')?.replaceChildren();
      const copy=document.querySelector('[data-gallery-copy],[data-project-copy]');if(copy)copy.textContent='Select a project to explore its full story.';
    }
  } catch { /* Keep local portfolio available when the CMS is offline. */ }
})();
