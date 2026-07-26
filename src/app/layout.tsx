import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const serif = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal"],
});

const sans = IBM_Plex_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Coworking Dispatch — Local & Industry News for Remote Workers",
  description:
    "An editorial dispatch on coworking, cities, and the borderless life — coworking and remote-work news by destination, plus coworking industry news, for remote workers deciding where to be.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${serif.variable} ${sans.variable} h-full antialiased`}
    >
      <body className="paper-grain min-h-full flex flex-col bg-paper text-ink font-sans font-light">
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
