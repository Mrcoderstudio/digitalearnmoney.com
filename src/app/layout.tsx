import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "react-hot-toast";   // ✅ Import Toaster

export const metadata: Metadata = {
  title: "Digital Earn Money",
  description: "Invest Smart, Earn Daily",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0a1628] text-white antialiased">
        <Providers>{children}</Providers>
        {/* ✅ Toaster added here */}
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      </body>
    </html>
  );
}