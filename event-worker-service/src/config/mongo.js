const { MongoClient } = require("mongodb")

let db

async function connectMongo() {
  const client = new MongoClient("mongodb://localhost:27017")
  await client.connect()
  db = client.db("adaptive_api_platform")
  console.log("Worker Mongo connected")
}

function getDb() {
  if (!db) throw new Error("Mongo not initialized")
  return db
}

module.exports = {
  connectMongo,
  getDb
}