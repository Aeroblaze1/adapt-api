const { getDb } = require("../config/mongo")

async function listApiKeys(providerId) {
  const filter = providerId ? { providerId } : {}

  return getDb().collection("api_keys")
    .find(filter)
    .project({
      _id: 1,
      providerId: 1,
      expectedBaseline: 1,
      baselineLastUpdatedAt: 1,
      status: 1
    })
    .toArray()
}

module.exports = {
  listApiKeys
}