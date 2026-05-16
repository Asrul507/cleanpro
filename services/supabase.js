// ============================================
// CLEANPRO — SUPABASE CLIENT
// ============================================

(function () {

  // Load Supabase JS v2 from CDN
  function loadSupabase(cb) {
    if (window.supabase) return cb();

    const s = document.createElement('script');

    s.src =
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

    s.onload = cb;

    document.head.appendChild(s);
  }

  loadSupabase(function () {

    // Ambil config dari config.js
    const {
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    } = window.CLEANPRO_CONFIG;

    // Validasi config
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      console.error('Supabase config missing!');
      return;
    }

    // Create Supabase client
    window.db = window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY
    );

    console.log('Supabase connected');
    console.log(window.db);

    // Trigger ready event
    document.dispatchEvent(
      new Event('supabase-ready')
    );

  });

})();

// ============================================
// Helper: wait until Supabase ready
// ============================================

window.whenReady = function (cb) {

  if (window.db) {
    return cb();
  }

  document.addEventListener(
    'supabase-ready',
    cb,
    { once: true }
  );

};
