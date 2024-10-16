require('dotenv/config')

const Database = require('../../../../../components/database')
const mailer = require('../../../../../components/mailer')
const bcrypt = require('bcryptjs')
const database = new Database()

const shuffle = '1234567890'

module.exports = async (req, res) => {
  const { ianemail, password } = req.body

  await database.Query(
    'SELECT ACCOUNTS.ID, ACCOUNTS.IAN, ACCOUNTS.EMAIL, ACCOUNTS.PASSWORD, TWOFA.USER, TOKENS.ACTION, MANAGERS.CLASS FROM ACCOUNTS LEFT JOIN TWOFA ON ACCOUNTS.ID = TWOFA.USER LEFT JOIN TOKENS ON ACCOUNTS.ID = TOKENS.USER LEFT JOIN MANAGERS ON ACCOUNTS.ID = MANAGERS.USER WHERE ACCOUNTS.IAN = ? OR ACCOUNTS.EMAIL = ?',
    [ianemail, ianemail],
    (results, error) => {
      if (error) res.json({ database: error })
      else {
        if (typeof results !== 'undefined' && results.length == 0)
          res.json({ error: 1 })
        else {
          const account = Account(
            results[0]['ID'],
            results[0]['IAN'],
            results[0]['EMAIL'],
            results[0]['PASSWORD'],
            results[0]['USER'],
            results[0]['ACTION'],
            results[0]['CLASS']
          )
          if (account.action == 'v') res.json({ error: 3 })
          else {
            bcrypt.compare(password, account.password, (err, result) => {
              if (err) res.json({ database: error })
              else if (result) {
                if (account.twofa == null) {
                  req.session.userid = account.id
                  req.session.useradmin = account.admin || null
                  res.json({ success: 'success' })
                } else {
                  const token = shuffle
                    .split('')
                    .sort(() => 0.5 - Math.random())
                    .join('')
                    .substring(1, 10)
                  database.Query(
                    'UPDATE TWOFA SET 2FATOKEN = ? WHERE USER = ?',
                    [token, account.id],
                    () => {
                      mailer.Send(
                        mailer.Options({
                          to: account.email,
                          subject: 'Lowkey - codigo de verificação',
                          html: `<p>Codigo de verificação: ${token}</p>`,
                        })
                      )
                      res.json({ twofa: account.ian })
                    }
                  )
                }
              } else res.json({ error: 2 })
            })
          }
        }
      }
    }
  )
}

Account = (id, ian, email, password, twofa, action, admin) => ({
  id,
  ian,
  email,
  password,
  twofa,
  action,
  admin,
})
