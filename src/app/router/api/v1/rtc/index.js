const Database = require('../../../../components/database')
const browser = require('browser-detect')
const database = new Database()

onJoiningRoom = (socket, data) => {
  const { tokens, userName } = data
  const status = { name: userName, status: 'online' }

  tokens.forEach((element) =>
    socket.join(element, () => {
      if (typeof userName !== 'undefined' && userName.length !== 0) {
        socket.to(element).emit('status', status)
      }
    })
  )
}

onConnect = (socket, data) => {
  const { userCredential, sessionID, userName, tokens } = data

  socket.handshake.session.userid = userCredential

  const id = socket.id
  const ip = socket.request.connection.remoteAddress
  const { name, mobile, os } = browser(socket.request.headers['user-agent'])
  const query_1 = 'SELECT USER FROM ONLINE WHERE SOCKET = ?'
  const query_2 =
    'INSERT INTO ONLINE (USER, SOCKET, SESSION, IP, BROWSER, OS, MOBILE) VALUES (?, ?, ?, ?, ?, ?, ?)'

  database.Query(query_1, [id], (data, err) => {
    if (data.length === 0 || data === null) {
      database.Query(
        query_2,
        [userCredential, id, sessionID, ip, name, os, mobile],
        (results, errr) => {}
      )
    }

    if (tokens.length != 0) {
      onJoiningRoom(socket, { tokens, userName })
    }

    onLatency(socket)
  })
}

onDisconnect = (socket) => {
  const socketID = socket.id
  const id = socket.handshake.session.userid
  const query_1 = 'DELETE FROM ONLINE WHERE SOCKET = ?'
  const query_2 = 'SELECT SOCKET FROM ONLINE WHERE USER = ?'
  const query_3 = 'UPDATE ACCOUNTS SET ONLINE = ? WHERE ID = ?'

  database.Query(query_1, [socketID], (results, err) => {
    database.Query(query_2, [id], (data, errr) => {
      let online = false

      if (data !== null && data.length > 0) {
        online = true
      }

      database.Query(query_3, [online, id], (result, error) => {
        if (!online) {
          const rooms = Object.values(socket.rooms)

          rooms.forEach((element) =>
            socket.broadcast.to(element).emit('status', { status: 0 })
          )
        }
      })
    })
  })
}

onStatusChange = (socket, data) => {
  const { status } = data
  const id = socket.handshake.session.userid
  const query = 'UPDATE ACCOUNTS SET STATUS = ? WHERE ID = ?'

  database.Query(query, [status, id], (results, err) => {
    const rooms = Object.values(socket.rooms)

    rooms.forEach((element) =>
      socket.broadcast.to(element).emit('status', data)
    )
  })
}

onDirectMessage = (socket, data) => {
  const { message, room } = data
  const id = socket.handshake.session.userid

  if (message.length > 0) {
    const query_1 =
      'INSERT INTO MESSAGES (SENDER, MESSAGE, TOKEN) VALUES (?, ?, ?)'

    database.Query(query_1, [id, message, room], (results, err) =>
      socket.broadcast.to(room).emit('dm', data)
    )
  } else {
    socket.broadcast.to(room).emit('dm', data)
  }
}

onTyping = async (socket, data) => {
  const { room } = data

  socket.broadcast.to(room).emit('typing', data)
}

onFriendPending = async (socket, data) => {
  const { friend } = data
  const query = 'SELECT SOCKET FROM ONLINE WHERE USER = ?'

  await database.Query(query, [friend], (result, err) => {
    if (result.length !== 0)
      result.forEach((sockets) =>
        socket.to(sockets.SOCKET).emit('friends-pending', data)
      )
  })
}

onFriendAccepted = async (socket, data) => {
  const { token } = data

  socket.broadcast.to(token).emit('friends-accept', data)
}

onFriendRemoved = async (socket, data) => {
  const { room } = data

  socket.broadcast.to(room).emit('friend-remove', data)
}

onFriendBlocked = async (socket, data) => {
  const { room } = data
}

onLatency = async (socket) => socket.emit('latency')

module.exports.onConnect = onConnect
module.exports.onDisconnect = onDisconnect
module.exports.onTyping = onTyping
module.exports.onLatency = onLatency
module.exports.onJoiningRoom = onJoiningRoom
module.exports.onStatusChange = onStatusChange
module.exports.onDirectMessage = onDirectMessage
module.exports.onFriendPending = onFriendPending
module.exports.onFriendAccepted = onFriendAccepted
module.exports.onFriendRemoved = onFriendRemoved
module.exports.onFriendBlocked = onFriendBlocked
