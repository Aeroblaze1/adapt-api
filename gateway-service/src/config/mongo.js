const { MongoClient } = require("mongodb")
const { requireEnv } = require("./env")

const MONGO_URL = requireEnv("MONGO_URL")
const DB_NAME = requireEnv("DB_NAME")

let client
let db

async function connectMongo() {
  client = new MongoClient(MONGO_URL)
  await client.connect()
  db = client.db(DB_NAME)
  console.log("Mongo connected")
}

function getDb() {
  if (!db) {
    throw new Error("Mongo not initialized")
  }
  return db
}

module.exports = {
  connectMongo,
  getDb
}
