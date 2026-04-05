const { MongoClient } = require("mongodb")
const { requireEnv } = require("./env")

const MONGO_URL = requireEnv("MONGO_URL")
const DB_NAME = requireEnv("DB_NAME")

let db

async function connectMongo() {
  const client = new MongoClient(MONGO_URL)
  await client.connect()
  db = client.db(DB_NAME)
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
