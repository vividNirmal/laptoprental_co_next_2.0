import { Inter } from "next/font/google";
import { StoreProvider } from "@/redux/provider";
import { Toaster } from "@/components/ui/sonner";
import Script from "next/script";
import "./globals.css";
import "../styles/performance.css";
import { Suspense, lazy } from "react";
import dynamic from "next/dynamic";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import HomePagePreloader from "@/components/HomePagePreloader";

// Lazy load non-critical components with loading states
const BackToTopButton = dynamic(() => import("@/components/BackToTopButton"), { 
  ssr: true, 
  loading: () => null 
});
const RouteLoader = dynamic(() => import("@/components/route-loader"), { 
  ssr: true,
  loading: () => null
});

const interSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata = {
  title: "Laptop Rental - Premium Laptop Rentals",
  description: "Rent Laptop - Fast, Reliable, Affordable laptop rentals for professionals and businesses",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Laptop Rental",
  },
  icons: {
    apple: "/icon-192x192.png",
    icon: "/icon-192x192.png",
  },
  keywords: "laptop rental, laptop rental, macbook pro, macbook air, computer rental",
  authors: [{ name: "Laptop Rental Team" }],
  creator: "Laptop Rental",
  publisher: "Laptop Rental",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#9cc3D5",
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#9cc3D5" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//api.laptoprental.co" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
        
        {/* Preload critical resources with high priority */}
        <link rel="preload" href="/icon-192x192.png" as="image" fetchPriority="high" />
        <link rel="preload" href="/placeholder.svg" as="image" fetchPriority="high" />
        
        {/* Resource hints for better performance */}
        <link rel="prefetch" href="/api/v1/home-page" />
        
        {/* Cache control headers via meta tags */}
        <meta httpEquiv="Cache-Control" content="public, max-age=31536000, immutable" />
        <meta httpEquiv="Pragma" content="cache" />
      </head>
      <body className={`${interSans.variable} antialiased`}>
        <PerformanceMonitor />
        <Suspense fallback={<div className="fixed top-0 left-0 w-full h-1 bg-blue-500 animate-pulse z-50" />}>
          <RouteLoader />
        </Suspense>
        <StoreProvider>
          <HomePagePreloader />
          {children}
          <Suspense fallback={null}>
            <Toaster richColors position="top-right" />
          </Suspense>
          <Suspense fallback={null}>
            <BackToTopButton />
          </Suspense>
        </StoreProvider>
        
        {/* Service Worker Registration - Optimized for bfcache */}
        <Script id="register-sw" strategy="lazyOnload">
          {`
            if ('serviceWorker' in navigator) {
              // Delay registration to not block initial render
              setTimeout(() => {
                navigator.serviceWorker.register('/sw.js')
                  .then(function(registration) {
                    // Handle updates gracefully for bfcache compatibility
                    registration.addEventListener('updatefound', () => {
                      const newWorker = registration.installing;
                      newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                          // New content available, reload
                          window.location.reload();
                        }
                      });
                    });
                  })
                  .catch(function(registrationError) {
                    console.warn('SW registration failed:', registrationError);                    
                  });
              }, 2000);
            }
          `}
        </Script>

        {/* Optimize for back/forward cache */}
        <Script id="bfcache-optimization" strategy="lazyOnload">
          {`
            // Prevent WebSocket blocking bfcache
            window.addEventListener('pageshow', function(event) {
              if (event.persisted) {
                // Page restored from bfcache                
              }
            });
            
            window.addEventListener('pagehide', function(event) {
              // Clean up resources before page hides
              if (window.WebSocket) {
                // Close any active WebSocket connections
                const sockets = window.activeSockets || [];
                sockets.forEach(socket => {
                  if (socket.readyState === WebSocket.OPEN) {
                    socket.close();
                  }
                });
              }
            });
          `}
        </Script>
      </body>
    </html>
  );
}
