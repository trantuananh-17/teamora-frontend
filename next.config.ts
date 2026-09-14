import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Self-contained server bundle, so the runner stage of the Dockerfile carries
  // no node_modules of its own.
  output: "standalone",
  // Dev-only: lets the ngrok tunnel load HMR assets. Ignored by `next build`.
  allowedDevOrigins: ["*.ngrok-free.dev"],
}

export default nextConfig
