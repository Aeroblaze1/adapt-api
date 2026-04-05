require("dotenv").config()

const cors = require("cors")
const express = require("express")
const { connectMongo } = require("./config/mongo")

const providerRoutes = require("./routes/providers")
const apiKeyRoutes = require("./routes/apiKeys")
const riskRoutes = require("./routes/risk")
const alertRoutes = require("./routes/alerts")

const app = express()
const PORT = Number(process.env.PORT || 4500)

app.use(cors())
app.use(express.json())

app.get("/health", (req, res) => {
  res.json({ status: "ok" })
})

app.use("/providers", providerRoutes)
app.use("/api-keys", apiKeyRoutes)
app.use("/risk-history", riskRoutes)
app.use("/alerts", alertRoutes)

async function start() {
  await connectMongo()
  app.listen(PORT, () => {
    console.log(`Control API running on ${PORT}`)
  })
}

start()
