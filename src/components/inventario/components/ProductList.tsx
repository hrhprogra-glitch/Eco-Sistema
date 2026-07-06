import React from 'react';
import { DataTable, Column } from '@/components/ui/DataTable';
import type { Producto } from '../types';

interface ProductListProps {
  products: Producto[];
  onCreate: () => void;
  onEdit: (product: Producto) => void;
}

export function ProductList({ products, onCreate, onEdit }: ProductListProps) {
  const columns: Column<Producto>[] = [
    { key: 'nombre', header: 'Nombre' },
    { key: 'sku', header: 'SKU' },
    { 
      key: 'stock', 
      header: 'Stock',
      render: (item) => (
        <span style={{ 
          color: item.stock < 10 ? '#ef4444' : 'inherit',
          fontWeight: item.stock < 10 ? 'bold' : 'normal'
        }}>
          {item.stock}
        </span>
      )
    },
    { 
      key: 'precio', 
      header: 'Precio',
      render: (item) => `$${item.precio.toFixed(2)}`
    }
  ];

  return (
    <DataTable
      data={products}
      columns={columns}
      onCreate={onCreate}
      onRowClick={onEdit}
      createLabel="Nuevo Producto"
      emptyMessage="No hay productos en el inventario."
    />
  );
}
