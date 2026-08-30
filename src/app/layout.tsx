import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

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
      </body>
    </html>
  );
}