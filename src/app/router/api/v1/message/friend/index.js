const router = require('express').Router()

const add = require('./add')
const accept = require('./accept')
const erase = require('./remove')
const block = require('./block')

const middlewares = require('../../../../../middlewares')

router.post('/add', middlewares.isLoggedInMessage, (req, res) => add(req, res))
router.post('/block', middlewares.isLoggedInMessage, (req, res) =>
  block(req, res)
)
router.post('/accept', middlewares.isLoggedInMessage, (req, res) =>
  accept(req, res)
)
router.post('/remove', middlewares.isLoggedInMessage, (req, res) =>
  erase(req, res)
)

module.exports = router
