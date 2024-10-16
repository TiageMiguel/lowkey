require('dotenv/config')

const express = require('express')
const app = express()

const server = require('http').createServer(app)

const helmet = require('helmet')
const cors = require('cors')

app.use(helmet())
app.use(cors())

const sessions = require('express-session')
const MemoryStore = require('memorystore')(sessions)
const session = {
  store: new MemoryStore({
    checkPeriod: 1000 * 60 * 60 * 24,
  }),
  secret: process.env.AUTH_SECRET_KEY,
  resave: false,
  saveUninitialized: false,
  cookie: {
    domain: '.localhost:3000',
    path: '/',
    httpOnly: true,
  },
}

app.use(sessions(session))

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true)
  res.header('Access-Control-Allow-Origin', req.headers.origin)
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE')
  res.header(
    'Access-Concleartrol-Allow-Headers',
    'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept'
  )
  next()
})

const sharedsession = require('express-socket.io-session')
const events = require('./src/app/router/api/v1/rtc')
const io = require('socket.io')(server)

io.use(sharedsession(sessions(session)))

io.on('connection', (socket) => {
  socket.on('onConnect', (data) => events.onConnect(socket, data))
  socket.on('disconnect', () => events.onDisconnect(socket))
  socket.on('latency', () => events.onLatency(socket))

  socket.on('join', (data) => events.onJoiningRoom(socket, data))
  socket.on('dm', (data) => events.onDirectMessage(socket, data))
  socket.on('typing', (data) => events.onTyping(socket, data))
  socket.on('status', (data) => events.onStatusChange(socket, data))

  socket.on('friends-pending', (data) => events.onFriendPending(socket, data))
  socket.on('friend-remove', (data) => events.onFriendRemoved(socket, data))
  socket.on('friends-accept', (data) => events.onFriendAccepted(socket, data))
})

const path = require('path')
const volleyball = require('volleyball')

app.use(volleyball)
app.use(express.json())
app.use(
  express.urlencoded({
    extended: true,
  })
)

const exphbs = require('express-handlebars')

const hbs = exphbs.create({
  layoutsDir: './src/app/views',
  partialsDir: ['./src/app/views/partials'],
})

app.engine('handlebars', hbs.engine)
app.set('view engine', 'handlebars')
app.set('views', './src/app/views')

const api = require('./src/app/router/api/v1')
const admin = require('./src/app/router/admin')
const message = require('./src/app/router/message')
const index = require('./src/app/router/landing')

app.use(
  '/static',
  express.static(path.join(__dirname, './src/app/router/static'))
)
app.use('/api', api)
app.use('/admin', admin)
app.use('/mensagens', message)
app.use('/', index)

const rateLimit = require('express-rate-limit')
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100,
})

app.use('/api', apiLimiter)

server.listen(3000, '0.0.0.0', () =>
  console.log(`Starting Lowkey App @ Port ${server.address().port}`)
)
