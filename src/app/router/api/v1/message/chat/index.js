const router = require('express').Router()
const multer = require('multer')
const bcrypt = require('bcryptjs')

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
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 100 },
})

const mensager = require('./mensager')
const linkpreview = require('./linkpreview')
const uploader = require('./uploader')

router.use('/mensager', mensager)
router.use('/linkpreview', linkpreview)
router.use('/upload', upload.single('file'), (req, res) => uploader(req, res))

module.exports = router
