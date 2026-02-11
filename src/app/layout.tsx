import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Travel Tracker - Track Your Travels",
  description: "Mark the countries you've visited and track your progress exploring the world",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Travel Tracker",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content="#4f46e5" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#6366f1" media="(prefers-color-scheme: dark)" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Travel Tracker" />
      </head>
      <body suppressHydrationWarning={true}>
        {children}
      </body>
    </html>
  );
}
