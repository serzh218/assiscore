import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: "AssisCore",
  description: "AssisCore — преобразуйте любой сайт за секунды с помощью конструктора сайтов на AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="font-sans">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
