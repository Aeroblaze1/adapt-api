const { getRedis } = require("../config/redis")
const {
  concurrencyKey,
  cooldownKey
} = require("../core/redisKeys")

async function enforcementMiddleware(req, res, next) {
  const context = req.requestContext
  const redis = getRedis()

  const parentId = context.providerId
  const apiKey = context.apiKey
  const action = context.enforcementAction

  const cKey = concurrencyKey(parentId, apiKey)
  const cdKey = cooldownKey(parentId, apiKey)

  try {

    // ---------- BLOCK_TEMP ----------
    if (action === "BLOCK_TEMP") {
      return res.status(429).json({
        error: "Temporarily blocked"
      })
    }

    // ---------- TEMP_COOLDOWN ----------
    if (action === "TEMP_COOLDOWN") {
      const exists = await redis.get(cdKey)

      if (exists) {
        return res.status(429).json({
          error: "Cooldown active"
        })
      }

      const policy = req.requestContext.policyId
      const cooldownSeconds = 30

      await redis.set(cdKey, "1", {
        EX: cooldownSeconds
      })

      return res.status(429).json({
        error: "Cooldown initiated"
      })
    }

    // ---------- LIMIT_CONCURRENCY ----------
    if (action === "LIMIT_CONCURRENCY") {

      const current = await redis.incr(cKey)

      const MAX_CONCURRENCY = 5

      if (current > MAX_CONCURRENCY) {
        await redis.decr(cKey)
        return res.status(429).json({
          error: "Concurrency limit exceeded"
        })
      }

      res.on("finish", async () => {
        try {
          await redis.decr(cKey)
        } catch {}
      })

      return next()
    }

    // ---------- SOFT_THROTTLE ----------
    if (action === "SOFT_THROTTLE") {

      await delay(100)

      return next()
    }

    // ---------- ALERT_ONLY ----------
    if (action === "ALERT_ONLY") {
      return next()
    }

    // ---------- ALLOW ----------
    return next()

  } catch (err) {

    console.error("Enforcement failure — fail open")

    return next()
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

module.exports = enforcementMiddleware