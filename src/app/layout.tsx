import type { ReactNode } from "react";
import "../styles/index.css";
import "../styles/globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className="h-full">
      <body className="min-h-screen bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
