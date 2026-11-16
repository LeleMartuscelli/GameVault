
const argon2 = require('argon2')
const readline = require('node:readline')
const { stdin, stdout } = require('node:process')

const rl = readline.createInterface({
  input: stdin,
  output: stdout
})

rl.question('Digite sua senha administrativa: ', async (password) => {
  try {
    if (password.length < 12) {
      console.log('A senha deve ter pelo menos 12 caracteres.')
      return
    }

    const hash = await argon2.hash(password, {
      type: argon2.argon2id
    })

    console.log('\nHash gerado com sucesso:')
    console.log(hash)
  } catch (error) {
    console.error('Erro ao gerar hash:', error.message)
  } finally {
    rl.close()
  }
})
