import React, { useState, useMemo, useEffect } from 'react';
import styles from './DataTable.module.css';

export interface Column<T> {
  key: Extract<keyof T, string>;
  header: string;
  render?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (item: T) => void;
  isRowSelected?: (item: T) => boolean;
  emptyMessage?: string;
  onCreate?: () => void;
  createLabel?: string;
  pageSize?: number;
}

const DEFAULT_PAGE_SIZE = 50;

export function DataTable<T>({
  data,
  columns,
  onRowClick,
  isRowSelected,
  emptyMessage = "No hay registros disponibles.",
  onCreate,
  createLabel = "Nuevo",
  pageSize = DEFAULT_PAGE_SIZE,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<Extract<keyof T, string> | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [data]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageData = sortedData.slice(startIndex, startIndex + pageSize);

  const paginationControls = sortedData.length > 0 && (
    <div className={styles.paginationGroup}>
      <span className={styles.pageInfo}>
        {startIndex + 1}–{Math.min(startIndex + pageSize, sortedData.length)} de {sortedData.length}
      </span>
      <div className={styles.pageButtons}>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => setPage(currentPage - 1)}
          disabled={currentPage <= 1}
        >
          Anterior
        </button>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => setPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.container}>
      {(onCreate || sortedData.length > 0) && (
        <div className={styles.toolbar}>
          {onCreate ? (
            <button type="button" className={styles.createBtn} onClick={onCreate}>
              {createLabel}
            </button>
          ) : (
            <span />
          )}
          {paginationControls}
        </div>
      )}
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
            {pageData.length > 0 ? (
              pageData.map((item, index) => (
                <tr
                  key={index}
                  className={styles.tr}
                  data-selected={isRowSelected?.(item) ? "" : undefined}
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
      {paginationControls && <div className={styles.pagination}>{paginationControls}</div>}
    </div>
  );
}
