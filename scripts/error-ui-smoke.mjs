const eventId = "demo-s3-event"
const targets = await (await fetch("http://127.0.0.1:9222/json")).json()
const target = targets.find((item) => item.type === "page")
if (!target) throw new Error("Chrome headless không có page target.")

const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true })
  socket.addEventListener("error", reject, { once: true })
})

let commandId = 0
const pending = new Map()
socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data)
  if (!message.id) return
  const request = pending.get(message.id)
  if (!request) return
  pending.delete(message.id)
  if (message.error) request.reject(new Error(message.error.message))
  else request.resolve(message.result)
})

function send(method, params = {}) {
  const id = ++commandId
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
}

const wait = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds))

async function navigate(url, settle = 1_500) {
  await send("Page.navigate", { url })
  await wait(settle)
}

async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true })
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text)
  return result.result.value
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

try {
  await send("Page.enable")
  await send("Runtime.enable")
  await navigate("http://localhost:3000/login")

  const login = await evaluate(`fetch('/api/v1/auth/sign-in/email',{method:'POST',headers:{'content-type':'application/json'},credentials:'include',body:JSON.stringify({email:'btc@teamora.local',password:'Teamora!2026'})}).then(response=>response.status)`)
  assert(login === 200, `Đăng nhập BTC thất bại: ${login}`)
  await navigate(`http://localhost:3000/admin/events/${eventId}`)
  assert((await evaluate("document.body.innerText")).includes("Tổng quan kỳ"), "Trang quản trị không tải được trước khi mô phỏng lỗi.")

  // The runner stops the backend after seeing this marker.
  console.log("AUTH_READY")
  const offlineDeadline = Date.now() + 30_000
  let backendStatus = 200
  while (Date.now() < offlineDeadline) {
    backendStatus = await evaluate("fetch('/api/v1/auth/get-session',{credentials:'include'}).then(response=>response.status).catch(()=>599)")
    if (backendStatus >= 500) break
    await wait(250)
  }
  assert(backendStatus >= 500, "Backend chưa được tắt trong thời gian chờ smoke test.")

  await navigate(`http://localhost:3000/admin/events/${eventId}/audit-log`, 3_000)
  const text = await evaluate("document.body.innerText")
  assert(text.includes("Không tải được dữ liệu"), `Không thấy UI lỗi thân thiện: ${text.slice(0, 1_000)}`)
  assert(text.includes("Thử lại") && text.includes("Về trang chính"), "UI lỗi thiếu hành động phục hồi.")
  assert(!text.includes("HTTPError") && !text.includes("Request failed") && !text.includes("node_modules"), "UI làm lộ lỗi kỹ thuật hoặc stack trace.")

  console.log(JSON.stringify({ apiOfflineFallback: "ok", stackTraceHidden: "ok", recoveryActions: "ok" }, null, 2))
} finally {
  try { await send("Browser.close") } catch { /* Browser may already be closing. */ }
  socket.close()
}
