import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BBOS Dashboard",
  description: "Local-first command dashboard for BBOS"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
