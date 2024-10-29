const router = require('express').Router()

const middlewares = require('../../middlewares')
const account = require('./account')

router.use('/conta', middlewares.isLoggedInApp, account)
router.get('/build-dist', middlewares.isLoggedInApp, (req, res) =>
  res.render('build-dist')
)
router.get('/', middlewares.isLoggedInApp, (req, res) => res.render('landing'))
router.get('*', (req, res) => res.redirect('/'))

module.exports = router
