import { createHmac } from "node:crypto"
import Script from "next/script"

import type { SessionUser } from "@/lib/auth"

/**
 * The Ragenta chat bubble, for the signed-in employee shell.
 *
 * Rendered on the server on purpose: the identity hash is
 * `HMAC-SHA256(RAGENTA_IDENTITY_SECRET, user.id)`, and the secret must never
 * reach the browser — a hash the page could compute itself would prove nothing,
 * and Ragenta would then look up anybody's flights for anybody who typed their
 * email. Ragenta verifies the hash before its agent calls `teamora-backend`'s
 * `/v1/integrations/chatbot/journey` with this user's email.
 *
 * All three values are runtime env (one image, several environments), and an
 * unset key renders nothing rather than a bubble that cannot load.
 */
export function RagentaWidget({ user }: { user: SessionUser }) {
  const src = process.env.RAGENTA_WIDGET_SRC
  const key = process.env.RAGENTA_WIDGET_KEY
  const secret = process.env.RAGENTA_IDENTITY_SECRET
  if (!src || !key) return null

  const identity = secret
    ? {
        "data-user-id": user.id,
        "data-user-email": user.email,
        "data-user-hash": createHmac("sha256", secret).update(user.id).digest("hex"),
      }
    : {}

  // `next/script` rather than a bare `<script>`: after the client-side
  // `router.push` that follows sign-in, React mounts this layout in the browser
  // and never executes a script it rendered itself. `afterInteractive` injects
  // and runs it on both full loads and client navigations, and the widget can
  // still read its attributes via `document.currentScript`.
  return <Script src={src} data-key={key} strategy="afterInteractive" {...identity} />
}
