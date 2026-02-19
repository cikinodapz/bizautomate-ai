import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VeltrixAI - Your AI-Powered Business Command Center",
  description: "Automate your business with the power of AI. Smart dashboard, receipt scanner, analytics, and document generator — all in one platform.",
  keywords: "AI, business automation, productivity, dashboard, analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
