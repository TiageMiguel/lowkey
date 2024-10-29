const Database = require('../../../../../components/database')
const database = new Database()

module.exports = (req, res) => {
  if (typeof req.session.userid !== 'undefined')
    req.session.destroy((err) => res.json({ success: 'success' }))
  else res.json({ error: '1' })
}
