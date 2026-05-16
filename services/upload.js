// ============================================
// CLEANPRO — UPLOAD SERVICE (Image Compression)
// ============================================

const UploadService = {

  // Compress & resize image to WebP
  async compressImage(file) {
    const cfg = window.CLEANPRO_CONFIG.IMAGE;

    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);

        // Calculate dimensions
        let { width, height } = img;
        const maxW = cfg.MAX_WIDTH;
        if (width > maxW) {
          height = Math.round((height * maxW) / width);
          width = maxW;
        }

        // Draw to canvas
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) { reject(new Error('Compress failed')); return; }
            resolve(blob);
          },
          cfg.FORMAT,
          cfg.QUALITY
        );
      };
      img.onerror = reject;
      img.src = url;
    });
  },

  // Validate file before upload
  validateFile(file) {
    const cfg = window.CLEANPRO_CONFIG.IMAGE;
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowed.includes(file.type)) {
      return { valid: false, message: 'Format harus JPG, PNG, atau WebP.' };
    }
    if (file.size > cfg.MAX_SIZE_MB * 1024 * 1024) {
      return { valid: false, message: `Ukuran max ${cfg.MAX_SIZE_MB}MB.` };
    }
    return { valid: true };
  },

  // Upload single photo to Supabase Storage
  async uploadPhoto(file, userId) {
    const validation = this.validateFile(file);
    if (!validation.valid) throw new Error(validation.message);

    // Compress
    const compressed = await this.compressImage(file);

    // Build path: /task-photos/YYYY/MM/DD/userId/timestamp.webp
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const ts = Date.now();
    const path = `${year}/${month}/${day}/${userId}/${ts}.webp`;

    const { data, error } = await window.db.storage
      .from(window.CLEANPRO_CONFIG.STORAGE_BUCKET)
      .upload(path, compressed, {
        contentType: 'image/webp',
        cacheControl: '3600',
        upsert: false,
      });

    if (error) throw new Error('Upload gagal: ' + error.message);

    // Get public URL
    const { data: urlData } = window.db.storage
      .from(window.CLEANPRO_CONFIG.STORAGE_BUCKET)
      .getPublicUrl(path);

    return { path, url: urlData.publicUrl };
  },

  // Upload multiple photos
  async uploadPhotos(files, userId) {
    const max = window.CLEANPRO_CONFIG.IMAGE.MAX_PER_TASK;
    const filesToUpload = Array.from(files).slice(0, max);

    const results = [];
    for (const file of filesToUpload) {
      const r = await this.uploadPhoto(file, userId);
      results.push(r);
    }
    return results;
  },

  // Create thumbnail URL (via Supabase transform)
  getThumbnailUrl(originalUrl) {
    if (!originalUrl) return '';
    // Supabase image transformations
    return originalUrl.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/') + '?width=200&quality=70';
  },

  // Delete photo from storage
  async deletePhoto(path) {
    const { error } = await window.db.storage
      .from(window.CLEANPRO_CONFIG.STORAGE_BUCKET)
      .remove([path]);
    return !error;
  }
};

window.UploadService = UploadService;
