// ============================================
// CLEANPRO — UTILITIES
// ============================================

// ── TOAST NOTIFICATIONS ──
const Toast = {
  show(message, type = 'info', duration = 3500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || icons.info}</span>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('out');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success: (msg) => Toast.show(msg, 'success'),
  error:   (msg) => Toast.show(msg, 'error'),
  warning: (msg) => Toast.show(msg, 'warning'),
  info:    (msg) => Toast.show(msg, 'info'),
};
window.Toast = Toast;

// ── DATE / TIME HELPERS ──
const DateUtils = {
  today() { return new Date().toISOString().split('T')[0]; },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric'
    });
  },

  formatTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleTimeString('id-ID', {
      hour: '2-digit', minute: '2-digit'
    });
  },

  formatDateTime(dateStr) {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  },

  timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 60) return 'Baru saja';
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins} menit lalu`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} jam lalu`;
    return DateUtils.formatDate(dateStr);
  }
};
window.DateUtils = DateUtils;

// ── IMAGE VIEWER ──
const ImageViewer = {
  open(url) {
    let overlay = document.getElementById('img-viewer');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'img-viewer-overlay';
      overlay.id = 'img-viewer';
      overlay.innerHTML = `
        <button class="img-viewer-close" onclick="ImageViewer.close()">✕</button>
        <img id="img-viewer-img" src="" alt="Preview">
      `;
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) ImageViewer.close();
      });
      document.body.appendChild(overlay);
    }
    document.getElementById('img-viewer-img').src = url;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  },
  close() {
    document.getElementById('img-viewer')?.classList.remove('open');
    document.body.style.overflow = '';
  }
};
window.ImageViewer = ImageViewer;

// ── SIDEBAR CONTROLLER ──
const Sidebar = {
  collapsed: false,

  init() {
    this.collapsed = localStorage.getItem('cp_sidebar') === 'collapsed';
    this.apply();

    // Mobile overlay click
    document.getElementById('sidebarOverlay')?.addEventListener('click', () => this.closeMobile());
  },

  toggle() {
    if (window.innerWidth < 768) {
      this.toggleMobile();
    } else {
      this.collapsed = !this.collapsed;
      localStorage.setItem('cp_sidebar', this.collapsed ? 'collapsed' : 'expanded');
      this.apply();
    }
  },

  apply() {
    const sidebar = document.getElementById('sidebar');
    const mainContent = document.getElementById('mainContent');
    const topbar = document.getElementById('topbar');

    if (this.collapsed) {
      sidebar?.classList.add('collapsed');
      mainContent?.classList.add('sidebar-collapsed');
      topbar?.classList.add('sidebar-collapsed');
    } else {
      sidebar?.classList.remove('collapsed');
      mainContent?.classList.remove('sidebar-collapsed');
      topbar?.classList.remove('sidebar-collapsed');
    }
  },

  toggleMobile() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    sidebar?.classList.toggle('mobile-open');
    overlay?.classList.toggle('show');
  },

  closeMobile() {
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    document.getElementById('sidebarOverlay')?.classList.remove('show');
  }
};
window.Sidebar = Sidebar;

// ── SKELETON LOADER ──
function skeletonCard(count = 3) {
  return Array(count).fill(0).map(() => `
    <div class="card">
      <div class="skeleton skeleton-title"></div>
      <div class="skeleton skeleton-text"></div>
      <div class="skeleton skeleton-text" style="width:70%"></div>
    </div>
  `).join('');
}
window.skeletonCard = skeletonCard;

// ── LAZY IMAGE LOADING ──
function initLazyImages() {
  const imgs = document.querySelectorAll('img[data-src]');
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const img = e.target;
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        obs.unobserve(img);
      }
    });
  }, { rootMargin: '100px' });

  imgs.forEach(img => obs.observe(img));
}
window.initLazyImages = initLazyImages;

// ── DEBOUNCE ──
function debounce(fn, delay = 300) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
window.debounce = debounce;

// ── FORMAT HELPERS ──
function formatChecklist(items) {
  if (!items?.length) return '—';
  const done = items.filter(i => i.status).length;
  return `${done}/${items.length} item`;
}
window.formatChecklist = formatChecklist;

function getInitials(name) {
  return name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
}
window.getInitials = getInitials;

// ── RENDER HELPERS ──
function renderEmptyState(icon = '📭', title = 'Tidak ada data', desc = '') {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icon}</div>
      <div class="empty-title">${title}</div>
      ${desc ? `<div class="empty-desc">${desc}</div>` : ''}
    </div>
  `;
}
window.renderEmptyState = renderEmptyState;

function renderTimeline(tasks, isSuper = false) {
  if (!tasks?.length) return renderEmptyState('📋', 'Belum ada pekerjaan', 'Task yang disubmit akan muncul di sini.');

  return `<div class="timeline">` + tasks.map(t => `
    <div class="timeline-item anim-fade-up">
      <div class="timeline-card">
        <div class="timeline-header">
          <span class="timeline-area">📍 ${t.areas?.nama_area || '—'}</span>
          <span class="timeline-time">${DateUtils.formatTime(t.created_at)}</span>
        </div>
        ${isSuper ? `<div class="timeline-user">👤 ${t.users?.nama || '—'}</div>` : ''}
        <div style="font-size:13px;color:var(--text-muted);margin-bottom:6px;">
          ✅ ${formatChecklist(t.task_checklists)}
          ${t.note ? ` · 📝 ${t.note}` : ''}
        </div>
        ${t.task_photos?.length ? `
          <div class="timeline-photos">
            ${t.task_photos.map(p => `
              <img class="timeline-photo"
                   src="${UploadService.getThumbnailUrl(p.photo_url)}"
                   data-full="${p.photo_url}"
                   loading="lazy"
                   onclick="ImageViewer.open('${p.photo_url}')"
                   alt="Foto task">
            `).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `).join('') + `</div>`;
}
window.renderTimeline = renderTimeline;
