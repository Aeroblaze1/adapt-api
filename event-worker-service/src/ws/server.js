const WebSocket = require("ws")

let wss
const clients = new Set()

function startWebSocketServer() {
  wss = new WebSocket.Server({ port: 4600 })

  wss.on("connection", (ws) => {
    clients.add(ws)

    ws.on("close", () => {
      clients.delete(ws)
    })
  })

  console.log("WebSocket server running on 4600")
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