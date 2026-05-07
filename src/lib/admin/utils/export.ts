// ─── CSV / Excel Export Utility ─────────────────────────────────────
// Generic export utility used across all admin report and table pages.

export interface ExportColumn<T> {
  header: string;
  accessor: keyof T | ((row: T) => string | number);
}

/**
 * Export data to CSV and trigger download.
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string = 'export',
): void => {
  if (data.length === 0) return;

  const headers = columns.map(c => `"${c.header}"`).join(',');
  const rows = data.map(row =>
    columns.map(col => {
      const value = typeof col.accessor === 'function'
        ? col.accessor(row)
        : row[col.accessor];
      // Escape double quotes in CSV
      const str = String(value ?? '').replace(/"/g, '""');
      return `"${str}"`;
    }).join(',')
  );

  const csv = [headers, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Filter data by date range.
 */
export const filterByDateRange = <T extends Record<string, any>>(
  data: T[],
  dateField: keyof T,
  startDate?: string,
  endDate?: string,
): T[] => {
  return data.filter(item => {
    const d = String(item[dateField]);
    if (startDate && d < startDate) return false;
    if (endDate && d > endDate) return false;
    return true;
  });
};

/**
 * Format a date string to locale display.
 */
export const formatDate = (dateStr: string, format: 'short' | 'long' = 'short'): string => {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: format === 'long' ? 'long' : 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// Alias for case-insensitive compat (many consumers import as exportToCsv)
export const exportToCsv = exportToCSV;
