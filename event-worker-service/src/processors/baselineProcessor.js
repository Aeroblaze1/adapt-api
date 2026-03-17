const { getDb } = require("../config/mongo")

async function recomputeBaselines() {
  const db = getDb()

  const keys = await db.collection("api_keys").find().toArray()

  for (const key of keys) {
    const provider = await db.collection("providers")
      .findOne({ _id: key.providerId })

    const sla = provider.plan.baselinePerMinute

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const total = await db.collection("request_logs")
      .countDocuments({
        apiKey: key._id,
        timestamp: { $gte: since }
      })

    const movingAverage = total / (24 * 60)

    const capped = Math.min(movingAverage, sla * 3)

    const effectiveBaseline = Math.max(sla, capped)

    await db.collection("api_keys").updateOne(
      { _id: key._id },
      {
        $set: {
          expectedBaseline: effectiveBaseline,
          baselineLastUpdatedAt: new Date()
        }
      }
    )
  }
}

module.exports = recomputeBaselines