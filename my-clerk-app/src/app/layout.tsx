import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { ClerkProvider, SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atlas AI Hub",
  description: "Enterprise AI Assets Control Layer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <ClerkProvider>
          <header className="flex justify-end p-4 gap-4">
            <Show when="signed-out">
              <SignInButton mode="modal" />
              <SignUpButton mode="modal" />
            </Show>
            <Show when="signed-in">
              <div className="flex items-center gap-4">
                <Link href="/dashboard/manager" className="text-sm font-medium text-[#1E2761] hover:text-[#065A82]">
                  Launch Dashboard →
                </Link>
                <UserButton />
              </div>
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
