require('dotenv/config')

const Database = require('../../../../../../components/database')
const database = new Database()

module.exports = async (req, res) => {
  const { twofa, ian } = req.body

  if (cardinal(twofa)) {
    await database.Query(
      'SELECT ACCOUNTS.ID, TWOFA.2FATOKEN FROM ACCOUNTS LEFT JOIN TWOFA ON ACCOUNTS.ID = TWOFA.USER WHERE ACCOUNTS.IAN = ?',
      [ian],
      (result, error) => {
        if (error) res.json({ database: error })
        else if (
          (typeof result !== 'undefined' && result.length == 0) ||
          twofa !== result[0]['2FATOKEN']
        )
          res.json({ error: 1 })
        else {
          req.session.userid = result[0]['ID']
          res.json({ success: 'success' })
        }
      }
    )
  }
}

cardinal = (twofa, status = true) => {
  if (twofa === null || twofa === undefined || twofa.length === 0)
    status = false
  if (twofa.length != 9) status = false
  return status
}
