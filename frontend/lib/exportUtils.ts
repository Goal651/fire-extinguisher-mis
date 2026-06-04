// ── CSV ───────────────────────────────────────────────────────────────────────

type Row = Record<string, string | number | null | undefined>;

function escapeCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  // Wrap in quotes if it contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportCSV(filename: string, rows: Row[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => escapeCell(row[h])).join(",")),
  ];
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ── PDF (print) ───────────────────────────────────────────────────────────────

export function exportPDF(title: string, html: string): void {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) return;

  win.document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 12px;
      color: #2f2f2f;
      padding: 32px 40px;
    }
    h1 { font-size: 18px; font-weight: 700; margin-bottom: 4px; }
    .meta { font-size: 11px; color: #666; margin-bottom: 24px; }
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #999;
      margin: 24px 0 8px;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 24px;
    }
    .kpi {
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      padding: 12px;
      background: #fafafa;
    }
    .kpi-label { font-size: 9px; text-transform: uppercase; letter-spacing: .05em; color: #999; }
    .kpi-value { font-size: 22px; font-weight: 700; margin-top: 4px; color: #2f2f2f; }
    table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 8px; }
    thead th {
      text-align: left;
      padding: 6px 8px;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: .04em;
      color: #666;
      border-bottom: 2px solid #e0e0e0;
    }
    tbody td { padding: 7px 8px; border-bottom: 1px solid #f0f0f0; }
    tbody tr:last-child td { border-bottom: none; }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 10px;
      font-weight: 600;
    }
    .footer {
      margin-top: 32px;
      font-size: 10px;
      color: #aaa;
      border-top: 1px solid #e0e0e0;
      padding-top: 12px;
    }
    @media print {
      body { padding: 16px 20px; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p class="meta">Generated on ${new Date().toLocaleString()}</p>
  ${html}
  <div class="footer">FireGuard &mdash; Confidential Report</div>
  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`);
  win.document.close();
}

// ── Helpers to build PDF HTML sections ───────────────────────────────────────

export function kpiHtml(items: { label: string; value: string | number }[]): string {
  return `
<div class="kpi-grid">
  ${items
    .map(
      (k) => `
  <div class="kpi">
    <div class="kpi-label">${k.label}</div>
    <div class="kpi-value">${k.value ?? "—"}</div>
  </div>`,
    )
    .join("")}
</div>`;
}

export function tableHtml(headers: string[], rows: (string | number | null | undefined)[][]): string {
  return `
<table>
  <thead>
    <tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>
  </thead>
  <tbody>
    ${rows
      .map(
        (row) =>
          `<tr>${row.map((cell) => `<td>${cell ?? "—"}</td>`).join("")}</tr>`,
      )
      .join("")}
  </tbody>
</table>`;
}
