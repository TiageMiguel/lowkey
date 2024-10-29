require('dotenv/config')

const Database = require('../../../../../../components/database')
const database = new Database()

module.exports = (req, res) => {
  const { token } = req.body

  const query = 'UPDATE FRIENDS WHERE TOKEN = ? SET STATUS = 2'
  database.Query(query, token, (data, err) => {
    if (err) res.json({ database: err })
    else {
      console.log(data)
      res.json({ success: 'success' })
    }
  })
}
