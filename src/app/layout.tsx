// app/layout.tsx

import type { Metadata } from "next"
import { Plus_Jakarta_Sans, Playfair_Display } from "next/font/google"
import { Providers } from "@/components/providers"
import { cn } from "@/lib/utils"
import { Toaster } from "sonner"
import "./globals.css"
import { DeliveryAddressProvider } from "@/context/DeliveryAddressContext";
import { SessionProvider } from "next-auth/react"
import { auth } from "@/auth"
import { CartProvider } from "@/context/cart-context"
import { SyncPendingAddress } from "@/components/auth/SyncPendingAddress";


const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "DASE | Hotel, Restaurant & Supermarket",
    template: "%s | DASE"
  },
  description:
    "Experience luxury and convenience with DASE. Book premium hotel rooms, order gourmet meals, or shop for fresh groceries and daily essentials—all delivered or reserved in Oyo, Nigeria.",
 keywords: [
  "DASE",
  "DASE Supermarket",
  "DASE Luxury Hotel",
  "DASE Restaurant",
  "daseluxuryhotel",
  "supermarket",
  "groceries",
  "online shopping",
  "lodge",
  "hotel",
  "Ibadan",
  "Oyo",
  "Nigeria",
  "Nigeria Farm Products",
  "chicken",
  "eggs",
  "Ayetoro street",
  "Owode Oyo",
  "Oyo Town Hotel",
  "Best restaurant in Oyo",
  "food delivery Oyo",
  "hospitality Oyo State"
],
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    title: "DASE | Hotel, Restaurant & Supermarket",
    description: "Your all-in-one destination for luxury stay, fine dining, and fresh groceries in Oyo, Nigeria.",
    url: "https://dase.com.ng", // Update this to your unified domain
    siteName: "DASE",
    images: [
      {
        url: "/og-image.png", // Recommended: Use a composite image showing all three services
        width: 1200,
        height: 630,
        alt: "DASE - Hotel, Restaurant, and Supermarket in Oyo",
      },
    ],
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DASE | Luxury Stay & Smart Shopping",
    description: "The premier hub for hospitality and retail in Oyo Town.",
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await auth()

  return (
    <SessionProvider session={session}>
      <html lang="en" className={cn( playfair.variable)}>
        <body className={cn(
          "min-h-[calc(100vh-1px)] flex flex-col antialiased",
          "font-sans bg-white text-gray-900",
          
        )}>
          <main className="relative flex-1 flex flex-col">
            <Providers>
             
               <CartProvider>
                 <DeliveryAddressProvider>
                  <div className="flex-1 min-w-0 overflow-hidden">
                   <SyncPendingAddress />
                    {children}
                  </div>
             
                <Toaster richColors closeButton position="top-right" />
                </DeliveryAddressProvider>
               </CartProvider>
            </Providers>
          </main>
        </body>
      </html>
    </SessionProvider>
  )
}



