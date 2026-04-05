const { createClient } = require("redis")
const { requireEnv } = require("./env")

const REDIS_URL = requireEnv("REDIS_URL")

let client

function maskRedisUrl(url) {
  try {
    const parsed = new URL(url)

    if (parsed.password) {
      parsed.password = "****"
    }

    return parsed.toString()
  } catch {
    return "[invalid redis url]"
  }
}

async function connectRedis() {
  client = createClient({ url: REDIS_URL })

  client.on("error", (err) => {
    console.error("Redis error:", err.message)
  })

  console.log(`Connecting worker Redis client to ${maskRedisUrl(REDIS_URL)}`)
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
