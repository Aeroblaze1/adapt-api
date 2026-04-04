const { getRedis } = require("../config/redis")
const { getPolicy } = require("../core/keyCache")
const { publishEvent } = require("../events/eventPublisher")
const {
  violationKey,
  concurrencyKey,
  cooldownKey
} = require("../core/redisKeys")



async function emitEnforcementEvent(ctx, action, reason, statusCode) {
  const event = {
    apiKey: ctx.apiKey,
    providerId: ctx.providerId,
    timestamp: Date.now(),

    analysis: {
      riskScore: ctx.riskScore,
      anomalyType: ctx.anomalyType
    },

    decision: {
      stage: ctx.stage,
      action
    },

    enforcement: {
      reason,
      blocked: statusCode !== 200
    },

    response: {
      statusCode
    }
  }

  try {
    await publishEvent(event)
  } catch (err) {
    console.warn("Event emit failed")
  }
}

async function recordViolation(redis, parentId, apiKey) {
  const vKey = violationKey(parentId, apiKey)

  const pipeline = redis.multi()
  pipeline.incr(vKey)
  pipeline.expire(vKey, 60)
  await pipeline.exec()

  return vKey
}


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
      await recordViolation(redis, parentId, apiKey)
  console.log("[Enforcement] BLOCK_TEMP applied")

  await emitEnforcementEvent(context, "BLOCK", "temp_block", 429)

  return res.status(429).json({
    error: "Temporarily blocked"
  })
}

    // ---------- TEMP_COOLDOWN ----------
if (action === "TEMP_COOLDOWN") {

  console.log("[Enforcement] TEMP_COOLDOWN triggered")

  const exists = await redis.get(cdKey)

  if (exists) {
    await recordViolation(redis, parentId, apiKey)
    await emitEnforcementEvent(context, "BLOCK", "cooldown_active", 429)

    return res.status(429).json({
      error: "Cooldown active"
    })
  }

  await recordViolation(redis, parentId, apiKey)

  const cooldownSeconds = policy?.enforcement?.cooldownSeconds || 30

  await redis.set(cdKey, "1", {
    EX: cooldownSeconds
  })

  await emitEnforcementEvent(context, "BLOCK", "cooldown_start", 429)

  return res.status(429).json({
    error: "Cooldown initiated"
  })
}


// ---------- LIMIT_CONCURRENCY ----------
if (action === "LIMIT_CONCURRENCY") {
  await recordViolation(redis, parentId, apiKey)

  const raw = await redis.incr(cKey)
  const current = parseInt(raw, 10)

  if (isNaN(current)) {
    throw new Error("Invalid concurrency value")
  }

const MAX_CONCURRENCY = policy?.enforcement?.maxConcurrency || 5

  console.log("[Enforcement] LIMIT_CONCURRENCY current:", current)

  if (current > MAX_CONCURRENCY) {
  await redis.decr(cKey)

  await emitEnforcementEvent(context, "BLOCK", "concurrency_limit", 429)

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
  await recordViolation(redis, parentId, apiKey)

  console.log("[Enforcement] SOFT_THROTTLE delay applied")

  await delay(100)

  await emitEnforcementEvent(context, "THROTTLE", "soft_throttle", 200)

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
