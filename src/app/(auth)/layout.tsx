import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";
import NextThemeProvider from "@/providers/theme-provider";
import { SessionProvider } from "next-auth/react";
import { auth } from "@/auth";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Account Login | DASE",
  description: "Securely sign in to your DASE account to manage hotel bookings, restaurant orders, and supermarket shopping in Oyo Town.",
  // Prevents search engines from indexing auth pages while keeping them useful
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className={`${inter.className} bg-gray-100 dark:bg-dark-1`}>
          <NextThemeProvider>
            <div className='w-full flex justify-center items-center min-h-screen'>
              <div className="w-full max-w-4xl px-3 mx-auto md:px-4">
                {children}
              </div>
            </div> 
          </NextThemeProvider>
        </body>
      </html>
    </SessionProvider> 
  );
}