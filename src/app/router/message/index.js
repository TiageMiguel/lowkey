require('dotenv/config')

const router = require('express').Router()
const middlewares = require('../../middlewares')
const browser = require('browser-detect')
const Database = require('../../components/database')
const database = new Database()

const query_3 = 'UPDATE ACCOUNTS SET ONLINE = 1 WHERE ID = ?'
const query_4 = 'SELECT * FROM ONLINE WHERE USER = ?'

router.get('/', middlewares.isLoggedInMessage, (req, res) =>
  GenerateApp(req, res)
)
router.get('/:build-dist', middlewares.isLoggedInMessage, (req, res) =>
  GenerateApp(req, res)
)

GenerateApp = (req, res, appBuild = true) => {
  const id = req.session.userid
  const admin = req.session.useradmin !== null ? true : false

  const userSessionID = req.sessionID

  const { params } = req
  if (Object.entries(params).length === 0 && params.constructor === Object)
    appBuild = false

  database.Query(
    'SELECT ACCOUNTS.ID, ACCOUNTS.NAME, ACCOUNTS.IAN, ACCOUNTS.EMAIL, ACCOUNTS.STATUS, ACCOUNTS.CREATED, TWOFA.USER, UPLOADS.SOURCE FROM ACCOUNTS LEFT JOIN TWOFA ON ACCOUNTS.ID = TWOFA.USER LEFT JOIN PICTURES ON ACCOUNTS.ID = PICTURES.USER LEFT JOIN UPLOADS ON UPLOADS.ID = PICTURES.PHOTO WHERE ACCOUNTS.ID = ?',
    [id],
    (data, err) => {
      if (err) handleError(req, res)
      else {
        database.Query(
          'SELECT ACCOUNTS.NAME, ACCOUNTS.IAN, ACCOUNTS.ONLINE, ACCOUNTS.STATUS AS CLASS, FRIENDS.TOKEN, FRIENDS.ACTION, FRIENDS.STATUS, UPLOADS.SOURCE FROM FRIENDS LEFT JOIN ACCOUNTS ON FRIENDS.FRIEND = ACCOUNTS.ID LEFT JOIN PICTURES ON FRIENDS.FRIEND = PICTURES.USER LEFT JOIN UPLOADS ON UPLOADS.ID = PICTURES.PHOTO WHERE FRIENDS.ME = ? GROUP BY ACCOUNTS.ID',
          [id],
          (results, errr) => {
            if (errr) handleError(req, res)
            else {
              database.Query(query_3, [id], (result, error) => {
                if (error) handleError(req, res)
                else
                  database.Query(query_4, [id], (sessionData, errors) => {
                    if (errors) handleError(req, res)
                    else {
                      const profile = createProfile(
                        data[0],
                        userSessionID,
                        admin
                      )
                      const friends = createFriends(results, id)
                      const sessions = createSessions(
                        sessionData,
                        userSessionID,
                        browser(req.headers['user-agent'])
                      )

                      res.render('message', {
                        profile,
                        friends,
                        sessions,
                        appBuild,
                      })
                    }
                  })
              })
            }
          }
        )
      }
    }
  )
}
handleError = (req, res) => {
  Console.log('Database Error!')
  if (typeof req.session.userid !== 'undefined')
    req.session.destroy((err) => res.redirect('/'))
  else res.redirect('/')
}
createProfile = (profile, sessionID, admin) => {
  const { ID, NAME, IAN, EMAIL, CREATED, USER, SOURCE, STATUS } = profile
  let status = 'offline'
  if (STATUS == '1') status = 'online'
  if (STATUS == '2') status = 'idle'
  if (STATUS == '3') status = 'disturbe'
  return {
    id: ID,
    name: NAME,
    ian: IAN,
    email: EMAIL,
    created: CREATED,
    twofa: USER,
    picture: SOURCE || 'default.png',
    status,
    statusnumber: parseInt(STATUS),
    admin,
    sessionID,
  }
}

createFriends = (data, id) => {
  let pending = new Array()
  let friends = new Array()
  let blocked = new Array()
  let onlineFriends = new Array()

  data.forEach((friend) => {
    const { NAME, IAN, ONLINE, CLASS, TOKEN, ACTION, STATUS, SOURCE } = friend
    const online = ONLINE == '1' ? true : false
    let status = 'offline'
    if (online) {
      if (CLASS == '1') status = 'online'
      if (CLASS == '2') status = 'idle'
      if (CLASS == '3') status = 'disturbe'
    }

    const friendo = {
      name: NAME,
      ian: IAN,
      online,
      token: TOKEN,
      picture: SOURCE || 'default.png',
      statusnumber: CLASS,
      status,
    }

    if (STATUS == '1' && ACTION != id) pending.push(friendo)
    else if (STATUS == '2') {
      if (online && status != 'offline') onlineFriends.push(friendo)
      friends.push(friendo)
    } else if (STATUS == '3') blocked.push(friendo)
  })
  return {
    pending,
    pendingCounter: pending.length,
    friends,
    friendsCounter: friends.length,
    blocked,
    blockedCounter: blocked.length,
    online: onlineFriends,
    onlineCounter: onlineFriends.length,
  }
}

createSessions = (data, sessionID, current) => {
  const { name, os, mobile } = current

  let defaultSession = {
    date: new Date(),
    browser: name,
    mobile: !!mobile,
    os,
  }

  let sessions = new Array()

  data.forEach((session) => {
    const { SOCKET, DATE, IP, BROWSER, OS, MOBILE, SESSION } = session
    if (SESSION !== sessionID) {
      const sessao = {
        socket: SOCKET,
        date: DATE,
        ip: IP,
        browser: BROWSER,
        os: OS,
        mobile: !!MOBILE,
      }
      sessions.push(sessao)
    } else {
      defaultSession.date = DATE
    }
  })
  return { current: defaultSession, sessions }
}

module.exports = router
