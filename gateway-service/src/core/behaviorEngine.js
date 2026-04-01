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
    const excess = frequencyDeviation - thresholds.frequencyDeviation
frequencyRisk = excess / (excess + 1)
  }

  // ---------- Burst Component ----------
  let burstRisk = 0

  if (thresholds.burst > 0 && burstScore > thresholds.burst) {
  const excess = burstScore - thresholds.burst
  burstRisk = excess / (excess + thresholds.burst)
}

  // ---------- Violation Escalation ----------
  let violationPenalty = 0

  if (recentViolations >= thresholds.violationCount) {
    violationPenalty = recentViolations / (recentViolations + 5)
  }

  // ---------- Weighted Composite ----------
  let baseRisk =
    (riskWeights.frequency * frequencyRisk) +
    (riskWeights.burst * burstRisk) +
    (riskWeights.violation * violationPenalty)

  baseRisk = Math.min(1, baseRisk)

  const endpointWeight =
    endpointWeights[endpointClass] || 1

  let riskScore = baseRisk * endpointWeight

  // ---------- Clamp ----------
  if (riskScore > 1) riskScore = 1
  if (riskScore < 0) riskScore = 0

  // ---------- Anomaly Type ----------

  let anomalyType = "normal"
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