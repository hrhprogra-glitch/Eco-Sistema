"use client";

import { useEffect, useState } from "react";
import { ModuleLayout } from "@/components/ModuleLayout";
import { getApp } from "@/components/lib/apps";
import { InventarioNav } from "./components/InventarioNav";
import { InventarioResumen } from "./components/InventarioResumen";
import { ProductosCatalog } from "./components/ProductosCatalog";
import { ProductForm } from "./components/ProductForm";
import type { Producto } from "./types";

const app = getApp("inventario")!;

type Vista = "resumen" | "productos" | "form";

export default function InventarioModule() {
  const [products, setProducts] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const [vista, setVista] = useState<Vista>("resumen");
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    const res = await fetch("/api/productos");
    if (res.ok) {
      setProducts(await res.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleCreate = () => {
    setEditingProduct(null);
    setVista("form");
  };

  const handleEdit = (product: Producto) => {
    setEditingProduct(product);
    setVista("form");
  };

  const handleCancel = () => {
    setVista("productos");
    setEditingProduct(null);
  };

  const handleSave = async (productData: Omit<Producto, "id" | "created_at">) => {
    setIsSaving(true);
    const res = editingProduct
      ? await fetch(`/api/productos/${editingProduct.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        })
      : await fetch("/api/productos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(productData),
        });

    if (res.ok) {
      await fetchProducts();
      setVista("productos");
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este producto?")) return;
    setIsSaving(true);
    const res = await fetch(`/api/productos/${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await fetchProducts();
      setVista("productos");
    }
    setIsSaving(false);
  };

  return (
    <ModuleLayout 
      app={app}
      topbarContent={
        <>
          <button 
            className={`topbar_navButton ${vista === 'resumen' ? 'topbar_active' : ''}`}
            onClick={() => setVista('resumen')}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', 
              fontWeight: 500, color: vista === 'resumen' ? 'var(--text-primary)' : 'var(--text-secondary)'
            }}
          >
            Resumen
          </button>
          <button 
            className={`topbar_navButton ${vista === 'productos' || vista === 'form' ? 'topbar_active' : ''}`}
            onClick={() => setVista('productos')}
            style={{ 
              background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', 
              fontWeight: 500, color: (vista === 'productos' || vista === 'form') ? 'var(--text-primary)' : 'var(--text-secondary)',
              marginLeft: '16px'
            }}
          >
            Productos
          </button>
        </>
      }
    >

      {loading ? (
        <div style={{ padding: 32, textAlign: "center", color: "var(--text-secondary)" }}>
          Cargando inventario...
        </div>
      ) : vista === "resumen" ? (
        <InventarioResumen products={products} onVerProductos={() => setVista("productos")} />
      ) : vista === "productos" ? (
        <ProductosCatalog products={products} onCreate={handleCreate} onEdit={handleEdit} />
      ) : (
        <ProductForm
          initialData={editingProduct}
          onSave={handleSave}
          onCancel={handleCancel}
          onDelete={editingProduct ? () => handleDelete(editingProduct.id) : undefined}
          isSaving={isSaving}
        />
      )}
    </ModuleLayout>
  );
}
