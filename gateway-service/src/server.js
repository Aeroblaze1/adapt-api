require("dotenv").config()

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
const eventsMiddleware = require("./middleware/events")

/**
 * if sending repeated rapid requests, Each request reaches proxy, Proxy middleware attaches listeners, Listener count exceeds default (10), node memory leak event emitter warning
 */
const events = require("events")
events.defaultMaxListeners = 50


const app = express()
const PORT = Number(process.env.PORT || 4000)

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


app.use("/api", eventsMiddleware)


app.use("/api", enforcementMiddleware)


//mocking upstream or parent provider
const apiProxy = createProxyMiddleware({
  changeOrigin: true,
  pathRewrite: { "^/api": "" },
  router: (req) => {
    const context = req.requestContext
    if (!context || !context.upstreamUrl) {
      return null
    }
    return context.upstreamUrl
  }
})
//proxy instance creaeted once so listeners dont accumulate
app.use("/api", (req, res, next) => {
  const context = req.requestContext

  if (!context) {
    return res.status(500).json({ error: "Request context missing" })
  }

  if (!context.upstreamUrl) {
    return res.status(500).json({ error: "Upstream not resolved" })
  }

  if (context.clientFeedbackHeaders) {
    Object.entries(context.clientFeedbackHeaders)
      .forEach(([key, value]) => {
        res.setHeader(key, value)
      })
  }

// Artificial delay to force overlap
  // await new Promise(resolve => setTimeout(resolve, 500))

  return apiProxy(req, res, next)
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
