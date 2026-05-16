// ============================================
// CLEANPRO — LAYOUT COMPONENT
// ============================================

const Layout = {

  // Render sidebar based on role
  renderSidebar(user) {
    const isSuper = user.role === 'supervisor';
    const onShift = AuthService.isOnShift();

    const leaderNav = `
      <a href="/pages/leader/dashboard.html" class="nav-item ${Layout._active('dashboard')}">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Dashboard</span>
      </a>
      <a href="/pages/leader/scan.html" class="nav-item ${Layout._active('scan')} ${!onShift ? 'disabled' : ''}">
        <span class="nav-icon">📷</span>
        <span class="nav-label">Scan Task</span>
      </a>
      <a href="/pages/leader/history.html" class="nav-item ${Layout._active('history')}">
        <span class="nav-icon">📋</span>
        <span class="nav-label">Riwayat Saya</span>
      </a>
      <a href="/pages/leader/profile.html" class="nav-item ${Layout._active('profile')}">
        <span class="nav-icon">👤</span>
        <span class="nav-label">Profile</span>
      </a>
    `;

    const superNav = `
      <div class="nav-section-label">Monitoring</div>
      <a href="/pages/supervisor/dashboard.html" class="nav-item ${Layout._active('dashboard')}">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Dashboard</span>
      </a>
      <a href="/pages/supervisor/scan.html" class="nav-item ${Layout._active('scan')}">
        <span class="nav-icon">📷</span>
        <span class="nav-label">Scan Task</span>
      </a>
      <a href="/pages/supervisor/history.html" class="nav-item ${Layout._active('history')}">
        <span class="nav-icon">📊</span>
        <span class="nav-label">Riwayat Semua</span>
      </a>
      <div class="nav-section-label" style="margin-top:8px">Manajemen</div>
      <a href="/pages/supervisor/users.html" class="nav-item ${Layout._active('users')}">
        <span class="nav-icon">👥</span>
        <span class="nav-label">User Management</span>
      </a>
      <a href="/pages/supervisor/areas.html" class="nav-item ${Layout._active('areas')}">
        <span class="nav-icon">🗺️</span>
        <span class="nav-label">Area & QR</span>
      </a>
      <a href="/pages/supervisor/checklists.html" class="nav-item ${Layout._active('checklists')}">
        <span class="nav-icon">✅</span>
        <span class="nav-label">Checklist</span>
      </a>
      <a href="/pages/supervisor/shifts.html" class="nav-item ${Layout._active('shifts')}">
        <span class="nav-icon">📅</span>
        <span class="nav-label">Jadwal Shift</span>
      </a>
      <div class="nav-section-label" style="margin-top:8px">Laporan</div>
      <a href="/pages/supervisor/report.html" class="nav-item ${Layout._active('report')}">
        <span class="nav-icon">📄</span>
        <span class="nav-label">Export Laporan</span>
      </a>
    `;

    return `
      <div id="sidebarOverlay" class="sidebar-overlay"></div>
      <nav class="sidebar" id="sidebar">
        <div class="sidebar-logo">
          <div class="logo-icon">🧹</div>
          <div class="logo-text">
            CleanPro
            <span>Monitoring System</span>
          </div>
        </div>

        <div class="sidebar-nav">
          ${isSuper ? superNav : leaderNav}
        </div>

        <div class="sidebar-footer">
          <div class="sidebar-user" onclick="window.location.href='/pages/${isSuper ? 'supervisor' : 'leader'}/profile.html'">
            <div class="user-avatar">${getInitials(user.nama)}</div>
            <div class="user-info">
              <div class="user-name">${user.nama}</div>
              <div class="user-role">${isSuper ? 'Supervisor' : 'Leader'} · ${user.shift}</div>
            </div>
          </div>
          <div class="divider"></div>
          <div class="nav-item" onclick="AuthService.logout()" style="color:var(--danger);cursor:pointer">
            <span class="nav-icon">🚪</span>
            <span class="nav-label">Keluar</span>
          </div>
        </div>
      </nav>
    `;
  },

  // Render topbar
  renderTopbar(title, subtitle = '', user) {
    const onShift = AuthService.isOnShift();
    const shiftCfg = window.CLEANPRO_CONFIG?.SHIFTS?.[user?.shift] || {};

    return `
      <header class="topbar" id="topbar">
        <button class="topbar-toggle" onclick="Sidebar.toggle()">☰</button>
        <div class="topbar-breadcrumb">
          ${title}
          ${subtitle ? `<small>${subtitle}</small>` : ''}
        </div>
        <div class="topbar-actions">
          <div class="shift-badge ${onShift ? 'active' : 'inactive'}">
            <div class="shift-badge-dot"></div>
            ${shiftCfg.icon || '⏰'} ${onShift ? 'Sedang Shift' : 'Di Luar Shift'}
          </div>
          <a href="/pages/${user?.role === 'supervisor' ? 'supervisor' : 'leader'}/profile.html" class="topbar-btn">👤</a>
        </div>
      </header>
    `;
  },

  // Inject layout into page
  inject(container, { title, subtitle, pageId, user }) {
    const sidebar = this.renderSidebar(user);
    const topbar  = this.renderTopbar(title, subtitle, user);

    const wrap = document.createElement('div');
    wrap.className = 'app-layout';
    wrap.innerHTML = sidebar + `
      <div class="main-content" id="mainContent">
        ${topbar}
        <main class="page-content" id="pageContent">
          <div id="pageContainer"></div>
        </main>
      </div>
    `;

    document.body.innerHTML = '';
    document.body.appendChild(wrap);

    // Set active nav
    document.querySelectorAll('.nav-item').forEach(el => {
      if (el.href && window.location.href.includes(el.href)) {
        el.classList.add('active');
      }
    });

    Sidebar.init();

    return document.getElementById('pageContainer');
  },

  _active(id) {
    return window.location.href.includes(id) ? 'active' : '';
  }
};

window.Layout = Layout;
