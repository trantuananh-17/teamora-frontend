import type { Metadata } from "next"
import { Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { EnvScript } from "@/components/env-script"
import { Providers } from "@/components/providers"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

/**
 * Inter rather than Ragenta's Geist: Geist ships no `vietnamese` subset, so
 * every diacritic in this UI — which is entirely Vietnamese — would fall back to
 * a system font mid-word. Mono stays Geist; the only thing set in it is ids and
 * codes, which are ASCII.
 */
const sans = Inter({ variable: "--font-sans", subsets: ["latin", "vietnamese"] })
const mono = Geist_Mono({ variable: "--font-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Teamora",
    template: "%s · Teamora",
  },
  description: "Hệ thống quản lý Team Building.",
  // An internal, signed-in tool holding a company's staff list. Nothing here
  // belongs in a search index.
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="vi"
      className={cn("h-full antialiased", sans.variable, mono.variable, "font-sans")}
      suppressHydrationWarning
    >
      <head>
        <EnvScript />
      </head>
      <body className="flex min-h-full flex-col">
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {/* The sidebar's collapsed rail shows each item's name as a
                tooltip, so the provider has to be above it. */}
            <TooltipProvider delayDuration={300}>
              {children}
              <Toaster />
            </TooltipProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
