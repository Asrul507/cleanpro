// ============================================
// CLEANPRO — QR SERVICE
// ============================================

const QRService = {

  // Generate unique QR code string for an area
  generate(prefix = 'QR') {
    const ts   = Date.now().toString(36).toUpperCase();
    const rand = Math.random().toString(36).substr(2, 5).toUpperCase();
    return `${prefix}-${ts}-${rand}`;
  },

  // Render QR into a DOM element (requires qrcodejs loaded)
  render(elementId, text, size = 180) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = '';

    if (typeof QRCode === 'undefined') {
      // Lazy-load qrcodejs
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
      s.onload = () => {
        new QRCode(el, {
          text,
          width: size,
          height: size,
          colorDark: '#000000',
          colorLight: '#ffffff',
          correctLevel: QRCode.CorrectLevel.H
        });
      };
      document.head.appendChild(s);
    } else {
      new QRCode(el, {
        text,
        width: size,
        height: size,
        colorDark: '#000000',
        colorLight: '#ffffff',
        correctLevel: QRCode.CorrectLevel.H
      });
    }
  },

  // Download QR canvas as PNG
  download(elementId, filename = 'qr-code') {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const canvas = document.querySelector(`#${elementId} canvas`);
        if (!canvas) { reject(new Error('Canvas not found')); return; }
        const link = document.createElement('a');
        link.href     = canvas.toDataURL('image/png');
        link.download = `${filename}.png`;
        link.click();
        resolve();
      }, 300);
    });
  },

  // Get data URL of QR canvas
  getDataURL(elementId) {
    const canvas = document.querySelector(`#${elementId} canvas`);
    return canvas ? canvas.toDataURL('image/png') : null;
  }
};

window.QRService = QRService;
