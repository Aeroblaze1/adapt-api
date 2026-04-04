const { MongoClient } = require("mongodb")

async function seed() {
  const client = new MongoClient("mongodb://localhost:27017")
  await client.connect()

  const db = client.db("adaptive_api_platform")
  const now = new Date()

  await db.collection("policies").updateOne(
    { _id: "policy_enterprise" },
    {
      $set: {
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
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  )

  await db.collection("providers").updateOne(
    { _id: "parentA" },
    {
      $set: {
        name: "Parent A",
        status: "active",
        plan: {
          baselinePerMinute: 40
        },
        policyId: "policy_enterprise",
        upstreamUrl: "http://localhost:5000"
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  )

  await db.collection("providers").updateOne(
    { _id: "parentB" },
    {
      $set: {
        name: "Parent B",
        status: "active",
        plan: {
          baselinePerMinute: 500
        },
        policyId: "policy_enterprise",
        upstreamUrl: "http://localhost:5000"
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  )

  await db.collection("api_keys").updateOne(
    { _id: "ak_001" },
    {
      $set: {
        providerId: "parentA",
        status: "active",
        expectedBaseline: 40,
        baselineLastUpdatedAt: now
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  )

  await db.collection("api_keys").updateOne(
    { _id: "ak_002" },
    {
      $set: {
        providerId: "parentA",
        status: "active",
        expectedBaseline: 55,
        baselineLastUpdatedAt: now
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  )

  await db.collection("api_keys").updateOne(
    { _id: "ak_101" },
    {
      $set: {
        providerId: "parentB",
        status: "active",
        expectedBaseline: 600,
        baselineLastUpdatedAt: now
      },
      $setOnInsert: {
        createdAt: now
      }
    },
    { upsert: true }
  )

  console.log("Seed complete: parentA(ak_001, ak_002) and parentB(ak_101)")
  await client.close()
}

seed().catch((err) => {
  console.error("Seed failed:", err)
  process.exit(1)
})
