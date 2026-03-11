const computeBehavior = require("../core/behaviorEngine")
const { getPolicy } = require("../core/keyCache")

function behaviorMiddleware(req, res, next) {
  const context = req.requestContext

  try {
    const policy = getPolicy(context.policyId)

    if (!policy) {
      context.riskScore = 0
      context.anomalyType = "normal"
      return next()
    }

    const result = computeBehavior(context, policy)

    context.riskScore = result.riskScore
    context.anomalyType = result.anomalyType

    // ✅ TEMPORARY DEBUG LOG
    console.log(
      "[Behavior]",
      "Parent:", context.providerId,
      "Key:", context.apiKey,
      "Rate:", context.requestRateLast60s,
      "Deviation:", context.frequencyDeviation.toFixed(2),
      "Burst:", context.burstScore,
      "Violations:", context.recentViolations,
      "Risk:", context.riskScore.toFixed(3),
      "Anomaly:", context.anomalyType
    )

    next()
  } catch (err) {
    console.error("Behavior engine error")

    context.riskScore = 0
    context.anomalyType = "normal"

    next()
  }
}

module.exports = behaviorMiddleware