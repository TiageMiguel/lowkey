require('dotenv/config')

const Database = require('../../../../../../components/database')
const database = new Database()

module.exports = async (req, res) => {
  const id = req.session.userid
  const { token } = req.body

  const query = 'SELECT FRIEND FROM FRIENDS WHERE ME = ? AND TOKEN = ?'
  await database.Query(query, [id, token], (data, err) => {
    if (err) res.json({ database: err })
    else if (data.length != 0) {
      const query_1 = 'UPDATE FRIENDS SET STATUS = 2 WHERE TOKEN = ?'
      database.Query(query_1, [token], (data, err) => {
        if (err) res.json({ database: err })
        else if (data !== null && typeof data !== 'undefined')
          res.json({ success: 'success' })
      })
    } else res.json({ error: 1 })
  })
}
