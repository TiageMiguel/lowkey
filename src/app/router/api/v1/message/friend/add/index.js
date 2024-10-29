require('dotenv/config')

const emailValidator = require('email-validator')
const bcrypt = require('bcryptjs')
const Database = require('../../../../../../components/database')
const database = new Database()

module.exports = (req, res) => {
  const id = req.session.userid
  const { name } = req.body

  let query_1 = 'SELECT ID FROM ACCOUNTS WHERE IAN = ?'
  if (emailValidator.validate(name))
    query_1 = 'SELECT ID FROM ACCOUNTS WHERE EMAIL = ?'

  database.Query(query_1, [name], (data, err) => {
    if (err) res.json({ database: err })
    else {
      if (typeof data == 'undefined' || data == null || data.length == 0)
        res.json({ error: '1' }) // Essa conta não existe!
      else {
        const friend = data[0]['ID']
        if (friend == id) res.json({ error: '2' })
        else {
          const query_2 = 'SELECT ME FROM FRIENDS WHERE ME = ? AND FRIEND = ?'
          database.Query(query_2, [id, friend], (results, erro) => {
            if (erro) res.json({ database: erro })
            else {
              if (
                typeof results == 'undefined' ||
                results == null ||
                results.length == 0
              ) {
                let key = id + friend
                bcrypt.hash(
                  key.toString(),
                  parseInt(process.env.AUTH_SALT),
                  (err, hash) => {
                    const query_3 =
                      'INSERT INTO FRIENDS (ME, FRIEND, TOKEN, ACTION) VALUES (?, ?, ?, ?), (?, ?, ?, ?)'
                    database.Query(
                      query_3,
                      [id, friend, hash, id, friend, id, hash, id],
                      (result, error) => {
                        if (error) res.json({ database: error })
                        else res.json({ success: { hash, friend } })
                      }
                    )
                  }
                )
              } else res.json({ error: '3' }) // já sao amigos!{
            }
          })
        }
      }
    }
  })
}

/* Status
 *  '1' Pending
 *  '2' Accepcted
 *  '3' Blocked
 */

// Ver se já são amigos! Se já erro;
// Adicionar como amigo, e status = 1;

//  const query1 = 'SELECT storage.accounts.IAN, storage.accounts.NAME FROM storage.relation INNER JOIN storage.accounts ON storage.relation.FRIEND = storage.accounts.ID AND storage.relation.ME = ?';
