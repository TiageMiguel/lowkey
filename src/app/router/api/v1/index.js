const router = require('express').Router();

const auth = require('./authentication');
const message = require('./message');
const profile = require('./profile');

router.use('/oauth', auth);
router.use('/app', message);
router.use('/profile', profile);

module.exports = router;