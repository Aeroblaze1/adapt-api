const { MongoClient } = require("mongodb")

async function seed() {
  const client = new MongoClient("mongodb://localhost:27017")
  await client.connect()

  const db = client.db("adaptive_api_platform")

  await db.collection("providers").insertOne({
    _id: "parentA",
    name: "Parent A",
    status: "active",
    plan: {
      baselinePerMinute: 40//fallback to sla configured baseline
    },
    policyId: "policy_enterprise",
    upstreamUrl: "http://localhost:5000",
    createdAt: new Date()
  })

  await db.collection("api_keys").insertOne({
      _id: "ak_001",
    providerId: "parentA",
    status: "active",
    expectedBaseline: 40,//hardcoded initial baseline but SLA configurable
    baselineLastUpdatedAt: new Date(),
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
    admin: 2.0,
    org_sensitive: 1.8,
    write: 1.5 
    },
     decisionThresholds: {
    watch: 0.2,
    throttle: 0.4,
    restrict: 0.6,
    cooldown: 0.8,
    block: 0.95
  },
    endpointPatterns: [
    { pattern: "^/admin", class: "admin" },
    { pattern: "^/org/.*/finance", class: "org_sensitive" },
    { pattern: "POST:/users", class: "write" }
  ],
    cooldownSeconds: 30
  })

  console.log("Seed complete")
  process.exit()
}

seed()