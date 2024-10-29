require('dotenv/config')

const Database = require('../../../../components/database')
const database = new Database()
const bcrypt = require('bcryptjs')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.AUTH_SECRET_KEY)

const page = 'account-page'

const pageError = {
  title: 'Erro de Recuperação',
  description: 'O Token enviado ao servidor não é valido!',
}
const databaseError = {
  title: 'Erro de Base de Dados',
  description: 'Occoreu um erro ao ligar à base de dados',
}
const expiredError = {
  title: 'Erro de Pedido Expirado',
  description: 'O prazo de 30 minutos para recuperar a conta acabou!',
}

module.exports = async (req, res) => {
  const { token } = req.params

  if (Cardinal(token)) {
    await database.Query(
      'SELECT TOKENS.USER FROM TOKENS WHERE TOKENS.TOKEN = ? AND TOKENS.ACTION = ?',
      [token, 'p'],
      (result, err) => {
        if (err) res.render(page, databaseError)
        else if (typeof result !== 'undefined' && result.length == 0)
          res.render(page, pageError)
        else {
          const date = new Date(parseInt(cryptr.decrypt(token)))
          if (new Date() > date) res.render(page, expiredError)
          else {
            const recovery = cryptr.encrypt(process.env.AUTH_SECRET_KEY)
            const recover = recovery.substr(0, 20)
            bcrypt.hash(
              recover,
              parseInt(process.env.AUTH_SALT),
              (errr, hash) => {
                if (errr) res.render(page, pageError)
                else {
                  const id = result[0]['USER']
                  database.Query(
                    'COMMIT; DELETE FROM TOKENS WHERE TOKENS.USER = ?; UPDATE ACCOUNTS SET ACCOUNTS.PASSWORD = ? WHERE ACCOUNTS.ID = ?; COMMIT;',
                    [id, hash, id],
                    (results, error) => {
                      if (error) res.render(page, databaseError)
                      else {
                        const pageSuccess = {
                          title: 'Recuperação da Conta',
                          description: 'Recupere agora a sua conta!',
                          success: true,
                          recover,
                        }
                        res.render(page, pageSuccess)
                      }
                    }
                  )
                }
              }
            )
          }
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
