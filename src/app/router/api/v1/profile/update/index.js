const router = require('express').Router()
const multer = require('multer')
const bcrypt = require('bcryptjs')

const middlewares = require('../../../../../middlewares')

const storage = multer.diskStorage({
  destination: (req, file, callback) =>
    callback(null, __dirname + '../../../../../static/uploads/'),
  filename: (req, file, callback) => {
    const fileExtension = file.originalname.split('.')[1]
    const fileName = file.filename
    bcrypt.hash(String(fileName), 1, (errr, hash) => {
      const save =
        String(hash).replace(/[!@#%^&*()'/',.?":{}|<>]/g, '-') +
        '.' +
        fileExtension
      callback(null, save)
    })
  },
})
const fileFilter = (req, file, callback) => {
  if (
    file.mimetype === 'image/jpeg' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/gif'
  )
    callback(null, true)
  else callback(null, false)
}
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 1024 * 1024 * 10 },
})

const security = require('./security')
const twofa = require('./twofa')
const account = require('./account')

router.post('/security', middlewares.isUserLoggedIn, (req, res) =>
  security(req, res)
)
router.post('/twofa', (req, res) => twofa(req, res))
router.post('/account', upload.single('avatar'), (req, res) =>
  account(req, res)
)

module.exports = router
