require('dotenv/config')

const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: process.env.MAILER_SERVICE,
  auth: {
    user: process.env.MAILER_AUTH_USER,
    pass: process.env.MAILER_AUTH_PASS,
  },
})

const Options = (data) => ({
  from: process.env.MAILER_AUTH_USER,
  to: data.to,
  subject: data.subject,
  html: data.html,
})

const Send = (options) =>
  transporter.sendMail(options, (error, sucess) => {
    if (error) console.log(error)
    else console.log('Email sent: ' + sucess.response)
  })

module.exports.Options = Options
module.exports.Send = Send
