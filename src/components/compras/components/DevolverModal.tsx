"use client";

import { useState, useRef, useEffect } from "react";
import { X, Plus, Trash2 } from "lucide-react";
import type { Entrada } from "@/components/movimientos/types";
import fieldStyles from "@/components/ui/formFields.module.css";
import styles from "./EntradaForm.module.css";

const modalStyles = `
  @keyframes modalAppear {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-20px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  .devolver-modal {
    animation: modalAppear 0.3s ease-out;
  }
`;

export function DevolverModal({
  entrada,
  onClose,
  onSuccess,
}: {
  entrada: Entrada;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const modalRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!modalRef.current) return;
    const rect = modalRef.current.getBoundingClientRect();
    setIsDragActive(true);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    // Inicializar posición al primer drag
    if (position === null) {
      setPosition({
        x: rect.left,
        y: rect.top,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || position === null) return;
    setPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const [lineasSeleccionadas, setLineasSeleccionadas] = useState<
    Array<{
      entrada_linea_id: string;
      producto_id: string;
      producto_nombre: string;
      cantidad: number;
      cantidad_devuelta: number;
      cantidad_disponible: number;
      costo_unitario: number;
      almacen_id: string;
    }>
  >(
    entrada.lineas?.map((l: any) => ({
      entrada_linea_id: l.id,
      producto_id: l.producto_id,
      producto_nombre: l.producto_nombre || "",
      cantidad: l.cantidad,
      cantidad_devuelta: 0,
      cantidad_disponible: l.cantidad_disponible || l.cantidad,
      costo_unitario: l.costo_unitario,
      almacen_id: l.almacen_id,
    })) || []
  );

  const [notas, setNotas] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalDevolucion = lineasSeleccionadas.reduce(
    (sum, l) => sum + l.cantidad_devuelta * l.costo_unitario,
    0
  );

  async function guardarDevolucion() {
    const lineasADevolver = lineasSeleccionadas.filter((l) => l.cantidad_devuelta > 0);
    if (lineasADevolver.length === 0) {
      setError("Selecciona al menos un producto para devolver");
      return;
    }

    // Validar que no se devuelva más de lo disponible
    for (const linea of lineasADevolver) {
      if (linea.cantidad_devuelta > linea.cantidad_disponible) {
        setError(
          `No puedes devolver ${linea.cantidad_devuelta} unidades de "${linea.producto_nombre}". ` +
          `Solo hay ${linea.cantidad_disponible} disponibles para devolver.`
        );
        return;
      }
    }

    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/notas-credito", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          entrada_id: entrada.id,
          lineas: lineasADevolver.map((l) => ({
            entrada_linea_id: l.entrada_linea_id,
            producto_id: l.producto_id,
            almacen_id: l.almacen_id,
            cantidad: l.cantidad_devuelta,
            costo_unitario: l.costo_unitario,
            subtotal: l.cantidad_devuelta * l.costo_unitario,
          })),
          notas: notas || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear la devolución");
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <style>{modalStyles}</style>
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.15)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
        }}
        onClick={onClose}
      >
      <style>{modalStyles}</style>
      <div
        ref={modalRef}
        className="devolver-modal"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          backgroundColor: "var(--bg-surface)",
          borderRadius: "0px",
          padding: "24px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80vh",
          overflow: "auto",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
          border: "1px solid var(--border-color)",
          position: position === null ? "relative" : "fixed",
          left: position === null ? "auto" : `${position.x}px`,
          top: position === null ? "auto" : `${position.y}px`,
          transform: "none",
          cursor: isDragging ? "grabbing" : "grab",
        }}
        onMouseDown={handleMouseDown}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          onMouseDown={handleMouseDown}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
            paddingBottom: "16px",
            borderBottom: "1px solid var(--border-color)",
            cursor: "grab",
            userSelect: "none",
          }}
        >
          <h2 style={{ margin: 0, color: "var(--text-primary)", fontSize: "1.2rem", fontWeight: 600 }}>Crear Devolución</h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "var(--text-secondary)" }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "var(--status-error-bg, rgba(220,38,38,0.1))",
              border: "1px solid var(--status-error, #dc2626)",
              color: "var(--status-error, #dc2626)",
              padding: "12px 16px",
              borderRadius: "0px",
              marginBottom: "16px",
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "var(--text-primary)", fontWeight: 500 }}>
            Productos a devolver:
          </label>
          <div
            style={{
              border: "1px solid var(--border-color)",
              borderRadius: "0px",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "var(--bg-secondary, rgba(56, 189, 248, 0.08))", borderBottom: "2px solid var(--border-color)" }}>
                  <th style={{ padding: "10px", textAlign: "left", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>
                    Producto
                  </th>
                  <th style={{ padding: "10px", textAlign: "center", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>
                    Disponible
                  </th>
                  <th style={{ padding: "10px", textAlign: "center", color: "var(--text-primary)", fontSize: "0.85rem", fontWeight: 600 }}>
                    Devolver
                  </th>
                </tr>
              </thead>
              <tbody>
                {lineasSeleccionadas.map((linea, idx) => (
                  <tr key={idx} style={{ borderTop: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "8px", color: "var(--text-primary)", fontSize: "0.9rem" }}>
                      {linea.producto_nombre}
                    </td>
                    <td style={{ padding: "8px", textAlign: "center", color: "var(--text-secondary)", fontSize: "0.9rem" }}>
                      {linea.cantidad_disponible}
                    </td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <input
                        type="number"
                        min="0"
                        max={linea.cantidad_disponible}
                        step="0.01"
                        placeholder="0"
                        value={linea.cantidad_devuelta || ""}
                        onChange={(e) => {
                          const nueva = [...lineasSeleccionadas];
                          const valor = e.target.value === "" ? 0 : Number(e.target.value);
                          // No permitir valores mayores a lo disponible
                          nueva[idx].cantidad_devuelta = Math.min(valor, linea.cantidad_disponible);
                          setLineasSeleccionadas(nueva);
                        }}
                        style={{
                          width: "60px",
                          padding: "4px",
                          border: "1px solid var(--border-color)",
                          borderRadius: "0px",
                          textAlign: "center",
                          backgroundColor: "var(--bg-page)",
                          color: "var(--text-primary)",
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", marginBottom: "8px", color: "var(--text-primary)", fontWeight: 500, fontSize: "0.9rem" }}>
            Notas (opcional):
          </label>
          <textarea
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Motivo de la devolución..."
            style={{
              width: "100%",
              minHeight: "80px",
              padding: "10px",
              border: "1px solid var(--border-color)",
              borderRadius: "0px",
              backgroundColor: "var(--bg-page)",
              color: "var(--text-primary)",
              fontFamily: "inherit",
              fontSize: "0.9rem",
              resize: "vertical",
            }}
          />
        </div>

        <div
          style={{
            backgroundColor: "var(--accent-light, rgba(56, 189, 248, 0.1))",
            padding: "12px 16px",
            borderRadius: "0px",
            marginBottom: "16px",
            border: "1px solid var(--accent-color, #38bdf8)",
          }}
        >
          <div style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1rem" }}>
            Total devolución: <span style={{ color: "var(--accent-color, #38bdf8)" }}>S/ {totalDevolucion.toFixed(2)}</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            className={fieldStyles.secondaryButton}
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            onClick={guardarDevolucion}
            className={fieldStyles.primaryButton}
            disabled={isSaving || totalDevolucion === 0}
          >
            {isSaving ? "Procesando..." : "Crear Devolución"}
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
