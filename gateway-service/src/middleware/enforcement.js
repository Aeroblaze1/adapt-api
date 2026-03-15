const { getRedis } = require("../config/redis")
const { getPolicy } = require("../core/keyCache")
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

  const policy = getPolicy(context.policyId)

if (!policy) {
  console.warn("[Enforcement] Missing policy — allowing request")
  return next()
}

if (!policy.enforcement) {
  console.warn("[Enforcement] Missing enforcement config — using defaults")
}

  const cKey = concurrencyKey(parentId, apiKey)
  const cdKey = cooldownKey(parentId, apiKey)

  try {

    // ---------- BLOCK_TEMP ----------
    if (action === "BLOCK_TEMP") {
  console.log("[Enforcement] BLOCK_TEMP applied")
      return res.status(429).json({
        error: "Temporarily blocked"
      })
    }

    // ---------- TEMP_COOLDOWN ----------
    if (action === "TEMP_COOLDOWN") {
    console.log("[Enforcement] TEMP_COOLDOWN triggered")
      const exists = await redis.get(cdKey)

      if (exists) {
        return res.status(429).json({
          error: "Cooldown active"
        })
      }

      const policy = req.requestContext.policyId
      const cooldownSeconds = policy?.enforcement?.cooldownSeconds || 30

      await redis.set(cdKey, "1", {
        EX: cooldownSeconds
      })

      return res.status(429).json({
        error: "Cooldown initiated"
      })
    }


// ---------- LIMIT_CONCURRENCY ----------
if (action === "LIMIT_CONCURRENCY") {

  const raw = await redis.incr(cKey)
  const current = parseInt(raw, 10)

  if (isNaN(current)) {
    throw new Error("Invalid concurrency value")
  }

const policy = getPolicy(context.policyId)
const MAX_CONCURRENCY = policy?.enforcement?.maxConcurrency || 5

  console.log("[Enforcement] LIMIT_CONCURRENCY current:", current)

  if (current > MAX_CONCURRENCY) {
    await redis.decr(cKey)
    return res.status(429).json({
      error: "Concurrency limit exceeded"
    })
  }

  res.once("close", async () => {
    try {
      await redis.decr(cKey)
    } catch (err) {
      console.error("Concurrency decrement failed")
    }
  })

  return next()
}

    // ---------- SOFT_THROTTLE ----------
    if (action === "SOFT_THROTTLE") {
    console.log("[Enforcement] SOFT_THROTTLE delay applied")

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