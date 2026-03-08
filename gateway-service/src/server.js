const express = require("express")
const { createProxyMiddleware } = require("http-proxy-middleware")

const app = express()
const PORT = 4000

app.use(express.json())

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" })
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

//mocking upstream or parent provider
app.use(
  "/api",
  createProxyMiddleware({
    target: "http://localhost:5000",
    changeOrigin: true,
    pathRewrite: {
      "^/api": "" //   /api/test -> /test at parent server
    }
  })
)

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`)
})