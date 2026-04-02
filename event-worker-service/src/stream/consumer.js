const { STREAM_KEY, GROUP_NAME } = require("./group")
const processRequestEvent = require("../processors/requestProcessor")
const { broadcast } = require("../ws/server")


async function recreateGroup(redis) {
  try {
    await redis.xGroupCreate(
      STREAM_KEY,
      GROUP_NAME,
      "0",
      { MKSTREAM: true }
    )
    console.log("Consumer group recreated")
  } catch (err) {
    if (!err.message.includes("BUSYGROUP")) {
      console.error("Group recreation failed:", err)
    }
  }
}
/**
 * Start the Redis Stream consumer loop.
 * - Recovers pending messages first.
 * - Then continuously processes new messages.
 */
async function startConsumer(redis, workerId) {
  console.log(`Consumer starting with ID: ${workerId}`)

  // recover any pending messages from crashed workers
  await reclaimPending(redis, workerId)

  console.log("Entering blocking read loop...")

  // continuous blocking read loop
  while (true) {
    try {
      const entries = await redis.xReadGroup(
        GROUP_NAME,
        workerId,
        {
          key: STREAM_KEY,
          id: ">"       // Only new messages
        },
        {
          COUNT: 50,    // Batch size
          BLOCK: 5000   // 5s block timeout
        }
      )

      if (!entries) continue

      await processEntries(redis, entries)

    } catch (err) {
  if (err.message.includes("NOGROUP")) {
    console.warn("Stream or group missing. Recreating...")

    await recreateGroup(redis)

  } else {
    console.error("Consumer loop error:", err)
    await sleep(1000)
  }
}
  }
}

/**
 * Reclaim pending (unacked) messages.
 * This handles crash recovery safely.
 */
async function reclaimPending(redis, workerId) {
  console.log("Reclaiming pending messages...")

  let cursor = "0-0"

  while (true) {
    try {
      const result = await redis.xAutoClaim(
        STREAM_KEY,
        GROUP_NAME,
        workerId,
        60000,     // minimum idle time (60s)
        cursor,
        { COUNT: 50 }
      )

      cursor = result.nextId
      const messages = result.messages

      if (!messages || messages.length === 0) break

      const formatted = [{
        name: STREAM_KEY,
        messages: messages.map(m => ({
          id: m.id,
          message: m.message
        }))
      }]

      await processEntries(redis, formatted)

    } catch (err) {
      console.error("Pending reclaim error:", err)
      break
    }
  }

  console.log("Pending recovery complete")
}

/**
 * Process stream entries and acknowledge after successful persistence.
 */
async function processEntries(redis, entries) {
  for (const stream of entries) {
    for (const message of stream.messages) {
      try {
        const raw = message.message.data
        const event = JSON.parse(raw)

        await processRequestEvent(event)

        // NEW: push to frontend
        broadcast(event)

        await redis.xAck(STREAM_KEY, GROUP_NAME, message.id)

      } catch (err) {
        console.error("Event processing failed:", err)
        // Do NOT ack — leave in pending for retry
      }
    }
  }
}

/**
 * Small async sleep utility.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = startConsumer