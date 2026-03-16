const { connectRedis } = require("./config/redis")
const { initConsumerGroup } = require("./stream/initGroup")

async function start() {
  await connectRedis()
  await initConsumerGroup()

  console.log("Worker started")
  // Next: start consumer loop
}

start().catch(err => {
  console.error("Worker failed:", err)
  process.exit(1)
})