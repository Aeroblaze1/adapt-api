const computeDecision = require("../core/decisionEngine")
const { getPolicy } = require("../core/keyCache")

function decisionMiddleware(req, res, next) {
  const context = req.requestContext

  try {
    const policy = getPolicy(context.policyId)

    if (!policy) {
      context.enforcementStage = "NORMAL"
      context.enforcementAction = "ALLOW"
      context.clientFeedbackHeaders = {}
      return next()
    }

    const result = computeDecision(context, policy)

    context.enforcementStage = result.enforcementStage
    context.enforcementAction = result.enforcementAction
    context.clientFeedbackHeaders = result.clientFeedbackHeaders

    console.log(
  "[Decision]",
  "Parent:", context.providerId,
  "Key:", context.apiKey,
  "Risk:", context.riskScore.toFixed(3),
  "Stage:", context.enforcementStage,
  "Action:", context.enforcementAction
)

    next()
  } catch (err) {
    console.error("Decision engine failure")

    context.enforcementStage = "NORMAL"
    context.enforcementAction = "ALLOW"
    context.clientFeedbackHeaders = {}

    next()
  }
}

module.exports = decisionMiddleware