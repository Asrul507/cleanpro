// ============================================
// CLEANPRO — SUPABASE CLIENT
// ============================================

(function () {
  // Load Supabase JS v2 from CDN if not already loaded
  function loadSupabase(cb) {
    if (window.supabase) return cb();
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    s.onload = cb;
    document.head.appendChild(s);
  }

  loadSupabase(function () {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = window.CLEANPRO_CONFIG;
    window.db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    document.dispatchEvent(new Event('supabase-ready'));
  });
})();

// ── Helper: wait for supabase to be ready ──
window.whenReady = function (cb) {
  if (window.db) return cb();
  document.addEventListener('supabase-ready', cb, { once: true });
};
