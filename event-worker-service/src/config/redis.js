const { createClient } = require("redis")

const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379"

let client

async function connectRedis() {
  client = createClient({ url: REDIS_URL })

  client.on("error", (err) => {
    console.error("Redis error:", err.message)
  })

  console.log(`Connecting worker Redis client to ${REDIS_URL}`)
  await client.connect()
  console.log("Worker Redis connected")
}

function getRedis() {
  if (!client) throw new Error("Redis not initialized")
  return client
}

module.exports = {
  connectRedis,
  getRedis
}
