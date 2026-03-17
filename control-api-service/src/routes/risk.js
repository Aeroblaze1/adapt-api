const express = require("express")
const { getRiskHistory } = require("../repositories/riskRepo")

const router = express.Router()

router.get("/", async (req, res) => {
  const apiKey = req.query.apiKey
  if (!apiKey) return res.status(400).json({ error: "apiKey required" })

  const data = await getRiskHistory(apiKey)
  res.json(data)
})

module.exports = router