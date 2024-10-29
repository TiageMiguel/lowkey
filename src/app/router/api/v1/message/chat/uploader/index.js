const Database = require('../../../../../../components/database')
const database = new Database()

module.exports = (req, res) => {
  const { token } = req.body
  const id = req.session.userid

  const query_1 = 'INSERT INTO UPLOADS (USER, SOURCE, NAME) VALUES (?, ?, ?)'
  const query_2 = 'INSERT INTO FILES (SENDER, TOKEN, FILE) VALUES (?, ?, ?)'

  if (!req.file) res.json({ error: 1 })
  else {
    const source = req.file.filename
    const original = req.file.originalname
    database.Query(query_1, [id, source, original], (data, err) => {
      if (err) res.json({ database: err })
      else
        database.Query(query_2, [id, token, data.insertId], (result, errr) => {
          if (errr) res.json({ database: errr })
          else res.json({ success: { source, original } })
        })
    })
  }
}
