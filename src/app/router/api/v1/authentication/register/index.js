require('dotenv/config')

const Database = require('../../../../../components/database')
const mailer = require('../../../../../components/mailer')
const bcrypt = require('bcryptjs')
const Cryptr = require('cryptr')
const cryptr = new Cryptr(process.env.AUTH_SECRET_KEY)
const database = new Database()

module.exports = async (req, res) => {
  const { ian, name, email, password } = req.body

  await database.Query(
    'SELECT ACCOUNTS.IAN, ACCOUNTS.EMAIL, TOKENS.TOKEN FROM ACCOUNTS LEFT JOIN TOKENS ON ACCOUNTS.ID = TOKENS.USER WHERE ACCOUNTS.IAN = ? OR ACCOUNTS.EMAIL = ?',
    [ian, email],
    (data, err) => {
      if (err) res.json({ database: err })
      else if (data.length === 0) {
        bcrypt.hash(password, parseInt(process.env.AUTH_SALT), (errr, hash) => {
          if (errr) res.json({ error: 3 })
          else {
            let date = Date.now()
            date += 1000 * 60 * 60 * 24 * 10
            const token = cryptr.encrypt(date)
            database.Query(
              'INSERT INTO ACCOUNTS (IAN, NAME, EMAIL, PASSWORD) VALUES (?, ?, ?, ?)',
              [ian, name, email, hash, token],
              (result, error) => {
                if (error) res.json({ database: error })
                else if (result.insertId)
                  database.Query(
                    'INSERT INTO TOKENS (USER, TOKEN) VALUES (?, ?)',
                    [result.insertId, token],
                    (results, errorr) => {
                      if (errorr) res.json({ database: errorr })
                      else {
                        mailer.Send(
                          mailer.Options({
                            to: email,
                            subject: 'Lowkey - Confirme o seu registo',
                            html: `<p> Clique para confirmar a sua conta: </p>
										<a href="http://localhost:3000/conta/verificar/${token}"> Clique Aqui</a> <br>
										<p>Caso tenha recebido este email por erro, clique para apagar todos os dados referentes ao registo: </p>
										<a href="http://localhost:3000/conta/eliminar/${token}"> Clique aqui para Apagar </a>`,
                          })
                        )
                        res.json({ success: email })
                      }
                    }
                  )
              }
            )
          }
        })
      } else if (data[0]['EMAIL'] == email) res.json({ error: 1 })
      else if (data[0]['IAN'] == ian) res.json({ error: 2 })
    }
  )
}
