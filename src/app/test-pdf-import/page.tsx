'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function TestPdfImportPage() {
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setResultado(null);

    try {
      // Cargar pdf.js
      if (!(window as any).pdfjsLib) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('No se pudo cargar pdfjs'));
          document.body.appendChild(script);
        });
      }

      const pdfjs = (window as any).pdfjsLib;
      pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js';

      // Extraer texto del PDF
      const arrayBuffer = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      let texto = '';

      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        for (const item of content.items) {
          if (!('str' in item)) continue;
          texto += item.str;
          texto += (item as any).hasEOL ? '\n' : ' ';
        }
        texto += '\n';
      }

      // Enviar al endpoint de test
      const res = await fetch('/api/test-pdf-import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pdfText: texto,
          productos: [] // Sin productos para test
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error en importación');
      }

      setResultado(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>🧪 Test de Importación de PDFs</h1>
        <p>Carga un PDF de factura para ver cómo la extrae el módulo de compras.</p>

        <div className={styles.uploadArea}>
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileUpload}
            disabled={loading}
            className={styles.fileInput}
          />
          {loading && <p>Procesando PDF...</p>}
        </div>

        {error && <div className={styles.error}>❌ Error: {error}</div>}

        {resultado && (
          <div className={styles.resultado}>
            <h2>✅ Resultado</h2>
            <p>{resultado.message}</p>

            <div className={styles.factura}>
              <h3>Información de Factura</h3>
              <table>
                <tbody>
                  <tr>
                    <td><strong>Tipo:</strong></td>
                    <td>{resultado.factura.tipoComprobante || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>Número:</strong></td>
                    <td>{resultado.factura.numeroDocumento || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>Fecha:</strong></td>
                    <td>{resultado.factura.fecha || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>Moneda:</strong></td>
                    <td>{resultado.factura.moneda || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>RUC Emisor:</strong></td>
                    <td>{resultado.factura.rucEmisor || '-'}</td>
                  </tr>
                  <tr>
                    <td><strong>Razón Social:</strong></td>
                    <td>{resultado.factura.razonSocialEmisor || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {resultado.factura.lineas.length > 0 && (
              <div className={styles.lineas}>
                <h3>Productos Detectados ({resultado.factura.lineas.length})</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Descripción</th>
                      <th>Cantidad</th>
                      <th>Precio Unit.</th>
                      <th>Código</th>
                    </tr>
                  </thead>
                  <tbody>
                    {resultado.factura.lineas.map((linea: any, idx: number) => (
                      <tr key={idx}>
                        <td>{linea.descripcion}</td>
                        <td>{linea.cantidad}</td>
                        <td>S/ {linea.costo_unitario.toFixed(3)}</td>
                        <td>{linea.codigo || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {resultado.factura.lineas.length === 0 && (
              <div className={styles.warning}>
                ⚠️ No se detectaron productos en el PDF
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
