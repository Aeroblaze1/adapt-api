const RequestContext = require("../../../shared/schemas/RequestContext")
const { getApiKey } = require("../core/keyCache")

function identityMiddleware(req, res, next) {
  const apiKey = req.headers["x-api-key"]

  if (!apiKey) {
    return res.status(401).json({ error: "API key missing" })
  }

  const keyData = getApiKey(apiKey)

  if (!keyData || keyData.status !== "active") {
    return res.status(403).json({ error: "Invalid API key" })
  }

  // Create initial RequestContext
  const context = new RequestContext({
    requestId: generateRequestId(),
    timestamp: Date.now(),
    protocol: "REST", // for now fixed
    apiKey: apiKey,
    providerId: keyData.parentId,
    clientIp: req.ip,
    userAgent: req.headers["user-agent"],
    endpoint: req.path,
    endpointClass: classifyEndpoint(req.path),
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

function classifyEndpoint(path) {
  if (path.includes("/admin")) return "admin"
  return "public"
}

module.exports = identityMiddleware