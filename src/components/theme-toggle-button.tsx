"use client"

import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

/**
 * Both icons are always rendered and CSS decides which is visible, rather than
 * branching on the resolved theme. Branching needs a `mounted` flag to avoid a
 * hydration mismatch, and that flag is what makes the button blink in on every
 * page load — the flash `.claude/rules/theming.md` rules out.
 */
export function ThemeToggleButton() {
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label="Đổi giao diện sáng/tối"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <SunIcon className="dark:hidden" />
      <MoonIcon className="hidden dark:block" />
    </Button>
  )
}
