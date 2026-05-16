// ============================================
// CLEANPRO — AUTH SERVICE
// ============================================

const AuthService = {

  getSession() {
    const s = sessionStorage.getItem('cp_session') || localStorage.getItem('cp_session');
    return s ? JSON.parse(s) : null;
  },

  isAuthenticated() { return !!this.getSession(); },

  getUser() { return this.getSession(); },

  isOnShift() {
    const session = this.getSession();
    if (!session) return false;
    const shifts = window.CLEANPRO_CONFIG?.SHIFTS || {};
    const sc = shifts[session.shift];
    if (!sc) return false;
    const now = new Date();
    const nowM = now.getHours() * 60 + now.getMinutes();
    const [sh, sm] = sc.start.split(':').map(Number);
    const [eh, em] = sc.end.split(':').map(Number);
    const sM = sh * 60 + sm, eM = eh * 60 + em;
    return sM > eM ? (nowM >= sM || nowM < eM) : (nowM >= sM && nowM < eM);
  },

  async login(username, password, shift) {
    return new Promise((resolve) => {
      whenReady(async () => {
        try {
          const { data, error } = await window.db
            .from('users')
            .select('id, nama, username, role, active, password')
            .eq('username', username.toLowerCase())
            .eq('active', true)
            .single();

          if (error || !data) {
            resolve({ success: false, message: 'Username tidak ditemukan atau tidak aktif.' });
            return;
          }

          if (data.password !== password) {
            resolve({ success: false, message: 'Password salah.' });
            return;
          }

          resolve({
            success: true,
            user: { id: data.id, nama: data.nama, username: data.username, role: data.role, shift }
          });
        } catch (e) {
          resolve({ success: false, message: 'Koneksi gagal.' });
        }
      });
    });
  },

  logout() {
    sessionStorage.removeItem('cp_session');
    localStorage.removeItem('cp_session');
    window.location.href = '/login.html';
  },

  requireAuth(role = null) {
    const user = this.getUser();
    if (!user) { window.location.href = '/login.html'; return null; }
    if (role && user.role !== role) { window.location.href = '/login.html'; return null; }
    return user;
  },

  async changePassword(userId, oldPass, newPass) {
    return new Promise((resolve) => {
      whenReady(async () => {
        const { data, error } = await window.db
          .from('users').select('password').eq('id', userId).single();
        if (error || data.password !== oldPass) {
          resolve({ success: false, message: 'Password lama salah.' }); return;
        }
        const { error: e2 } = await window.db
          .from('users').update({ password: newPass }).eq('id', userId);
        resolve(e2 ? { success: false, message: 'Gagal update.' } : { success: true });
      });
    });
  }
};

window.AuthService = AuthService;
