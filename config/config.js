// ============================================
// CLEANPRO — CONFIG
// ============================================
// Ganti dengan credentials Supabase Anda
// Jangan commit file ini dengan key nyata ke public repo

window.CLEANPRO_CONFIG = {
  SUPABASE_URL: 'https://YOUR_PROJECT_ID.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR_SUPABASE_ANON_KEY',
  APP_NAME: 'CleanPro',
  APP_VERSION: '1.0.0',
  STORAGE_BUCKET: 'task-photos',

  // Shift times (24h format)
  SHIFTS: {
    pagi:  { start: '07:00', end: '15:00', label: 'Pagi',  icon: '🌅' },
    siang: { start: '15:00', end: '23:00', label: 'Siang', icon: '☀️' },
    malam: { start: '23:00', end: '07:00', label: 'Malam', icon: '🌙' },
  },

  // Image upload limits
  IMAGE: {
    MAX_PER_TASK: 2,
    MAX_SIZE_MB: 5,
    MAX_WIDTH: 1280,
    QUALITY: 0.65,
    FORMAT: 'image/webp',
  },

  // Pagination
  PAGE_SIZE: 20,
};
