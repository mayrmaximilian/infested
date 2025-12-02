import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "infested | indie gaming hub",
  description:
    "infested is a modern hub for indie games, discovery, and community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="bg-black">
      <body className="bg-black text-white antialiased font-sans">
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,#D946EF30,transparent_25%),radial-gradient(circle_at_80%_0%,#22D3EE26,transparent_25%),radial-gradient(circle_at_80%_80%,#2DD4BF1f,transparent_30%)]" />
        <div className="min-h-screen">{children}</div>
      </body>
    </html>
  );
}
