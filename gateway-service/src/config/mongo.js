const { MongoClient } = require("mongodb")

const MONGO_URL = "mongodb://localhost:27017"
const DB_NAME = "adaptive_api_platform"

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