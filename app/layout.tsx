import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Facebook Utility Tool",
  description: "Official Facebook logout shortcut and Graph API User ID lookup utility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased flex flex-col justify-between">
        {children}
      </body>
    </html>
  );
}
