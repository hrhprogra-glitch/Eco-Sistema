"use client";

import React from "react";
import { DashboardGrid, dashboardStyles } from "@/components/ui/DashboardGrid";
import { WidgetCard } from "@/components/ui/WidgetCard";
import { TrendingUp, Activity, PieChart, ArrowUpRight, ArrowDownRight, Package } from "lucide-react";

interface DashboardClientProps {
  firstName: string | null;
}

export function DashboardClient({ firstName }: DashboardClientProps) {
  const greeting = firstName ? `Hola, ${firstName}` : "Panel de aplicaciones";

  return (
    <div style={{ padding: '24px 0' }}>
      <div style={{ padding: '0 24px', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)' }}>{greeting}</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>Resumen de actividad. Accedé a los módulos desde el menú de arriba.</p>
      </div>

      <DashboardGrid>
        {/* Widget 1: Resumen Financiero / Actividad */}
        <div className={dashboardStyles.colSpan8} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            <WidgetCard title="Ingresos (30d)" icon={TrendingUp}>
              <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)' }}>
                $124,500
              </div>
              <div style={{ color: '#16a34a', fontSize: '13px', display: 'flex', alignItems: 'center', marginTop: 8 }}>
                <ArrowUpRight size={14} /> +14.5% vs mes anterior
              </div>
            </WidgetCard>
            
            <WidgetCard title="Gastos (30d)" icon={Activity}>
              <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)' }}>
                $43,210
              </div>
              <div style={{ color: '#dc2626', fontSize: '13px', display: 'flex', alignItems: 'center', marginTop: 8 }}>
                <ArrowDownRight size={14} /> -2.1% vs mes anterior
              </div>
            </WidgetCard>

            <WidgetCard title="Pedidos Pendientes" icon={Package}>
              <div style={{ fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)' }}>
                18
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '13px', marginTop: 8 }}>
                5 requieren atención hoy
              </div>
            </WidgetCard>
          </div>
        </div>

        {/* Widget 2: Actividad Reciente / Gráfico (Placeholder) */}
        <div className={dashboardStyles.colSpan4} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <WidgetCard title="Análisis de Flujo" icon={PieChart} style={{ minHeight: '300px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              height: '100%', 
              flexDirection: 'column',
              color: 'var(--text-secondary)'
            }}>
              {/* Placeholder circular */}
              <div style={{
                width: 150,
                height: 150,
                borderRadius: '50%',
                border: '20px solid var(--eco-celeste)',
                borderRightColor: 'var(--eco-azul)',
                borderBottomColor: '#f43f5e',
                marginBottom: 24,
                position: 'relative'
              }}>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 18,
                  color: 'var(--text-primary)'
                }}>
                  32%
                </div>
              </div>
              <p style={{ fontSize: 13, textAlign: 'center' }}>Distribución de ingresos vs egresos en el periodo seleccionado.</p>
            </div>
          </WidgetCard>

          <WidgetCard title="Últimos Movimientos" style={{ flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12, borderBottom: i !== 5 ? '1px solid var(--border-color)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 13, color: 'var(--text-primary)' }}>Factura F-{202400 + i}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Hace {i * 2} horas</div>
                  </div>
                  <div style={{ color: i % 2 === 0 ? '#dc2626' : '#16a34a', fontWeight: 500, fontSize: 13 }}>
                    {i % 2 === 0 ? '-' : '+'}${Math.floor(Math.random() * 1000) + 100}.00
                  </div>
                </div>
              ))}
            </div>
          </WidgetCard>
        </div>
      </DashboardGrid>
    </div>
  );
}
