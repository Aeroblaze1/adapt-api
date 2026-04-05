require("dotenv").config()

const { connectRedis, getRedis } = require("./config/redis")
const { connectMongo } = require("./config/mongo")
const { ensureConsumerGroup } = require("./stream/group")
const startConsumer = require("./stream/consumer")
const startBaselineScheduler = require("./scheduler/baselineScheduler")
const { startWebSocketServer } = require("./ws/server")

startWebSocketServer()

async function start() {
  await connectRedis()
  await connectMongo()

  const redis = getRedis()

  await ensureConsumerGroup(redis)

  const workerId = "worker-" + process.pid

  startBaselineScheduler()

  await startConsumer(redis, workerId)
}

start()
