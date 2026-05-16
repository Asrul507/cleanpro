// ============================================
// CLEANPRO — TASK SERVICE
// ============================================

const TaskService = {

  // Submit task with checklist + photos
  async submitTask({ userId, areaId, note, checklistItems, photoFiles }) {
    return new Promise((resolve) => {
      whenReady(async () => {
        try {
          // 1. Create task record
          const { data: task, error: taskErr } = await window.db
            .from('tasks')
            .insert({ user_id: userId, area_id: areaId, note, waktu: new Date().toISOString() })
            .select()
            .single();

          if (taskErr) throw taskErr;

          // 2. Save checklist items
          if (checklistItems?.length) {
            const checkRows = checklistItems.map(item => ({
              task_id: task.id,
              checklist_id: item.id,
              status: item.checked
            }));
            await window.db.from('task_checklists').insert(checkRows);
          }

          // 3. Upload photos
          if (photoFiles?.length) {
            const uploads = await UploadService.uploadPhotos(photoFiles, userId);
            const photoRows = uploads.map(u => ({
              task_id: task.id,
              photo_url: u.url,
              photo_path: u.path
            }));
            await window.db.from('task_photos').insert(photoRows);
          }

          resolve({ success: true, task });
        } catch (e) {
          resolve({ success: false, message: e.message });
        }
      });
    });
  },

  // Get tasks for current user (leader)
  async getMyTasks(userId, { date, limit = 20, offset = 0 } = {}) {
    return new Promise((resolve) => {
      whenReady(async () => {
        let q = window.db
          .from('tasks')
          .select(`
            *,
            areas(id, nama_area, kategori),
            task_photos(id, photo_url),
            task_checklists(id, status, checklists(item_checklist))
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (date) {
          const start = `${date}T00:00:00`;
          const end   = `${date}T23:59:59`;
          q = q.gte('created_at', start).lte('created_at', end);
        }

        const { data, error } = await q;
        resolve({ data: data || [], error });
      });
    });
  },

  // Get all tasks (supervisor)
  async getAllTasks({ date, userId, areaId, limit = 20, offset = 0 } = {}) {
    return new Promise((resolve) => {
      whenReady(async () => {
        let q = window.db
          .from('tasks')
          .select(`
            *,
            users(id, nama, username),
            areas(id, nama_area, kategori),
            task_photos(id, photo_url),
            task_checklists(id, status, checklists(item_checklist))
          `)
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        if (date) {
          q = q.gte('created_at', `${date}T00:00:00`).lte('created_at', `${date}T23:59:59`);
        }
        if (userId) q = q.eq('user_id', userId);
        if (areaId) q = q.eq('area_id', areaId);

        const { data, error } = await q;
        resolve({ data: data || [], error });
      });
    });
  },

  // Get today's task count for user
  async getTodayCount(userId) {
    return new Promise((resolve) => {
      whenReady(async () => {
        const today = new Date().toISOString().split('T')[0];
        const { count } = await window.db
          .from('tasks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .gte('created_at', `${today}T00:00:00`);
        resolve(count || 0);
      });
    });
  },

  // Get area checklist
  async getAreaChecklist(areaId) {
    return new Promise((resolve) => {
      whenReady(async () => {
        const { data, error } = await window.db
          .from('checklists')
          .select('*')
          .eq('area_id', areaId);
        resolve({ data: data || [], error });
      });
    });
  },

  // Get area by QR code
  async getAreaByQR(qrCode) {
    return new Promise((resolve) => {
      whenReady(async () => {
        const { data, error } = await window.db
          .from('areas')
          .select('*')
          .eq('qr_code', qrCode)
          .single();
        resolve({ data, error });
      });
    });
  },

  // Get all areas
  async getAreas() {
    return new Promise((resolve) => {
      whenReady(async () => {
        const { data } = await window.db.from('areas').select('*').order('nama_area');
        resolve(data || []);
      });
    });
  },

  // Realtime subscription for new tasks
  subscribeToTasks(callback) {
    const channel = window.db
      .channel('tasks-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, callback)
      .subscribe();
    return channel;
  },

  // Stats for supervisor dashboard
  async getDashboardStats() {
    return new Promise((resolve) => {
      whenReady(async () => {
        const today = new Date().toISOString().split('T')[0];

        const [{ count: totalToday }, { count: totalUsers }, areas] = await Promise.all([
          window.db.from('tasks').select('*', { count: 'exact', head: true })
            .gte('created_at', `${today}T00:00:00`),
          window.db.from('users').select('*', { count: 'exact', head: true })
            .eq('active', true).eq('role', 'leader'),
          window.db.from('areas').select('id'),
        ]);

        // Areas checked today
        const { data: checkedAreas } = await window.db
          .from('tasks')
          .select('area_id')
          .gte('created_at', `${today}T00:00:00`);

        const checkedIds = [...new Set((checkedAreas || []).map(t => t.area_id))];

        resolve({
          totalToday: totalToday || 0,
          totalUsers: totalUsers || 0,
          totalAreas: areas?.length || 0,
          checkedAreas: checkedIds.length,
          uncheckedAreas: (areas?.length || 0) - checkedIds.length,
        });
      });
    });
  }
};

window.TaskService = TaskService;
