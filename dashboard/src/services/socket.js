let socket

export function connectSocket(onMessage) {
  socket = new WebSocket("ws://localhost:4600")

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data)
    onMessage(data)
  }
}