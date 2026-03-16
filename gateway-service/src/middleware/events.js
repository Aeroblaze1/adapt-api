const { publishEvent } = require("../events/eventPublisher")

function eventsMiddleware(req, res, next) {
  const context = req.requestContext

  res.on("finish", () => {
    const event = buildEvent(context)
    publishEvent(event)
  })

  next()
}

function buildEvent(context) {
  return {
    eventType: "request_processed",
    version: 1,
    timestamp: Date.now(),

    providerId: context.providerId,
    apiKey: context.apiKey,

    requestId: context.requestId,
    endpoint: context.endpoint,
    endpointClass: context.endpointClass,
    httpMethod: context.httpMethod,

    metrics: {
      requestRateLast60s: context.requestRateLast60s,
      burstScore: context.burstScore,
      recentViolations: context.recentViolations,
      frequencyDeviation: context.frequencyDeviation
    },

    analysis: {
      riskScore: context.riskScore,
      anomalyType: context.anomalyType
    },

    decision: {
      stage: context.enforcementStage,
      action: context.enforcementAction
    }
  }
}

module.exports = eventsMiddleware