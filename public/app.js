document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('projects-grid');
  const modal = document.getElementById('preview-modal');
  const iframe = document.getElementById('preview-iframe');
  const closeBtn = document.getElementById('close-modal');
  const modalTitle = document.getElementById('preview-title');
  const modalBadge = document.getElementById('preview-badge');
  const modalTypeBadge = document.getElementById('preview-type-badge');
  const modalNewTab = document.getElementById('preview-new-tab');
  
  const filterBtns = document.querySelectorAll('.filter-btn');
  let allProjectsData = [];

  const shapes = [
    `<svg viewBox="0 0 100 100" class="w-20 h-20 text-emerald-500/20 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]"><rect x="20" y="20" width="60" height="60" rx="8" fill="currentColor" transform="rotate(15 50 50)"/><rect x="25" y="25" width="50" height="50" rx="4" fill="none" stroke="currentColor" stroke-width="2" transform="rotate(15 50 50)"/></svg>`,
    `<svg viewBox="0 0 100 100" class="w-20 h-20 text-emerald-500/20 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]"><circle cx="50" cy="50" r="30" fill="currentColor"/><circle cx="50" cy="50" r="35" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="4 4"/></svg>`,
    `<svg viewBox="0 0 100 100" class="w-20 h-20 text-emerald-500/20 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]"><polygon points="50,15 85,80 15,80" fill="currentColor"/><polygon points="50,25 75,70 25,70" fill="none" stroke="currentColor" stroke-width="2"/></svg>`,
    `<svg viewBox="0 0 100 100" class="w-20 h-20 text-emerald-500/20 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]"><path d="M20 50 Q 50 10 80 50 T 20 50" fill="currentColor"/><path d="M25 50 Q 50 20 75 50 T 25 50" fill="none" stroke="currentColor" stroke-width="2"/></svg>`
  ];

  fetch('/api/projects')
    .then(res => res.json())
    .then(data => {
      // Flatten data for easier filtering
      data.forEach(category => {
        category.projects.forEach(proj => {
          allProjectsData.push({
            ...proj,
            category: category.label
          });
        });
      });
      
      renderProjects('all');
      
      const style = document.createElement('style');
      style.innerHTML = `
        @keyframes fade-in {
          to { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    })
    .catch(err => console.error(err));

  // Filters logic
  filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterBtns.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');
      renderProjects(filter);
    });
  });

  function renderProjects(filter) {
    grid.innerHTML = '';
    const filtered = filter === 'all' 
      ? allProjectsData 
      : allProjectsData.filter(p => p.category === filter);

    if (filtered.length === 0) {
      grid.innerHTML = `<div class="col-span-2 text-center text-zinc-500 py-12 text-sm">Nenhum projeto encontrado nesta categoria.</div>`;
      return;
    }

    filtered.forEach((proj, index) => {
      const shape = shapes[index % shapes.length];
      const delay = Math.min(index * 50, 500); // cap delay for performance
      
      const card = document.createElement('div');
      card.className = 'project-card opacity-0 translate-y-4';
      card.style.animation = `fade-in 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards ${delay}ms`;
      
      // Setup hover actions based on what files exist
      let actionsHTML = '';
      if (proj.hasIndex) {
        actionsHTML += `<button class="action-btn action-btn-primary" onclick="window.openPreview('${proj.indexUrl}', '${proj.name}', '${proj.category}', 'Index UI')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg> Layout</button>`;
      }
      if (proj.hasDesignSystem) {
        actionsHTML += `<button class="action-btn action-btn-secondary" onclick="window.openPreview('${proj.designSystemUrl}', '${proj.name}', '${proj.category}', 'Design System')"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg> Design System</button>`;
      }

      card.innerHTML = `
        <div class="project-card-image">
          <div class="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19 12h2"></path><path d="M3 12h2"></path><path d="M12 3v2"></path><path d="M12 19v2"></path></svg>
          </div>
          <div class="card-status">${proj.category}</div>
          ${shape}
        </div>
        <div class="project-card-content relative">
          <h3 class="text-base font-bold text-white mb-1 truncate">${proj.name.replace(/[-_]/g, ' ').replace('.aura.build', '')}</h3>
          <p class="text-[12px] text-zinc-500 truncate mb-2">Arquivos: ${proj.hasIndex ? 'Index ' : ''}${proj.hasDesignSystem ? 'Design System' : ''}</p>
        </div>
        <div class="card-actions">
           ${actionsHTML}
        </div>
      `;
      grid.appendChild(card);
    });
  }

  // Make openPreview accessible globally for the onclick handlers in strings
  window.openPreview = function(url, name, cat, type) {
    if (!url) return;
    modalTitle.textContent = name.replace(/[-_]/g, ' ');
    modalBadge.textContent = cat.toUpperCase();
    modalTypeBadge.textContent = type.toUpperCase();
    
    // Adjust colors for type badge
    if (type === 'Design System') {
      modalTypeBadge.className = 'px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold text-indigo-400 tracking-wider';
    } else {
      modalTypeBadge.className = 'px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-zinc-300 tracking-wider';
    }

    modalNewTab.href = url;
    iframe.src = url;
    
    modal.classList.remove('pointer-events-none', 'opacity-0');
    modal.classList.add('pointer-events-auto', 'opacity-100');
    document.body.style.overflow = 'hidden';
  };

  function closePreview() {
    modal.classList.remove('pointer-events-auto', 'opacity-100');
    modal.classList.add('pointer-events-none', 'opacity-0');
    setTimeout(() => {
      iframe.src = '';
      document.body.style.overflow = '';
    }, 300);
  }

  closeBtn.addEventListener('click', closePreview);
  
  document.getElementById('scroll-to-projects').addEventListener('click', () => {
     const gallery = document.querySelector('.overflow-y-auto');
     if(gallery) gallery.scrollBy({ top: 400, behavior: 'smooth' });
  });
});
