const express = require("express")
const { listProviders } = require("../repositories/providerRepo")

const router = express.Router()

router.get("/", async (req, res) => {
  const data = await listProviders()
  res.json(data)
})

module.exports = router