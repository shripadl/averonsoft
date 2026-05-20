/**
 * Injected into resume HTML for Chromium/Puppeteer PDF — vector output, no raster clipping.
 * Screen preview stays unchanged; only @media print applies these rules when PDF is generated.
 *
 * Important: avoid `break-inside: avoid` on entire `section` — large sections get clipped at page edges.
 * Keep skill **grids** as grids in print so cells are not squeezed.
 */
export const RESUME_PRINT_CSS = `
@media print {
  @page {
    size: A4;
    margin: 20mm;
  }

  html, body {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    overflow: visible !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    background: #ffffff !important;
  }

  .skills-grid {
    display: grid !important;
    grid-template-columns: repeat(3, minmax(72px, 1fr)) !important;
    gap: 8px !important;
    break-inside: auto !important;
    page-break-inside: auto !important;
  }

  .skills-grid .skill-cell {
    min-height: 0 !important;
    overflow: visible !important;
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  .edu-grid {
    display: grid !important;
    grid-template-columns: repeat(2, minmax(120px, 1fr)) !important;
    gap: 12px !important;
    break-inside: auto !important;
    page-break-inside: auto !important;
  }

  .edu-grid .edu-card {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }

  .layout,
  .top,
  .main {
    display: block !important;
    min-height: 0 !important;
    height: auto !important;
    max-height: none !important;
    overflow: visible !important;
  }

  main.resume-root,
  main {
    display: block !important;
    min-height: 0 !important;
    max-width: 100% !important;
    overflow: visible !important;
  }

  section.sec,
  .sec-body {
    break-inside: auto !important;
    page-break-inside: auto !important;
  }

  .chip,
  .skill-row {
    break-inside: avoid-page !important;
    page-break-inside: avoid !important;
  }

  .tl-item,
  .exp-item,
  .edu-item,
  .edu-card,
  article.card,
  .tl-body {
    break-inside: avoid-page !important;
    page-break-inside: avoid !important;
  }

  section.sec > h2,
  h1, h2, h3 {
    break-after: avoid !important;
    page-break-after: avoid !important;
  }

  p, li {
    orphans: 2;
    widows: 2;
  }

  ul, ol {
    break-inside: auto !important;
    page-break-inside: auto !important;
  }
}

@media screen {
  body.resume-pdf-debug {
    background: repeating-linear-gradient(
      to bottom,
      rgba(59, 130, 246, 0.06),
      rgba(59, 130, 246, 0.06) 1122px,
      rgba(239, 68, 68, 0.14) 1122px,
      rgba(239, 68, 68, 0.14) 1124px
    ) !important;
    background-size: 100% 1124px !important;
  }
}
`;
