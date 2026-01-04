import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "K-Study Hub | Dictionnaire Coréen-Français",
  description:
    "Dictionnaire coréen-français avec quiz interactif. Apprenez le coréen avec des traductions KO→FR et FR→KO.",
  keywords: [
    "coréen",
    "français",
    "dictionnaire",
    "korean",
    "french",
    "dictionary",
    "quiz",
    "apprentissage",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
