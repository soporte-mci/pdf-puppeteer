require('dotenv').config({ path: './config/.env' })
const { MongoClient } = require('mongodb')
const uri = process.env.mongoUri
const { mongoClient } = new MongoClient(uri)

module.exports = mongoClient
