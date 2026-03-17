const { getDb } = require("../config/mongo")

async function listAlerts(providerId) {
  const filter = providerId ? { providerId } : {}

  return getDb().collection("alerts")
    .find(filter)
    .sort({ timestamp: -1 })
    .limit(200)
    .toArray()
}

module.exports = {
  listAlerts
}