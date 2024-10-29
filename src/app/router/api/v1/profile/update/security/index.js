require('dotenv/config')

const bcrypt = require('bcryptjs')

const Database = require('../../../../../../components/database')
const database = new Database()

module.exports = (req, res) => {
  const id = req.session.userid
  const { currentPassword, newPassword } = req.body

  const query_1 = 'SELECT PASSWORD FROM ACCOUNTS WHERE ID = ?'
  database.Query(query_1, [id], (data, err) => {
    if (err) res.json({ database: err })
    else {
      const password = data[0]['PASSWORD']

      bcrypt.compare(currentPassword, password, (errr, result) => {
        if (errr) res.json({ error: '1' }) // Erro de Servidor, Tente mais tarde
        if (!result)
          res.json({ error: '2' }) // A palavra-passe nao coicide com a sua.
        else {
          bcrypt.hash(
            newPassword,
            parseInt(process.env.AUTH_SALT),
            (error, hash) => {
              if (error) res.json({ error: '1' })
              else {
                const query_2 = 'UPDATE ACCOUNTS SET PASSWORD = ? WHERE ID = ?'
                database.Query(query_2, [hash, id], (results, errorr) => {
                  if (errorr) res.json({ database: err })
                  else res.json({ success: 'success' })
                })
              }
            }
          )
        }
      })
    }
  })
}
