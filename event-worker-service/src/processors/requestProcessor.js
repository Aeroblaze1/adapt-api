const { getDb } = require("../config/mongo")

async function processRequestEvent(event) {
  const db = getDb()

  await db.collection("request_logs").updateOne(
    { requestId: event.requestId },
    { $setOnInsert: event },
    { upsert: true }
  )

  await db.collection("risk_history").insertOne({
    apiKey: event.apiKey,
    providerId: event.providerId,
    timestamp: new Date(event.timestamp),
    riskScore: event.analysis.riskScore
  })
}

module.exports = processRequestEvent