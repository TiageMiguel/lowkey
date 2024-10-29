require('dotenv/config')

const Database = require('../../../../../components/database')
const mailer = require('../../../../../components/mailer')
const Cryptr = require('cryptr')
const database = new Database()
const cryptr = new Cryptr(process.env.AUTH_SECRET_KEY)

module.exports = async (req, res) => {
  const { ianemail } = req.body

  await database.Query(
    'SELECT ACCOUNTS.ID, ACCOUNTS.EMAIL, TOKENS.ACTION FROM ACCOUNTS LEFT JOIN TOKENS ON ACCOUNTS.ID = TOKENS.USER WHERE ACCOUNTS.IAN = ? OR ACCOUNTS.EMAIL = ?',
    [ianemail, ianemail],
    (results, error) => {
      if (error) console.log(error)
      else {
        if (typeof results === 'undefined' || results.length === 0)
          res.json({ error: 1 })
        else {
          if (results[0]['ACTION'] == 'v') res.json({ error: 2 })
          else {
            const id = results[0]['ID']
            const email = results[0]['EMAIL']
            let date = Date.now()
            date += 30 * 60000
            const exptoken = cryptr.encrypt(date)
            database.Query(
              'REPLACE INTO TOKENS VALUES (?, ?, ?)',
              [id, exptoken, 'p'],
              (result, err) => {
                if (err) res.json({ database: err })
                else {
                  mailer.Send(
                    mailer.Options({
                      to: email,
                      subject: 'Lowkey - Recuperar a Palavra-Passe',
                      html: `<a href="http://localhost:3000/conta/recuperar/${exptoken}"> Clique Aqui</a><br>`,
                    })
                  )
                  res.json({ success: email })
                }
              }
            )
          }
        }
      }
    }
  )
}
