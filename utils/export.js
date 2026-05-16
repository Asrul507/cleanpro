// ============================================
// CLEANPRO — EXPORT SERVICE
// ============================================

const ExportService = {

  // Load jsPDF
  async loadJsPDF() {
    if (window.jspdf) return;
    await new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      s.onload = resolve;
      document.head.appendChild(s);
    });
  },

  // Load SheetJS
  async loadXLSX() {
    if (window.XLSX) return;
    await new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.sheetjs.com/xlsx-0.20.1/package/dist/xlsx.full.min.js';
      s.onload = resolve;
      document.head.appendChild(s);
    });
  },

  // Export to Excel
  async toExcel(tasks, filename = 'laporan-cleanpro') {
    await this.loadXLSX();
    Toast.info('Membuat file Excel...');

    const rows = tasks.map(t => ({
      'Tanggal': DateUtils.formatDate(t.created_at),
      'Jam': DateUtils.formatTime(t.created_at),
      'Nama': t.users?.nama || '—',
      'Username': t.users?.username || '—',
      'Area': t.areas?.nama_area || '—',
      'Kategori': t.areas?.kategori || '—',
      'Checklist': formatChecklist(t.task_checklists),
      'Note': t.note || '—',
      'Jumlah Foto': t.task_photos?.length || 0,
    }));

    const ws = XLSX.utils.json_to_sheet(rows);

    // Column widths
    ws['!cols'] = [
      { wch: 14 }, { wch: 8 }, { wch: 20 }, { wch: 14 },
      { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 30 }, { wch: 10 }
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan');
    XLSX.writeFile(wb, `${filename}-${DateUtils.today()}.xlsx`);
    Toast.success('File Excel berhasil diunduh!');
  },

  // Export to PDF
  async toPDF(tasks, filename = 'laporan-cleanpro', title = 'Laporan Aktivitas Cleaning Service') {
    await this.loadJsPDF();
    Toast.info('Membuat file PDF...');

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

    // Header
    doc.setFillColor(13, 18, 32);
    doc.rect(0, 0, 297, 297, 'F');

    doc.setFontSize(20);
    doc.setTextColor(0, 212, 170);
    doc.text('CleanPro', 14, 18);

    doc.setFontSize(13);
    doc.setTextColor(240, 244, 255);
    doc.text(title, 14, 26);

    doc.setFontSize(9);
    doc.setTextColor(136, 150, 179);
    doc.text(`Digenerate: ${DateUtils.formatDateTime(new Date().toISOString())}`, 14, 33);

    // Table header
    const headers = ['Tanggal', 'Jam', 'Nama', 'Area', 'Checklist', 'Note'];
    const colWidths = [30, 18, 45, 40, 28, 100];
    let y = 44;

    doc.setFillColor(26, 34, 53);
    doc.rect(14, y - 5, 269, 8, 'F');

    doc.setFontSize(8);
    doc.setTextColor(0, 212, 170);
    let x = 14;
    headers.forEach((h, i) => {
      doc.text(h, x + 2, y);
      x += colWidths[i];
    });

    y += 6;
    doc.setTextColor(200, 210, 230);

    tasks.forEach((t, idx) => {
      if (y > 185) {
        doc.addPage();
        y = 20;
      }

      if (idx % 2 === 0) {
        doc.setFillColor(18, 24, 38);
        doc.rect(14, y - 4, 269, 7, 'F');
      }

      const row = [
        DateUtils.formatDate(t.created_at),
        DateUtils.formatTime(t.created_at),
        t.users?.nama || '—',
        t.areas?.nama_area || '—',
        formatChecklist(t.task_checklists),
        (t.note || '—').substring(0, 50),
      ];

      x = 14;
      doc.setFontSize(8);
      row.forEach((cell, i) => {
        doc.text(String(cell), x + 2, y);
        x += colWidths[i];
      });

      y += 7;
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let p = 1; p <= pageCount; p++) {
      doc.setPage(p);
      doc.setFontSize(7);
      doc.setTextColor(74, 85, 104);
      doc.text(`Halaman ${p} dari ${pageCount} — CleanPro © ${new Date().getFullYear()}`, 14, 200);
    }

    doc.save(`${filename}-${DateUtils.today()}.pdf`);
    Toast.success('File PDF berhasil diunduh!');
  }
};

window.ExportService = ExportService;
