
const { Pool } = require('pg')
require('dotenv').config({
  path: require('path').resolve(__dirname, '../../.env')
})

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL não configurada')
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000
})

pool.on('error', (error) => {
  console.error('Erro inesperado na conexão com PostgreSQL:', error.message)
})

module.exports = pool
