const { createClient } = require("redis")
const { requireEnv } = require("./env")

const REDIS_URL = requireEnv("REDIS_URL")

let client
let redisHealthy = false

async function connectRedis() {
  client = createClient({
    url: REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 5) {
          console.error("Redis unreachable. Entering degraded mode.")
          return false // stop retrying
        }
        return 1000 // retry after 1s
      }
    }
  })

  client.on("connect", () => {
    redisHealthy = true
    console.log("Redis connected")
  })

  client.on("end", () => {
    redisHealthy = false
    console.log("Redis connection closed")
  })

  client.on("error", () => {
    redisHealthy = false
  })

  console.log(`Connecting gateway Redis client to ${REDIS_URL}`)
  await client.connect()
}

function getRedis() {
  return client
}

function isRedisHealthy() {
  return redisHealthy
}

module.exports = {
  connectRedis,
  getRedis,
  isRedisHealthy
}
