import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Surechigai - Turn encounters into connections",
  description: "A matching app that connects travelers who crossed paths",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
