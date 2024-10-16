const router = require('express').Router()

const friend = require('./friend')
const chat = require('./chat')

router.use('/friend', friend)
router.use('/chat', chat)

module.exports = router
