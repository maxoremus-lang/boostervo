import type { Metadata, Viewport } from "next";
import ServiceWorkerRegistrar from "./_components/ServiceWorkerRegistrar";
import Providers from "./_components/Providers";

export const metadata: Metadata = {
  title: "BoosterVO Rappels",
  description: "Gestion des rappels d'appels manqués pour les négociants",
  manifest: "/app/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BoosterVO",
    startupImage: ["/app/icon-512.png"],
  },
  icons: {
    icon: [
      { url: "/app/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/app/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/app/icon-192.png", sizes: "192x192", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#1B4F9B",
};

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <div className="min-h-screen bg-fond">
        <div className="max-w-md mx-auto bg-fond min-h-screen relative">{children}</div>
        <ServiceWorkerRegistrar />
      </div>
    </Providers>
  );
}
