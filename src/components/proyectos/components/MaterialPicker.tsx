import { useEffect, useRef, useState } from "react";
import { Package, Plus, Search } from "lucide-react";

export type PickerProducto = {
  id: string;
  nombre: string;
  sku?: string | null;
  categoria?: string | null;
  stock: number;
  precio: number;
  foto_url?: string | null;
};

export function MaterialPicker({
  onAddProducto,
  onAddExterno,
}: {
  onAddProducto: (producto: PickerProducto) => void;
  onAddExterno: (nombre: string, cantidad: number, justificacion: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [productos, setProductos] = useState<PickerProducto[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const [showExternalForm, setShowExternalForm] = useState(false);
  const [extNombre, setExtNombre] = useState("");
  const [extCantidad, setExtCantidad] = useState("1");
  const [extFactura, setExtFactura] = useState("");

  useEffect(() => {
    const term = search.trim();
    if (!term) {
      setProductos([]);
      setSearchLoading(false);
      return;
    }
    setSearchLoading(true);
    const timeout = setTimeout(() => {
      fetch(`/api/productos?q=${encodeURIComponent(term)}`)
        .then((res) => res.json())
        .then((data) => {
          setProductos(Array.isArray(data) ? data : []);
          setHighlighted(0);
        })
        .finally(() => setSearchLoading(false));
    }, 250);
    return () => clearTimeout(timeout);
  }, [search]);

  const pick = (producto: PickerProducto) => {
    onAddProducto(producto);
    setSearch("");
    setProductos([]);
    searchRef.current?.focus();
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (productos.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((prev) => Math.min(prev + 1, productos.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const producto = productos[highlighted];
      if (producto) pick(producto);
    } else if (e.key === "Escape") {
      setSearch("");
    }
  };

  const submitExterno = () => {
    const cantidad = Number(extCantidad);
    if (!extNombre || !cantidad || cantidad <= 0 || !extFactura) {
      alert("Completa nombre, cantidad y N° de factura del producto externo.");
      return;
    }
    onAddExterno(extNombre, cantidad, extFactura);
    setExtNombre("");
    setExtCantidad("1");
    setExtFactura("");
    setShowExternalForm(false);
  };

  return (
    <>
      <div style={{ position: "relative" }}>
        <Search size={16} style={{ position: "absolute", left: "10px", top: "9px", color: "var(--text-secondary)" }} />
        <input
          ref={searchRef}
          type="text"
          autoFocus
          placeholder="Buscar en inventario... (↑↓ Enter)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          style={{
            width: "100%",
            padding: "8px 8px 8px 32px",
            border: "1px solid var(--border-color)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
          }}
        />
      </div>

      <button
        type="button"
        onClick={() => setShowExternalForm(!showExternalForm)}
        style={{
          marginTop: "10px",
          width: "100%",
          padding: "8px",
          background: showExternalForm ? "var(--bg-surface)" : "rgba(2, 132, 199, 0.1)",
          color: "var(--eco-azul)",
          border: "1px dashed var(--eco-azul)",
          cursor: "pointer",
          fontWeight: 600,
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
        }}
      >
        <Plus size={16} /> {showExternalForm ? "Cancelar ingreso externo" : "Ingresar producto externo"}
      </button>

      {showExternalForm ? (
        <div
          style={{
            marginTop: "12px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            background: "var(--bg-surface)",
            padding: "16px",
            border: "1px solid var(--border-color)",
          }}
        >
          <input
            type="text"
            placeholder="Nombre del producto"
            value={extNombre}
            onChange={(e) => setExtNombre(e.target.value)}
            style={{ padding: "8px", border: "1px solid var(--border-color)", background: "var(--bg-page)", color: "var(--text-primary)" }}
          />
          <input
            type="number"
            min={1}
            placeholder="Cantidad"
            value={extCantidad}
            onChange={(e) => setExtCantidad(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submitExterno())}
            style={{ padding: "8px", border: "1px solid var(--border-color)", background: "var(--bg-page)", color: "var(--text-primary)" }}
          />
          <input
            type="text"
            placeholder="N° Factura / Justificación"
            value={extFactura}
            onChange={(e) => setExtFactura(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), submitExterno())}
            style={{ padding: "8px", border: "1px solid var(--border-color)", background: "var(--bg-page)", color: "var(--text-primary)" }}
          />
          <button
            type="button"
            onClick={submitExterno}
            style={{ padding: "8px", background: "var(--accent-strong)", color: "white", border: "none", fontWeight: 600, cursor: "pointer" }}
          >
            Agregar al carrito
          </button>
        </div>
      ) : searchLoading ? (
        <div style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "16px" }}>Buscando...</div>
      ) : search.trim() === "" ? (
        <div
          style={{
            marginTop: "16px",
            padding: "24px",
            textAlign: "center",
            color: "var(--text-secondary)",
            fontSize: "13px",
            border: "1px dashed var(--border-color)",
          }}
        >
          Escribe el nombre o SKU del material para buscarlo.
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(128px, 1fr))", gap: "8px", marginTop: "16px" }}>
          {productos.map((p, i) => (
            <div
              key={p.id}
              onClick={() => pick(p)}
              onMouseEnter={() => setHighlighted(i)}
              style={{
                background: i === highlighted ? "rgba(2, 132, 199, 0.08)" : "var(--bg-surface)",
                border: i === highlighted ? "2px solid var(--eco-azul)" : "1px solid var(--border-color)",
                padding: i === highlighted ? "7px" : "8px",
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  background: "var(--bg-page)",
                  marginBottom: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundImage: p.foto_url ? `url(${p.foto_url})` : "none",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  color: "var(--text-secondary)",
                }}
              >
                {!p.foto_url && <Package size={22} opacity={0.5} />}
              </div>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "12px",
                  color: "var(--text-primary)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {p.nombre}
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "2px" }}>
                <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--eco-azul)" }}>S/ {p.precio.toFixed(2)}</span>
                <span style={{ fontSize: "10px", color: p.stock > 0 ? "var(--text-secondary)" : "#ef4444" }}>Stock {p.stock}</span>
              </div>
            </div>
          ))}
          {productos.length === 0 && (
            <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "24px", color: "var(--text-secondary)", fontSize: "13px" }}>
              No se encontraron materiales.
            </div>
          )}
        </div>
      )}
    </>
  );
}
