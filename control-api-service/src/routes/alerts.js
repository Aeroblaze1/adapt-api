const express = require("express")
const { listAlerts } = require("../repositories/alertRepo")

const router = express.Router()

router.get("/", async (req, res) => {
  const providerId = req.query.providerId
  const data = await listAlerts(providerId)
  res.json(data)
})

module.exports = router