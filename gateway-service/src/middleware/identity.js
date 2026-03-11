const RequestContext = require("../../../shared/schemas/RequestContext")
const { getApiKey } = require("../core/keyCache")
const { getPolicy } = require("../core/keyCache")


function resolveEndpointClass(path, method, policy) {
  if (!policy || !policy._compiledPatterns) {
    return "public"
  }

  for (const p of policy._compiledPatterns) {
    if (p.regex.test(path) || p.regex.test(`${method}:${path}`)) {
      return p.class
    }
  }

  return "public"
}


function identityMiddleware(req, res, next) {
  const apiKey = req.headers["x-api-key"]

  if (!apiKey) {
    return res.status(401).json({ error: "API key missing" })
  }

  const keyData = getApiKey(apiKey)

  if (!keyData || keyData.status !== "active") {
    return res.status(403).json({ error: "Invalid API key" })
  }

  const policy = getPolicy(keyData.policyId)

const endpointClass = resolveEndpointClass(
  req.path,
  req.method,
  policy
)

/* endpoint detection debugging
console.log("---------------------");
console.log("Resolved class:", endpointClass);
console.log();
*/

  // Create initial RequestContext
const context = new RequestContext({
  requestId: generateRequestId(),
  timestamp: Date.now(),
  protocol: "REST",
  apiKey: apiKey,
  providerId: keyData.parentId,
  expectedBaseline: keyData.expectedBaseline,
  policyId: keyData.policyId,
  clientIp: req.ip,
  userAgent: req.headers["user-agent"],
  endpoint: req.path,
  endpointClass: endpointClass,
  httpMethod: req.method,
  payloadSize: parseInt(req.headers["content-length"] || "0"),
  headers: req.headers,
  upstreamUrl: keyData.upstreamUrl
})

  req.requestContext = context

  next()
}

function generateRequestId() {
  return "req_" + Math.random().toString(36).substring(2, 10)
}


module.exports = identityMiddleware