/** The signed-out shell: one centred card, no navigation, no event context. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-accent/20 p-6">
      <span className="text-2xl font-semibold tracking-tight">Teamora</span>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  )
}
