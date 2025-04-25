import React, { useRef } from 'react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const PdfLibDemo: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle PDF upload and annotate
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const arrayBuffer = await file.arrayBuffer();

    // 1. Load the existing PDF
    const pdfDoc = await PDFDocument.load(arrayBuffer);

    // 2. Embed a font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // 3. Get the first page and annotate
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    firstPage.drawText('Edited with pdf-lib!', {
      x: 50,
      y: 50,
      size: 24,
      font,
      color: rgb(0.02, 0.27, 0.59), // Brand Primary Blue
    });

    // 4. Save and trigger download
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'edited.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ padding: 32, fontFamily: 'Poppins, sans-serif', background: '#FFF' }}>
      <h1 style={{ color: '#054697' }}>PDF-lib Demo</h1>
      <p style={{ color: 'rgba(5, 70, 151, 0.8)' }}>
        Upload a PDF and annotate it with <b>pdf-lib</b>.
      </p>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handlePdfUpload}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        style={{
          background: '#FFE8E4',
          color: '#054697',
          border: '1px solid #B8BDD7',
          borderRadius: 6,
          padding: '12px 28px',
          fontSize: 18,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'Poppins, sans-serif',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => (e.currentTarget.style.background = '#FFD5CC')}
        onMouseOut={e => (e.currentTarget.style.background = '#FFE8E4')}
      >
        Upload and Annotate PDF
      </button>
    </div>
  );
};

export default PdfLibDemo;
