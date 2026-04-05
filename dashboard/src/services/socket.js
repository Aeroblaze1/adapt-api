let socket

export function connectSocket(onMessage) {
  const socketUrl =
    import.meta.env.VITE_WORKER_WS_URL || "ws://localhost:4600"

  socket = new WebSocket(socketUrl)

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    onMessage(data)
  }
}
