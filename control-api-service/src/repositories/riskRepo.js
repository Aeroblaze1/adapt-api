const { getDb } = require("../config/mongo")

async function getRiskHistory(apiKey, limit = 100) {
  return getDb().collection("risk_history")
    .find({ apiKey })
    .sort({ timestamp: -1 })
    .limit(limit)
    .toArray()
}

module.exports = {
  getRiskHistory
}