const router = require('express').Router()

const update = require('./update')
const erase = require('./delete')

router.use('/update', update)
router.use('/erase', erase)

module.exports = router
