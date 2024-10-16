const router = require('express').Router()

const register = require('./register')
const login = require('./login')
const twofa = require('./login/2fa')
const logout = require('./logout')
const recover = require('./recover')

router.post('/signup', (req, res) => register(req, res))
router.post('/signin', (req, res) => login(req, res))
router.post('/twofa', (req, res) => twofa(req, res))
router.post('/logout', (req, res) => logout(req, res))
router.post('/recover', (req, res) => recover(req, res))

module.exports = router
