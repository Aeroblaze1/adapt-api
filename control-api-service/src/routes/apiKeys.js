const express = require("express")
const { listApiKeys } = require("../repositories/apiKeyRepo")

const router = express.Router()

router.get("/", async (req, res) => {
  const providerId = req.query.providerId
  const data = await listApiKeys(providerId)
  res.json(data)
})

module.exports = router