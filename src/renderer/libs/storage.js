const q = require('q')

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

exports._database_usersLoginWithNicknameAndPass = (configuracion) => {
  // Definicion de los datos a retornar en caso de ser positiva la respuesta
  // del servidor
  let data = {
    userConsult: '',
    permissionsConsult: []
  }
  // Bandera de verificacion de mensaje
  let isSuccess = true
  // Definicion de variables de Q para generar promesas dentro de un modulo
  let deferred = q.defer()
  // Definicion de la conexion actual del sistema
  let actualConn = this.getActualConnection()
  // Se intenta realizar la conexion al sistema
  actualConn.connect((err) => {
    if (err) {
      deferred.reject('Ha ocurrido un error al intentar realizar la conexion: ' + err)
    }
  })
  // Se ejecuta el respectivo query con la consulta, y retorna el valor de la misma
  actualConn.query('call usersLoginWithNicknameAndPass(\'' + configuracion.username + '\', \'' + configuracion.pass + '\');', (err, results, fields) => {
    let resultData1 = results[0]
    let resultData2 = results[1]
    let resultData3 = results[2]
    // Verificacion de la cantidad de resultados obtenidos desde la base de datos,
    // en caso de obtener 3 tablas de datos y la del sistema crear el token y permitir el inicio de sesion
    if (results.length === 4) {
      // Se recorren todos los permisos del usuario
      for (let i = 0; i < resultData3.length; i++) {
        data.permissionsConsult.push(require('./objects.js').createPermissionsToken(resultData3[i].tb_permission_content, resultData3[i].tb_permission_description))
      }
      // Se obtienen los datos del usuario, y se agregan los permisos obtenidos
      data.userConsult = require('./objects.js').createUserToken(resultData2[0].idtb_users, resultData2[0].tb_users_identificacion, resultData2[0].tb_tiposidentificacion_nombre, resultData2[0].tb_users_primernombre, resultData2[0].tb_users_segundonombre, resultData2[0].tb_users_primerapellido, resultData2[0].tb_users_segundoapellido, resultData2[0].tb_users_username, resultData2[0].tb_cargos_nombre, resultData2[0].tb_users_fechanacimiento, resultData2[0].tb_users_imagenperfil, resultData2[0].tb_oficinas_nombre, resultData2[0].tb_users_isactive, data.permissionsConsult)
      deferred.resolve(data)
      isSuccess = false
    } else if (results.length === 3) {
      deferred.reject('Su usuario aun no esta preparado para ser utilizado, pongase en contacto con el administrador del sistema.')
    }
    // Verificacion de los mensajes del sistema
    if (isSuccess === true) {
      if (err) {
        deferred.reject('Ha ocurrido un error al intentar consultar la informacion en el servidor: ' + err)
      } else {
        deferred.reject('Respuesta del servidor => ' + resultData1[0].typeMessage + ': ' + resultData1[0].messageMessage)
      }
    }
  })
  // Finalizamos la conexion
  actualConn.end()
  // Regresa como respuesta una promesa
  return deferred.promise
}

exports._consultTerceros = (configuracion) => {
  // Configuracion recibe un item type que puede ser 'juridica' o 'natural'
  // Definicion de datos de resultado desde el servidor
  let terceros = []
  // Bandera de verificacion de mensajes
  let isSuccess = true
  // Definicion de variables de Q para generar promesas dentro de un modulo
  let deferred = q.defer()
  // Definicion de la conexion actual del sistema
  let actualConn = this.getActualConnection()
  // Se intenta realizar la conexion al sistema
  actualConn.connect((err) => {
    if (err) {
      deferred.reject('Ha ocurrdio un error al intentar realizar la conexion: ' + err)
    }
  })
  // Se ejecuta el respectivo query con la consulta y retorna el valor de la misma
  actualConn.query(configuracion.type === 'juridica' ? 'SELECT * FROM consultTercerosJuridicas;' : 'SELECT * FROM consultTercerosNaturales;', (err, results, fields) => {
    // Verificacion de la cantidad de resultados obtenidos desde la base de datos
    if (results.length !== 0 && results.length !== null) {
      for (let i = 0; i < results.length; i++) {
        if (configuracion.type === 'juridica') {
          terceros.push(require('./objects.js').createTercerosJuridica(results[i].idtb_tercerosjuridicas, results[i].tb_tercerosjuridicas_razonsocial, results[i].tb_tercerosjuridicas_representantelegal, require('./objects.js').createTerceros(results[i].idtb_terceros, require('./objects.js').createTiposIdentificacion(results[i].tb_terceros_tipodocumento, results[i].tb_tiposidentificacion_nombre, null), results[i].tb_terceros_numerodocumento, results[i].tb_terceros_isactive)))
        } else {
          terceros.push(require('./objects.js').createTercerosNatural(results[i].idtb_tercerosjuridicas, results[i].tb_tercerospersonas_primernombre, results[i].tb_tercerospersonas_segundonombre, results[i].tb_tercerospersonas_primerapellido, results[i].tb_tercerospersonas_segundoapellido, require('./objects.js').createTerceros(results[i].idtb_terceros, require('./objects.js').createTiposIdentificacion(results[i].tb_terceros_tipodocumento, results[i].tb_tiposidentificacion_nombre, null), results[i].tb_terceros_numerodocumento, results[i].tb_terceros_isactive)))
        }
      }
      deferred.resolve(terceros)
      isSuccess = false
    } else {
      deferred.reject('La consulta no ha arrojado resultados')
    }
    // Verificacion de la no ejecucion
    if (isSuccess === true) {
      if (err) {
        deferred.reject('No ha sido posible ejecutar la consulta: ' + err)
      }
    }
  })
  // Finalizamos la conexion
  actualConn.end()
  // Regresamos como respuesta una promesa
  return deferred.promise
}

exports._changeStateTerceros = (configuracion) => {
  // Definicion de variables de Q para generar promesas dentro de un modulo
  let deferred = q.defer()
  // Definicion de la conexion actual del sistema
  let actualConn = this.getActualConnection()
  // Se ejecuta el respetivo query con la accion
  actualConn.connect((err) => {
    if (err) {
      deferred.reject('Ha ocurrido un error al intentar realizar la conexion: ' + err)
    }
  })
  actualConn.query('call changeStateTercero (\'' + configuracion.id + '\', \'' + configuracion.state + '\');', (err, results, fields) => {
    if (err !== null) {
      console.log('test')
      deferred.reject('Ha ocurrido un error al intentar cambiar el estado del tercero: ' + err)
    }
    if (err === null) {
      deferred.resolve('Tercero actualizado correctamente')
    }
  })
  actualConn.end()
  return deferred.promise
}
