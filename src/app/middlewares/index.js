const isLoggedInApp = (req, res, next) => {
  if (typeof req.session.userid !== 'undefined') res.redirect('/mensagens')
  else next()
}

const isLoggedInMessage = (req, res, next) => {
  if (typeof req.session.userid !== 'undefined') next()
  else res.redirect('/')
}

/*************  ✨ Codeium Command ⭐  *************/
/******  0527fd15-8ecd-42b3-af22-94407d413314  *******/ const isLoggedInAdmin =
  (req, res, next) => {
    if (
      typeof req.session.userid !== 'undefined' &&
      req.session.useradmin !== null
    ) {
      next()
    } else if (typeof req.session.userid !== 'undefined') {
      res.redirect('/mensagens')
    } else res.redirect('/')
  }

const isUserLoggedIn = (req, res, next) => {
  if (typeof req.session.userid !== 'undefined') next()
  else res.json({ session: 'over' })
}

module.exports.isLoggedInApp = isLoggedInApp
module.exports.isLoggedInMessage = isLoggedInMessage
module.exports.isUserLoggedIn = isUserLoggedIn
module.exports.isLoggedInAdmin = isLoggedInAdmin
