const computeBehavior = require("../core/behaviorEngine")
const { getPolicy } = require("../core/keyCache")

function behaviorMiddleware(req, res, next) {
  const context = req.requestContext

  try {
    const policy = getPolicy(context.policyId)

    if (!policy) {
      context.riskScore = 0
      context.anomalyType = "normal"
      context.deviationScore = 0
      return next()
    }

    const result = computeBehavior(context, policy)

    context.deviationScore = result.deviationScore
    context.riskScore = result.riskScore
    context.anomalyType = result.anomalyType

    next()
  } catch (err) {
    console.error("Behavior engine failure — default safe")

    context.riskScore = 0
    context.anomalyType = "normal"
    context.deviationScore = 0

    next()
  }
}

module.exports = behaviorMiddleware