const { STREAM_KEY, GROUP_NAME } = require("./group")
const processRequestEvent = require("../processors/requestProcessor")

async function startConsumer(redis, workerId) {
  while (true) {
    const entries = await redis.xReadGroup(
      GROUP_NAME,
      workerId,
      {
        key: STREAM_KEY,
        id: ">"
      },
      {
        COUNT: 50,
        BLOCK: 5000
      }
    )

    if (!entries) continue

    for (const stream of entries) {
      for (const message of stream.messages) {
        try {
          const event = JSON.parse(message.message.data)

          await processRequestEvent(event)

          await redis.xAck(STREAM_KEY, GROUP_NAME, message.id)
        } catch (err) {
          console.error("Event processing failed", err)
        }
      }
    }
  }
}

module.exports = startConsumer