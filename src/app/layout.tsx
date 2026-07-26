import type { Metadata } from "next";
import { Work_Sans, Bitter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

const GA_MEASUREMENT_ID = "G-6EJT7RQT3F";

const serif = Work_Sans({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal"],
});

const sans = Bitter({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.coworkingdispatch.com"),
  title: {
    default: "Coworking Dispatch — Local & Industry News for Remote Workers",
    template: "%s — Coworking Dispatch",
  },
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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
