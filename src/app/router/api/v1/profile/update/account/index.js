require('dotenv/config')

const Database = require('../../../../../../components/database')
const database = new Database()

module.exports = async (req, res) => {
  const { ian, name, email } = req.body
  const id = req.session.userid

  const query_1 = 'SELECT ID FROM ACCOUNTS WHERE IAN = ?'
  await database.Query(query_1, [ian], (result, err) => {
    if (err) res.json({ database: err })
    else if (result.length > 0 && result[0].ID !== id) res.json({ error: 1 })
    else {
      const query_2 = 'SELECT ID FROM ACCOUNTS WHERE EMAIL = ?'
      database.Query(query_2, [email], (results, errr) => {
        if (errr) res.json({ database: errr })
        else if (results.length > 0 && results[0].ID !== id)
          res.json({ error: 2 })
        else {
          const query_3 =
            'UPDATE ACCOUNTS SET IAN = ?, NAME = ?, EMAIL = ? WHERE ID = ?'
          database.Query(query_3, [ian, name, email, id], (data, erro) => {
            if (erro) res.json({ database: erro })
            else {
              if (req.file) {
                const source = req.file.filename
                const original = req.file.originalname
                const query_4 =
                  'INSERT INTO UPLOADS (USER, SOURCE, NAME) VALUES (?, ?, ?)'
                database.Query(
                  query_4,
                  [id, source, original],
                  (datasource, error) => {
                    if (error) res.json({ database: error })
                    else {
                      const query_5 = 'REPLACE INTO PICTURES VALUES (?, ?)'
                      database.Query(
                        query_5,
                        [id, datasource.insertId],
                        (datalast, errorr) => {
                          if (errorr) res.json({ database: errorr })
                          else res.json({ success: 'success' })
                        }
                      )
                    }
                  }
                )
              } else res.json({ success: 'success' })
            }
          })
        }
      })
    }
  })
}
