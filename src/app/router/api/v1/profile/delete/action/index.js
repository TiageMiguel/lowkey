require('dotenv/config')

const Database = require('../../../../../../components/database')
const database = new Database()

module.exports = (req, res) => {
  const id = req.session.userid
  const { token } = req.body
  const action = 'd'

  const query_1 =
    'SELECT USER FROM TOKENS WHERE ID = ? AND TOKEN = ? AND ACTION = ?'
  database.Query(query_1, [id, token, action], (data, err) => {
    if (err) res.json({ database: err })
    else if ((data.lengh === 0 && data === null) || typeof data === 'undefined')
      res.json({ error: 1 })
    else {
      const query_2 = 'DELETE FROM ACCOUNTS WHERE ID = ?'
      database.Query(query_2, [id], (result, errr) => {
        if (errr) res.json({ database: errr })
        else req.session.destroy((err) => res.json({ success: 'success' }))
      })
    }
  })
}
