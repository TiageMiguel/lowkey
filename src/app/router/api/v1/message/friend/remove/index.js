require('dotenv/config')

const Database = require('../../../../../../components/database')
const database = new Database()

module.exports = async (req, res) => {
  const { token } = req.body

  const query = 'DELETE FROM FRIENDS WHERE TOKEN = ?'
  database.Query(query, [token], (data, errr) => {
    if (errr) res.json({ database: err })
    else if (data.affectedRows != 0) res.json({ success: token })
    else res.json({ error: '1' })
  })
}
