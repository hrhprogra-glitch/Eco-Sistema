import { NextRequest, NextResponse } from 'next/server';
import { parsearFacturaPdf } from '@/components/compras/importarFacturaPdf';

export async function POST(req: NextRequest) {
  try {
    const { pdfText, productos } = await req.json();

    if (!pdfText || !Array.isArray(productos)) {
      return NextResponse.json(
        { error: 'Se requiere pdfText y productos array' },
        { status: 400 }
      );
    }

    // Usar la función real de parsing
    const factura = parsearFacturaPdf(pdfText, productos, []);

    return NextResponse.json({
      success: true,
      factura,
      lineasCount: factura.lineas.length,
      message: `✓ Extracción exitosa: ${factura.lineas.length} productos detectados`
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, stack: err.stack },
      { status: 500 }
    );
  }
}
