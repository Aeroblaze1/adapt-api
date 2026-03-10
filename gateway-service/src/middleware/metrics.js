const { getRedis, isRedisHealthy } = require("../config/redis")

if (!isRedisHealthy()) {//connection level fail open
  // Fail-open
  context.requestRateLast60s = 0
  context.burstScore = 0
  context.recentViolations = 0
  return next()
}

async function metricsMiddleware(req, res, next) {
  const context = req.requestContext
  const redis = getRedis()

  const parentId = context.providerId
  const apiKey = context.apiKey
  const now = Date.now()

  const rateKey = `rate:${parentId}:${apiKey}`
  const burstKey = `burst:${parentId}:${apiKey}`
  const violationKey = `violations:${parentId}:${apiKey}`

  try {
    const pipeline = redis.multi()

    // Sliding window
    pipeline.zAdd(rateKey, {
      score: now,
      value: context.requestId
    })

    pipeline.zRemRangeByScore(rateKey, 0, now - 60000)

    pipeline.zCard(rateKey)

    pipeline.expire(rateKey, 60)

    // Burst counter
    pipeline.incr(burstKey)
    pipeline.expire(burstKey, 5)

    // Violation read
    pipeline.get(violationKey)

    const results = await pipeline.exec()

    const requestRateLast60s = results[2]
    const burstScore = results[4]
    const recentViolations = parseInt(results[6] || "0")

    context.requestRateLast60s = requestRateLast60s
    context.burstScore = burstScore
    context.recentViolations = recentViolations

    next()
  } catch (err) {//if redis operation fails during this request, treat it normal traffic and continue.
    console.error("Redis failure — fail open")

    // Fail-open behavior
    context.requestRateLast60s = 0
    context.burstScore = 0
    context.recentViolations = 0

    next()
  }
}

module.exports = metricsMiddleware