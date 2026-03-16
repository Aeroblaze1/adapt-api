const STREAM_KEY = "adaptive:events"
const GROUP_NAME = "adaptive-workers"

async function ensureConsumerGroup(redis) {
  try {
    await redis.xGroupCreate(
      STREAM_KEY,
      GROUP_NAME,
      "0",
      { MKSTREAM: true }
    )
    console.log("Consumer group created")
  } catch (err) {
    if (!err.message.includes("BUSYGROUP")) {
      throw err
    }
    console.log("Consumer group exists")
  }
}

module.exports = {
  STREAM_KEY,
  GROUP_NAME,
  ensureConsumerGroup
}