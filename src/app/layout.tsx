import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ZoomProvider } from "@/components/zoom/ZoomProvider";
import { SessionProvider } from "@/components/session/SessionProvider";
import { getSession } from "@/lib/auth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Eco-Sistema",
  description: "Panel de aplicaciones de gestión empresarial",
};

const themeInitScript = `
try {
  var storedTheme = localStorage.getItem("eco-theme");
  if (storedTheme === "dark" || storedTheme === "light") {
    document.documentElement.setAttribute("data-theme", storedTheme);
  }
} catch (e) {}
`;

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <SessionProvider username={session?.username ?? null}>
          <ZoomProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </ZoomProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
