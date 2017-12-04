
exports.testConnection = (hostVar, portVar, userVar, passVar, databaseVar, _callback) => {
  let mysql = require('mysql')
  let mysqlConnection = mysql.createConnection({
    port: portVar,
    host: hostVar,
    user: userVar,
    password: passVar,
    database: databaseVar
  })
  mysqlConnection.connect((err) => {
    if (err === null) {
      mysqlConnection.end(() => {
        _callback(null)
      })
    } else {
      return _callback(err)
    }
  })
}
