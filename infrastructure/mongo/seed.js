const { MongoClient } = require("mongodb")

async function seed() {
  const client = new MongoClient("mongodb://localhost:27017")
  await client.connect()

  const db = client.db("adaptive_api_platform")

  await db.collection("providers").insertOne({
    _id: "parentA",
    name: "Parent A",
    tier: "enterprise",
    status: "active",
    policyId: "policy_enterprise",
    upstreamUrl: "http://localhost:5000",
    createdAt: new Date()
  })

  await db.collection("api_keys").insertOne({
    _id: "ak_001",
    providerId: "parentA",
    status: "active",
    expectedBaseline: 40,
    createdAt: new Date()
  })

  await db.collection("policies").insertOne({
    _id: "policy_enterprise",
    riskWeights: {
      frequency: 0.5,
      burst: 0.3,
      violation: 0.2
    },
    thresholds: {
      frequencyDeviation: 1.5,
      burst: 1.0,
      violationCount: 3
    },
    endpointWeights: {
      public: 1.0,
      admin: 2.0
    },
    cooldownSeconds: 30
  })

  console.log("Seed complete")
  process.exit()
}

seed()