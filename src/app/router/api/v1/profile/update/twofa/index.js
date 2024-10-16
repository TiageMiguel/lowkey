require('dotenv/config')

const bcrypt = require('bcryptjs')
const Database = require('../../../../../../components/database')
const database = new Database()

module.exports = async (req, res) => {
  const id = req.session.userid
  const { password } = req.body

  if (PasswordCardinal(password)) {
    const query = 'SELECT ACCOUNTS.PASSWORD FROM ACCOUNTS WHERE ACCOUNTS.ID = ?'
    await database.Query(query, [id], (data, err) => {
      if (err) res.json({ database: err })
      if (data.length > 0)
        bcrypt.compare(password, data[0]['PASSWORD'], (errr, equals) => {
          if (errr) res.json({ database: err })
          else if (equals) GenerateTwoFa(res, id)
          else res.json({ error: 1 })
        })
    })
  } else res.json({ error: 1 })
}
PasswordCardinal = (password, status = true) => {
  if (password.length < 5) status = false
  return status
}

GenerateTwoFa = async (res, id) => {
  const query_1 = 'SELECT USER FROM TWOFA WHERE USER = ?'
  await database.Query(query_1, [id], (data, err) => {
    if (err) res.json({ database: err })
    else if (typeof data == 'undefined' || data == null || data.length == 0)
      ActivateTwoFa(res, id)
    else DesactivateTwoFa(res, id)
  })
}

ActivateTwoFa = async (res, id) => {
  const query = 'INSERT INTO TWOFA (USER) VALUES (?)'
  await database.Query(query, [id], (data, err) => {
    if (err) res.json({ database: err })
    else res.json({ success: 'activated' })
  })
}

DesactivateTwoFa = async (res, id) => {
  const query = 'DELETE FROM TWOFA WHERE USER = ?'
  await database.Query(query, [id], (data, err) => {
    if (err) res.json({ database: err })
    else res.json({ success: 'desactivated' })
  })
}
