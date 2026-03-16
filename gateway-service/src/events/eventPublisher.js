const { getRedis } = require("../config/redis")

const STREAM_KEY = "adaptive:events"

async function publishEvent(event) {
  try {
    const redis = getRedis()

    await redis.xAdd(
      STREAM_KEY,
      "*",
      {
        data: JSON.stringify(event)
      }
    )
  } catch (err) {
    // Fail-open: do not block request
    console.error("Event publish failed")
  }
}

module.exports = {
  publishEvent
}