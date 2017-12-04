
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

/**
  * Crea una nueva conexion, con defaultConn
*/
exports.getActualConnection = () => {
  let mysql = require('mysql')
  let settings = require('./settings.js')
  let connObj = settings.getConnectionbyId(settings.getContentFromLocalKey('defaultConn'))
  return mysql.createConnection({
    port: connObj.port,
    host: connObj.host,
    user: connObj.usd,
    password: connObj.pwd,
    database: connObj.database
  })
}

exports._database_LoginWithUsernamePass = (username, pass, _callback) => {
  let messageConsult = ''
  let userConsult
  let actualConn = this.getActualConnection()
  actualConn.connect()
  actualConn.query('call LoginWithNicknameAndPass(\'' + username + '\', \'' + pass + '\');', (error, results, fields) => {
    let resultData1 = results[0]
    let resultData2 = results[1]
    if (results.length === 3) {
      userConsult = require('./objects.js').createUser(resultData2[0].idtb_users, resultData2[0].tb_users_identificacion, resultData2[0].tb_users_tipoidentificacion, resultData2[0].tb_users_primernombre, resultData2[0].tb_users_segundonombre, resultData2[0].tb_users_primerapellido, resultData2[0].tb_users_segundoapellido, resultData2[0].tb_users_username, pass, resultData2[0].tb_users_cargo, resultData2[0].tb_users_fechanacimiento, resultData2[0].tb_users_imagenperfil,
        resultData2[0].tb_users_oficina, resultData2[0].tb_users_isactive, resultData2[0].tb_users_createdtime, resultData2[0].tb_users_createduser, resultData2[0].tb_users_updatedtime, resultData2[0].tb_users_updateduser)
    }
    if (error !== null) {
      messageConsult = {
        type: 'error',
        message: error
      }
    } else {
      messageConsult = {
        type: resultData1[0].typeMessage,
        message: resultData1[0].messageMessage
      }
    }
    return _callback({
      message: messageConsult,
      user: userConsult
    })
  })
  actualConn.end()
}
