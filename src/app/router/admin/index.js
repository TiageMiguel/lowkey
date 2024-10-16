require('dotenv/config')

const router = require('express').Router()
const middlewares = require('../../middlewares')
const Database = require('../../components/database')
const database = new Database()

router.get('/', middlewares.isLoggedInAdmin, (req, res) =>
  GenerateAdmin(req, res)
)
router.get('/:build-dist', middlewares.isLoggedInAdmin, (req, res) =>
  GenerateAdmin(req, res)
)

const GenerateAdmin = (req, res, appbuild = true) => {
  const id = req.session.userid

  const { params } = req
  if (Object.entries(params).length === 0 && params.constructor === Object) {
    appbuild = false
  }

  database.Query(
    'SELECT ACCOUNTS.ID, ACCOUNTS.NAME, ACCOUNTS.IAN, ACCOUNTS.EMAIL, ACCOUNTS.STATUS, ACCOUNTS.CREATED, TWOFA.USER, UPLOADS.SOURCE FROM ACCOUNTS LEFT JOIN TWOFA ON ACCOUNTS.ID = TWOFA.USER LEFT JOIN PICTURES ON ACCOUNTS.ID = PICTURES.USER LEFT JOIN UPLOADS ON UPLOADS.ID = PICTURES.PHOTO WHERE ACCOUNTS.ID = ?',
    [id],
    (data, err) => {
      if (err) res.redirect('/')
      else {
        const profile = {
          id: data[0].ID,
          name: data[0].NAME,
          ian: data[0].IAN,
          email: data[0].EMAIL,
          created: data[0].CREATED,
          twofa: data[0].USER,
          picture: data[0].SOURCE || 'default.png',
          admin: true,
        }

        const QUERY_2 =
          'SELECT COUNT(ID) AS MEMBERS, (SELECT COUNT(DISTINCT STORAGE.ONLINE.USER) FROM STORAGE.ONLINE) AS ONLINES, (SELECT COUNT(STORAGE.MESSAGES.ID) FROM STORAGE.MESSAGES) AS MESSAGES, (SELECT COUNT(STORAGE.UPLOADS.ID) FROM STORAGE.UPLOADS) AS FILES FROM ACCOUNTS'
        database.Query(QUERY_2, [], (results, errr) => {
          if (errr) res.redirect('/')
          else {
            const aplication = {
              members: results[0].MEMBERS,
              online: results[0].ONLINES,
              messages: results[0].MESSAGES,
              files: results[0].FILES,
            }
            res.render('admin', { profile, aplication, appbuild })
          }
        })
      }
    }
  )
}

module.exports = router
