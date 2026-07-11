import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const cookieStore = await cookies();
  const theme = cookieStore.get("eco-theme")?.value === "dark" ? "dark" : "light";

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable}`}
      data-theme={theme}
      suppressHydrationWarning
    >
      <body>
        <SessionProvider username={session?.username ?? null}>
          <ZoomProvider>
            <ThemeProvider>{children}</ThemeProvider>
          </ZoomProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
