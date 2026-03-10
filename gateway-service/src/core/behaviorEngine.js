function computeBehavior(context, policy) {
  const {
    requestRateLast60s,
    burstScore,
    recentViolations,
    endpointClass
  } = context

  const {
    riskWeights,
    thresholds,
    endpointWeights
  } = policy

  // ----- Frequency Deviation -----
  const expectedBaseline = context.expectedBaseline || 1
  const normalizedFrequency =
    requestRateLast60s / expectedBaseline

  const frequencyDeviation =
    normalizedFrequency > thresholds.frequencyDeviation
      ? normalizedFrequency
      : 0

  // ----- Burst -----
  const burstAnomaly =
    burstScore > thresholds.burst
      ? burstScore
      : 0

  // ----- Violation Escalation -----
  const violationPenalty =
    recentViolations >= thresholds.violationCount
      ? recentViolations * 0.2
      : 0

  // ----- Composite Risk -----
  let baseRisk =
    (riskWeights.frequency * frequencyDeviation) +
    (riskWeights.burst * burstAnomaly) +
    (riskWeights.violation * violationPenalty)

  const endpointWeight =
    endpointWeights[endpointClass] || 1

  let riskScore = baseRisk * endpointWeight

  if (riskScore > 1) riskScore = 1
  if (riskScore < 0) riskScore = 0

  // ----- Determine anomaly type -----
  let anomalyType = "normal"

  if (burstAnomaly > 0) anomalyType = "burst"
  else if (frequencyDeviation > 0) anomalyType = "frequency"
  else if (violationPenalty > 0) anomalyType = "violation"

  return {
    deviationScore: normalizedFrequency,
    riskScore,
    anomalyType
  }
}

module.exports = computeBehavior