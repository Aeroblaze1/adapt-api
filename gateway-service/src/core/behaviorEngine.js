function computeBehavior(context, policy) {
  const {
    frequencyDeviation,
    burstScore,
    recentViolations,
    endpointClass
  } = context

  const {
    riskWeights,
    thresholds,
    endpointWeights
  } = policy

  // ---------- Frequency Component ----------
  let frequencyRisk = 0

  if (frequencyDeviation > thresholds.frequencyDeviation) {
    frequencyRisk = frequencyDeviation
  }

  // ---------- Burst Component ----------
  let burstRisk = 0

  if (burstScore > thresholds.burst) {
  const excess = burstScore - thresholds.burst
  burstRisk = excess / thresholds.burst
}

  // ---------- Violation Escalation ----------
  let violationPenalty = 0

  if (recentViolations >= thresholds.violationCount) {
    violationPenalty = recentViolations * 0.2
  }

  // ---------- Weighted Composite ----------
  let baseRisk =
    (riskWeights.frequency * frequencyRisk) +
    (riskWeights.burst * burstRisk) +
    (riskWeights.violation * violationPenalty)

  const endpointWeight =
    endpointWeights[endpointClass] || 1

  let riskScore = baseRisk * endpointWeight

  // ---------- Clamp ----------
  if (riskScore > 1) riskScore = 1
  if (riskScore < 0) riskScore = 0

  // ---------- Anomaly Type ----------
if (recentViolations >= thresholds.violationCount * 2) {
  anomalyType = "repeat_abuse"
}
else if (burstRisk > 0) {
  anomalyType = "burst"
}
else if (frequencyRisk > 0) {
  anomalyType = "frequency"
}
else if (violationPenalty > 0) {
  anomalyType = "violation"
}
else {
  anomalyType = "normal"
}

  return {
    riskScore,
    anomalyType
  }
}

module.exports = computeBehavior