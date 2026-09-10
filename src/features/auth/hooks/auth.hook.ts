"use client"

import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

import { authClient } from "@/lib/auth-client"

export const authKeys = {
  all: () => ["auth"] as const,
  session: () => [...authKeys.all(), "session"] as const,
}

export interface Credentials {
  email: string
  password: string
}

/**
 * Where to land after signing in. `redirect` is only honoured when it is a path
 * on this origin — an absolute URL there would be an open redirect.
 */
function safeRedirect(value: string | null, fallback: string): string {
  if (!value) return fallback
  if (!value.startsWith("/") || value.startsWith("//")) return fallback
  return value
}

export function useLogin(redirectTo: string | null) {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ email, password }: Credentials) => {
      const { data, error } = await authClient.signIn.email({ email, password })
      if (error) throw new Error(error.message ?? "Đăng nhập không thành công.")
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: authKeys.session() })
      // `refresh` re-runs the server gate, which is what decides whether this
      // account lands on their own journey or on the organiser console.
      router.push(safeRedirect(redirectTo, "/"))
      router.refresh()
    },
    onError: (error: Error) => {
      toast.error("Đăng nhập không thành công", { description: error.message })
    },
  })
}

export function useLogout() {
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      await authClient.signOut()
    },
    onSuccess: () => {
      // Everything cached was fetched as this person. Clear it before the next
      // one signs in on the same browser — this is a shared-office tool.
      queryClient.clear()
      router.push("/login")
      router.refresh()
    },
    onError: () => {
      toast.error("Đăng xuất không thành công", { description: "Vui lòng thử lại." })
    },
  })
}
