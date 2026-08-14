import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppStateProvider } from "@/components/app-state";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VibeRatio — Wallpaper Search",
  description:
    "A ChatGPT-style, database-less wallpaper search engine. Powered by Pexels & Pixabay.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex">
        <AppStateProvider>
          <Sidebar />
          <main className="flex-1 flex flex-col min-w-0">{children}</main>
        </AppStateProvider>
      </body>
    </html>
  );
}