function rateKey(parentId, apiKey) {
  return `rate:${parentId}:${apiKey}`
}

function burstKey(parentId, apiKey) {
  return `burst:${parentId}:${apiKey}`
}

function violationKey(parentId, apiKey) {
  return `violations:${parentId}:${apiKey}`
}

function endpointKey(parentId, apiKey) {
  return `endpoint:${parentId}:${apiKey}`
}

function concurrencyKey(parentId, apiKey) {
  return `concurrency:${parentId}:${apiKey}`
}

function cooldownKey(parentId, apiKey) {
  return `cooldown:${parentId}:${apiKey}`
}

module.exports = {
  rateKey,
  burstKey,
  violationKey,
  endpointKey,
  concurrencyKey,
  cooldownKey
}