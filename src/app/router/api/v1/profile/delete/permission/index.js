require('dotenv/config')

const Database = require('../../../../../../components/database')
const mailer = require('../../../../../../components/mailer')

const database = new Database()
const shuffle = '1234567890'

module.exports = (req, res) => {
  const id = req.session.userid
  const token = shuffle
    .split('')
    .sort(() => 0.5 - Math.random())
    .join('')
    .substring(1, 10)
  const action = 'd'

  const query_1 = 'INSERT INTO TOKENS (USER, TOKEN, ACTION) VALUES (?, ?, ?)'
  database.Query(query_1, [id, token, action], (result, err) => {
    if (err) res.json({ database: err })
    else {
      const query_2 = 'SELECT EMAIL FROM ACCOUNTS WHERE ID = ?'
      database.Query(query_2, [id], (data, errr) => {
        if (errr) res.json({ database: errr })
        else {
          const email = data[0].EMAIL
          mailer.Send(
            mailer.Options({
              to: email,
              subject: 'Lowkey - Apagar Conta (Importante)',
              html: `<p>Codigo de Segurança: ${token}</p>`,
            })
          )
          console.log(token)
          res.json({ success: 'success' })
        }
      })
    }
  })
}
