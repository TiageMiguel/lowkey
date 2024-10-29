const router = require('express').Router()
const middlewares = require('../../../../../middlewares')

const permission = require('./permission')
const action = require('./action')

router.post('/permission', middlewares.isUserLoggedIn, permission)
router.post('/action', middlewares.isUserLoggedIn, action)

module.exports = router
