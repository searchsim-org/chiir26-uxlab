import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import Providers from "@/providers";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/react";
import { Navbar } from "@/components/nav";
import { Inter } from "next/font/google";
import Meta from "@/components/header";
import { Footer } from "@/components/footer";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});



const metadata = {
  title: "UXLab",
  description: "UXLab is an open-source system for web-based user studies enabling the complete, no-code configuration of complex experimental designs.",
  metadataBase: new URL("https://uxlab.searchsim.org"),
  openGraph: {
    title: "UXLab",
    description: "UXLab is an open-source system for web-based user studies enabling the complete, no-code configuration of complex experimental designs.",
  },
};

export default function MyApp({
  Component,
  pageProps,
}: {
  Component: React.ComponentType;
  pageProps: any;
}) {
  return (
    <>
      <Meta metadata={metadata} />
      <Providers>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            forcedTheme="light"
            disableTransitionOnChange
          >
            <Navbar />
            <div className="font-product-sans">
              <Component {...pageProps} />
            </div>
            <Toaster />
            <Footer />
            <Analytics />
          </ThemeProvider>
        </AuthProvider>
      </Providers>
    </>

  );
}