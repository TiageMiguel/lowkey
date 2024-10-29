const router = require('express').Router()

const verify = require('./verify')
const erase = require('./delete')
const recover = require('./recover')

router.get('/verificar/:token', (req, res) => verify(req, res))
router.get('/eliminar/:token', (req, res) => erase(req, res))
router.get('/recuperar/:token', (req, res) => recover(req, res))

module.exports = router
