// ============================================
// CLEANPRO — VALIDATION UTILITIES
// ============================================

const Validation = {

  // Validate required fields in a form object
  required(data, fields) {
    const errors = [];
    fields.forEach(f => {
      if (!data[f] || String(data[f]).trim() === '') {
        errors.push(`Field "${f}" wajib diisi.`);
      }
    });
    return errors;
  },

  // Min length
  minLength(value, min, label = 'Field') {
    if (!value || value.length < min) return `${label} minimal ${min} karakter.`;
    return null;
  },

  // Username format: lowercase, no spaces, alphanumeric + underscore
  username(value) {
    if (!value) return 'Username wajib diisi.';
    if (!/^[a-z0-9_]{3,30}$/.test(value)) {
      return 'Username hanya huruf kecil, angka, underscore. 3-30 karakter.';
    }
    return null;
  },

  // Password strength
  password(value) {
    if (!value || value.length < 6) return 'Password minimal 6 karakter.';
    return null;
  },

  // Date range
  dateRange(from, to) {
    if (!from || !to) return 'Tanggal mulai dan akhir wajib diisi.';
    if (new Date(from) > new Date(to)) return 'Tanggal mulai tidak boleh setelah tanggal akhir.';
    return null;
  },

  // Show inline error on input element
  showError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.style.borderColor = 'var(--danger)';
    input.style.boxShadow = '0 0 0 3px rgba(255,107,107,0.2)';

    let err = input.parentNode.querySelector('.field-error');
    if (!err) {
      err = document.createElement('div');
      err.className = 'field-error';
      err.style.cssText = 'color:var(--danger);font-size:12px;margin-top:4px;';
      input.parentNode.appendChild(err);
    }
    err.textContent = message;
  },

  // Clear error on input
  clearError(inputId) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.style.borderColor = '';
    input.style.boxShadow = '';
    const err = input.parentNode.querySelector('.field-error');
    if (err) err.remove();
  },

  // Clear all errors in a container
  clearAll(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.querySelectorAll('.field-error').forEach(e => e.remove());
    container.querySelectorAll('.form-control').forEach(i => {
      i.style.borderColor = '';
      i.style.boxShadow = '';
    });
  }
};

window.Validation = Validation;
