import { AppHeader } from "@/components/app-header"

export default function AdminMainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <AppHeader />
      <main className="flex min-h-0 flex-1 flex-col overflow-auto p-4 md:px-8 md:py-6">
        {children}
      </main>
    </>
  )
}
