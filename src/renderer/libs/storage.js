
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

exports._database_usersLoginWithNicknameAndPass = (username, pass, _callback) => {
  // Definicion de variables varias
  let messageConsult = ''
  let userConsult
  let permissionsConsult = []
  let normalMessage = true
  // Se obtiene la conexion actual para ser utilizada
  let actualConn = this.getActualConnection()
  // Se conecta al servidor
  actualConn.connect()
  // Se ejecuta el respectivo query con la consulta, y ejecucion del _callback dependiendo de los resultados
  actualConn.query('call usersLoginWithNicknameAndPass(\'' + username + '\', \'' + pass + '\');', (error, results, fields) => {
    // Variables para almacenar los resultados
    let resultData1 = results[0]
    let resultData2 = results[1]
    let resultData3 = results[2]
    // Verificacion de la cantidad de resultados obtenidos desde la base de datos,
    // en caso de obtener 3 tablas de datos y la del sistema crear el token y permitir el inicio de sesion
    if (results.length === 4) {
      // Se recorren todos los permisos del usuario
      for (let i = 0; i < resultData3.length; i++) {
        permissionsConsult.push(require('./objects.js').createPermissionsToken(resultData3[i].tb_permission_content, resultData3[i].tb_permission_description))
      }
      // Se obtienen los datos del usuario, y se agregan los permisos obtenidos
      userConsult = require('./objects.js').createUserToken(resultData2[0].idtb_users, resultData2[0].tb_users_identificacion, resultData2[0].tb_tiposidentificacion_nombre, resultData2[0].tb_users_primernombre, resultData2[0].tb_users_segundonombre, resultData2[0].tb_users_primerapellido, resultData2[0].tb_users_segundoapellido, resultData2[0].tb_users_username, resultData2[0].tb_cargos_nombre, resultData2[0].tb_users_fechanacimiento, resultData2[0].tb_users_imagenperfil.toString('base64'), resultData2[0].tb_oficinas_nombre, resultData2[0].tb_users_isactive, permissionsConsult)
    } else if (results.length === 3) {
      messageConsult = {
        type: 'alert',
        message: 'Su usuario aun no esta preparado para el inicio de sesion'
      }
      normalMessage = false
      actualConn.end()
    }
    if (normalMessage === true) {
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
    }
    return _callback({
      message: messageConsult,
      user: userConsult
    })
  })
  actualConn.end()
}
