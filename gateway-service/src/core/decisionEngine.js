function computeDecision(context, policy) {
  const { riskScore, anomalyType, recentViolations } = context
  const { decisionThresholds, thresholds } = policy

  const {
    watch,
    throttle,
    restrict,
    cooldown,
    block
  } = decisionThresholds

  let enforcementStage = "NORMAL"

  // ---------- Risk-Based Mapping ----------
  if (riskScore >= block) {
    enforcementStage = "BLOCK"
  } else if (riskScore >= cooldown) {
    enforcementStage = "COOLDOWN"
  } else if (riskScore >= restrict) {
    enforcementStage = "RESTRICT"
  } else if (riskScore >= throttle) {
    enforcementStage = "THROTTLE"
  } else if (riskScore >= watch) {
    enforcementStage = "WATCH"
  } else {
    enforcementStage = "NORMAL"
  }

  // ---------- Escalation Rules ----------
  if (anomalyType === "repeat_abuse") {
    if (enforcementStage === "NORMAL" || enforcementStage === "WATCH") {
      enforcementStage = "RESTRICT"
    }
  }

  if (recentViolations >= thresholds.violationCount * 2) {
    enforcementStage = "COOLDOWN"
  }

  // ---------- Stage → Action ----------
  const enforcementAction = mapStageToAction(enforcementStage)

  // ---------- Client Headers ----------
  const clientFeedbackHeaders = {
    "X-Risk-Score": riskScore.toFixed(4),
    "X-Enforcement-Stage": enforcementStage,
    "X-Anomaly-Type": anomalyType,
    "X-Rate-Deviation": context.frequencyDeviation.toFixed(4)
  }

  return {
    enforcementStage,
    enforcementAction,
    clientFeedbackHeaders
  }
}

function mapStageToAction(stage) {
  switch (stage) {
    case "NORMAL":
      return "ALLOW"
    case "WATCH":
      return "ALERT_ONLY"
    case "THROTTLE":
      return "SOFT_THROTTLE"
    case "RESTRICT":
      return "LIMIT_CONCURRENCY"
    case "COOLDOWN":
      return "TEMP_COOLDOWN"
    case "BLOCK":
      return "BLOCK_TEMP"
    default:
      return "ALLOW"
  }
}

module.exports = computeDecision