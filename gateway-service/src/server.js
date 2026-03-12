const express = require("express")
const { createProxyMiddleware } = require("http-proxy-middleware")
const { connectMongo } = require("./config/mongo")
const { loadCaches, getApiKey, getPolicy, getAllCaches } = require("./core/keyCache")
const identityMiddleware = require("./middleware/identity")
const { connectRedis } = require("./config/redis")
const metricsMiddleware = require("./middleware/metrics")
const behaviorMiddleware = require("./middleware/behavior")
const decisionMiddleware = require("./middleware/decision")
const enforcementMiddleware = require("./middleware/enforcement")


const app = express()
const PORT = 4000

app.use(express.json())

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
})

//debugging endpoint dev only
app.get("/debug/caches", (req, res) => {
  res.json(getAllCaches())
})

//simple logging middleware
app.use((req, res, next) => {
  const start = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - start
    console.log(
      `${req.method} ${req.originalUrl} - ${res.statusCode} status code took : ${duration}ms`
    )
  })

  next()
})


app.use("/api", identityMiddleware)

//identity->metrics->proxy
app.use("/api", metricsMiddleware)

app.use("/api", behaviorMiddleware)

app.use("/api", decisionMiddleware)

app.use("/api", enforcementMiddleware)


//mocking upstream or parent provider
app.use("/api", (req, res, next) => {
  const context = req.requestContext

  if (!context) {
    return res.status(500).json({ error: "Request context missing" })
  }

  if (!context.upstreamUrl) {
    return res.status(500).json({ error: "Upstream not resolved" })
  }

  // ---- Attach Decision Headers ----
  if (context.clientFeedbackHeaders) {
    Object.entries(context.clientFeedbackHeaders)
      .forEach(([key, value]) => {
        res.setHeader(key, value)
      })
  }

  // ---- Proxy Forward ----
  const proxy = createProxyMiddleware({
    target: context.upstreamUrl,
    changeOrigin: true,
    pathRewrite: { "^/api": "" }
  })

  return proxy(req, res, next)
})

async function start() {
  await connectMongo()
  await connectRedis()
  await loadCaches()

  app.listen(PORT, () => {
    console.log(`Gateway running on port ${PORT}`)
  })

  setInterval(async () => {
    try {
      await loadCaches()
      console.log("Cache refreshed")
    } catch (err) {
      console.error("Cache refresh failed")
    }
  }, 60000)
}

start()
