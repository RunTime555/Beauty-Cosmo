import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Beatty Cosmo - Management Dashboard",
  description: "Luxury Cosmetic Shop Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#FAF7EF] min-h-screen">
        <Sidebar />
        {/* Main Content Area adjusting dynamically on desktop */}
        <div className="lg:pl-64 pt-16 lg:pt-0 min-h-screen transition-all">
          <main className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}