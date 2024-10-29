const Database = require('../../../../../../components/database')
const database = new Database()

module.exports = (req, res) => {
  const { token } = req.body

  const query_1 =
    'SELECT SENDER, MESSAGE, DATE FROM MESSAGES WHERE TOKEN = ? ORDER BY DATE'
  database.Query(query_1, [token], (data, err) => {
    let messages = new Array()

    if (err) res.json({ database: err })
    else if (typeof data !== 'undefined' && data !== null && data.length > 0)
      data.forEach((element) => messages.push(element))

    const query_2 =
      'SELECT SENDER, SOURCE, DATE, UPLOADS.NAME FROM FILES LEFT JOIN UPLOADS ON UPLOADS.ID = FILES.FILE WHERE TOKEN = ? ORDER BY DATE'
    database.Query(query_2, [token], (results, errr) => {
      if (err) res.json({ database: err })
      else if (data.length === 0 && results.length === 0) res.json({ error: 1 })
      else if (
        typeof results !== 'undefined' &&
        results !== null &&
        results.length > 0
      )
        results.forEach((element) => messages.push(element))
      if (data.length !== 0 || results.length !== 0) {
        messages.sort((x, y) => x.DATE - y.DATE)
        res.json({ success: messages })
      }
    })
  })
}
