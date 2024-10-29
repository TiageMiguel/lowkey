require('dotenv/config')

const Database = require('../../../../components/database')
const database = new Database()
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.AUTH_SECRET_KEY)

const page = 'account-page'

const pageError = {
  title: 'Erro de Verificação',
  description: 'O Token enviado ao servidor não é valido!',
}
const databaseError = {
  title: 'Erro de Base de Dados',
  description: 'Occoreu um erro ao ligar á base de dados',
}
const expiredError = {
  title: 'Erro de Conta Expirada',
  description:
    'O prazo de 10 dias para se registar acabou! Registre-se novamente!',
}
const pageSuccess = {
  title: 'Conta Verificada',
  description: 'A sua conta foi verificada com sucesso!',
  success: true,
}

module.exports = async (req, res) => {
  const { token } = req.params

  if (Cardinal(token)) {
    await database.Query(
      'SELECT TOKENS.USER FROM TOKENS WHERE TOKENS.TOKEN = ? AND TOKENS.ACTION = ?',
      [token, 'v'],
      (result, error) => {
        if (error) res.render(page, databaseError)
        else if (typeof result !== 'undefined' && result.length == 0)
          res.render(page, pageError)
        else {
          const date = new Date(parseInt(cryptr.decrypt(token)))
          if (new Date() > date) res.render(page, expiredError)
          else
            database.Query(
              'DELETE FROM TOKENS WHERE TOKENS.TOKEN = ?',
              [token],
              (results, errors) => {
                if (errors) res.render(page, databaseError)
                else res.render(page, pageSuccess)
              }
            )
        }
      }
    )
  } else res.render(page, pageError)
}

Cardinal = (token, status = true) => {
  if (token === null || typeof token === 'undefined') status = false
  if (token.length !== 58) status = false
  return status
}
