/**
 * Parses simple CSV text into an array of row objects keyed by header.
 * Handles quoted fields (commas/newlines inside quotes, escaped "" quotes).
 */
export function parseCsv(text: string): Record<string, string>[] {
  const rows = parseCsvRows(text.replace(/^﻿/, ''));
  if (rows.length === 0) return [];

  const header = rows[0].map((h) => h.trim().toLowerCase());

  return rows.slice(1).map((row) => {
    const record: Record<string, string> = {};
    header.forEach((key, index) => {
      record[key] = (row[index] ?? '').trim();
    });
    return record;
  });
}

function parseCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\r') {
      continue;
    } else if (char === '\n') {
      row.push(field);
      field = '';
      if (row.some((cell) => cell.trim() !== '')) rows.push(row);
      row = [];
    } else {
      field += char;
    }
  }

  row.push(field);
  if (row.some((cell) => cell.trim() !== '')) rows.push(row);

  return rows;
}
