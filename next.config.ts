import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone",
  // Por defecto Next.js solo mantiene 2 páginas compiladas en memoria en modo
  // desarrollo y las descarta a los 25s de inactividad -con ~50 sesiones en el
  // panel, eso significa recompilar de nuevo cada vez que volvés después de un
  // rato sin navegar. Lo estiramos bastante: 1 hora sin descartar, y lugar para
  // 30 sesiones a la vez, así una jornada de trabajo normal no vuelve a pagar
  // ese costo. Sin efecto en producción (ahí ya está todo compilado de antemano).
  onDemandEntries: {
    maxInactiveAge: 60 * 60 * 1000,
    pagesBufferLength: 30,
  },
};

export default nextConfig;
