const { getRedis, isRedisHealthy } = require("../config/redis")

const {
  rateKey,
  burstKey,
  violationKey,
  endpointKey
} = require("../core/redisKeys")

async function metricsMiddleware(req, res, next) {
  const context = req.requestContext

  // ----- Connection-level fail-open -----
  if (!isRedisHealthy()) {
    attachFailOpenMetrics(context)
    return next()
  }

  const redis = getRedis()

  const parentId = context.providerId
  const apiKey = context.apiKey
  const now = Date.now()

  const rKey = rateKey(parentId, apiKey)
  const bKey = burstKey(parentId, apiKey)
  const vKey = violationKey(parentId, apiKey)
  const eKey = endpointKey(parentId, apiKey)

  try {
    const pipeline = redis.multi()

    pipeline.zAdd(rKey, {
      score: now,
      value: context.requestId
    })

    pipeline.zRemRangeByScore(rKey, 0, now - 60000)
    pipeline.zCard(rKey)
    pipeline.expire(rKey, 60)

    pipeline.incr(bKey)
    pipeline.expire(bKey, 5)

    pipeline.get(vKey)

    pipeline.hIncrBy(eKey, context.endpointClass, 1)
    pipeline.expire(eKey, 86400)

    const results = await pipeline.exec()

    const requestRateLast60s = results[2]
    const burstScore = results[4]
    const recentViolations = parseInt(results[6] || "0")

    attachComputedMetrics(context, requestRateLast60s, burstScore, recentViolations)

    next()
  } catch (err) {
    console.error("Redis failure — fail open")
    attachFailOpenMetrics(context)
    next()
  }
}

function attachComputedMetrics(context, rate, burst, violations) {
  const expectedBaseline = context.expectedBaseline || 1

  const frequencyDeviation = rate / expectedBaseline

  context.requestRateLast60s = rate
  context.burstScore = burst
  context.recentViolations = violations
  context.frequencyDeviation = frequencyDeviation
  context.adaptiveRateBucket = {
    currentRate: rate,
    baseline: expectedBaseline,
    deviation: frequencyDeviation
  }
}

function attachFailOpenMetrics(context) {
  const expectedBaseline = context.expectedBaseline || 1

  context.requestRateLast60s = 0
  context.burstScore = 0
  context.recentViolations = 0
  context.frequencyDeviation = 0
  context.adaptiveRateBucket = {
    currentRate: 0,
    baseline: expectedBaseline,
    deviation: 0
  }
}

module.exports = metricsMiddleware