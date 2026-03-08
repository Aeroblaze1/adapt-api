const { getDb } = require("../config/mongo")

let apiKeyCache = {}
let providerCache = {}
let policyCache = {}

async function loadCaches() {
  const db = getDb()

  const providers = await db.collection("providers").find({ status: "active" }).toArray()
  const keys = await db.collection("api_keys").find({ status: "active" }).toArray()
  const policies = await db.collection("policies").find({}).toArray()

  providers.forEach(p => {
    providerCache[p._id] = p
  })

  policies.forEach(pol => {
    policyCache[pol._id] = pol
  })

  keys.forEach(k => {
    const provider = providerCache[k.providerId]
    if (!provider) return

    apiKeyCache[k._id] = {
      apiKey: k._id,
      parentId: k.providerId,
      expectedBaseline: k.expectedBaseline,
      policyId: provider.policyId,
      upstreamUrl: provider.upstreamUrl,
      status: k.status
    }
  })

  console.log("Caches loaded")

}

function getApiKey(key) {
  return apiKeyCache[key]
}

function getPolicy(policyId) {
  return policyCache[policyId]
}

//debugging only
function getAllCaches() {
  return {
    apiKeyCache,
    providerCache,
    policyCache
  }
}

module.exports = {
  loadCaches,
  getApiKey,
  getPolicy,
  getAllCaches
}