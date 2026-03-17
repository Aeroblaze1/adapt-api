const { getDb } = require("../config/mongo")

async function listProviders() {
  return getDb().collection("providers")
    .find({})
    .project({ _id: 1, name: 1, status: 1, plan: 1 })
    .toArray()
}

module.exports = {
  listProviders
}