import React, { useState, useMemo } from 'react';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: Extract<keyof T, string>;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onCreate?: () => void;
  onRowClick?: (item: T) => void;
  createLabel?: string;
  emptyMessage?: string;
}

export function DataTable<T>({
  data,
  columns,
  onCreate,
  onRowClick,
  createLabel = "Nuevo",
  emptyMessage = "No hay registros disponibles."
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<Extract<keyof T, string> | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: Extract<keyof T, string>) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = useMemo(() => {
    if (!sortKey) return data;
    return [...data].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];
      
      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortOrder]);

  return (
    <div className={styles.container}>
      <div className={styles.toolbar}>
        {onCreate && (
          <button className={styles.createBtn} onClick={onCreate}>
            {createLabel}
          </button>
        )}
      </div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={styles.th}
                  onClick={() => handleSort(col.key)}
                >
                  <div className={styles.thContent}>
                    {col.header}
                    {sortKey === col.key && (
                      <span className={styles.sortIcon}>
                        {sortOrder === 'asc' ? '▲' : '▼'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length > 0 ? (
              sortedData.map((item, index) => (
                <tr 
                  key={index} 
                  className={styles.tr} 
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className={styles.td}>
                      {col.render ? col.render(item) : (item[col.key] as React.ReactNode)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className={styles.emptyState}>
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
