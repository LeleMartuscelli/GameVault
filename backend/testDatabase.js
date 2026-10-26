
const pool = require('./src/config/database')

async function testDatabase() {
  try {
    const result = await pool.query(`
      SELECT
        id,
        title,
        platform,
        hours_played,
        times_completed,
        achievements,
        status,
        favorite
      FROM games
      ORDER BY id
    `)

    console.log('Conexão com PostgreSQL realizada com sucesso!')
    console.table(result.rows)
  } catch (error) {
    console.error('Erro ao conectar ao PostgreSQL:', error.message)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

testDatabase()
