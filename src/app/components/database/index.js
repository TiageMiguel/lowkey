require('dotenv/config')

const mysql = require('mysql')

class Database {
  constructor() {
    this.pool = mysql.createPool({
      connectionLimit: process.env.MYSQL_CONNECTION_LIMIT,
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      multipleStatements: process.env.MYSQL_MULTISTATEMENTS,
    })
  }

  Query(query, args, callback) {
    this.pool.getConnection((error, connection) => {
      if (error) callback(null, error)
      else {
        connection.query(query, args, (errors, results) => {
          if (errors) callback(null, errors)
          else callback(results, null)
          connection.destroy()
        })
      }
    })
  }
}

module.exports = Database
