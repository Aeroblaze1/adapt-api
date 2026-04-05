const http = require("http")
const WebSocket = require("ws")

let wss
let server
const clients = new Set()
const WS_PORT = Number(process.env.PORT || process.env.WS_PORT || 4600)

function startWebSocketServer() {
  if (wss) {
    return wss
  }

  server = http.createServer()

  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(
        `WebSocket port ${WS_PORT} is already in use. Stop the existing process or set WS_PORT to a different value.`
      )
      process.exit(1)
    }

    console.error("WebSocket server error:", err)
    process.exit(1)
  })

  wss = new WebSocket.Server({ server })

  wss.on("connection", (ws) => {
    clients.add(ws)

    ws.on("close", () => {
      clients.delete(ws)
    })
  })

  server.listen(WS_PORT, () => {
    console.log(`WebSocket server running on ${WS_PORT}`)
  })

  return wss
}

function broadcast(event) {
  const data = JSON.stringify(event)

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data)
    }
  }
}

module.exports = {
  startWebSocketServer,
  broadcast
}
