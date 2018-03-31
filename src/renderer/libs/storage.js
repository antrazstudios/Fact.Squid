
const q = require('q')

// -----------------------------------------------------------------------------------------------------------
exports.testConnection = (hostVar, portVar, userVar, passVar, databaseVar, _callback) => {
  // --------------------------| Description |--------------------------
  // Description: Realiza una prueba de una conexion
  // ------------------------| End Description |------------------------
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

// -----------------------------------------------------------------------------------------------------------
exports.getActualConnection = () => {
  // --------------------------| Description |--------------------------
  // Description: Obtiene la conexion actual del sistema
  // ------------------------| End Description |------------------------
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

// -----------------------------------------------------------------------------------------------------------
exports._database_runQuery = (configuracion, connection = null) => {
  // --------------------------| Description |--------------------------
  // Description: Corre un query que puede o no regresar una serie de datos
  // Parameters:
  // * configuracion. query = Es el query que se correra en el servidor
  // * configuracion. parameters = aqui se especifica los parametros de un procedimiento almacenado
  // * configuracion. useActualConn = Define si se utiliza la conexion actual del sistema o si utiliza otra, por defecto esta propiedad esta establecida en true
  // * configuracion. alterConn = Define una conexion alternativa en caso de definir la propiedad useActualConn en false
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  let conn
  if (connection !== null) {
    conn = connection
  } else {
    conn = configuracion.useActualConn === false ? configuracion.alterConn : this.getActualConnection()
    // se intenta realizar la conexion
    conn.connect((err) => {
      if (err) { // en caso de presentarse un error se notifica a la promesa de ello
        deferred.reject('Hha ocurrido un error al intentar conectarse al servidor: ' + conn.host + ' => ' + err)
      }
    })
  }
  // Se ejecuta el respectivo query con la consulta, y retorna el valor de la misma
  if (configuracion['parameters']) {
    conn.query(configuracion.query, configuracion.parameters, (err, results, fields) => {
      if (err !== null && err !== '') {
        deferred.reject('Ha ocurrido un error al ejecutar la consulta o el procedimiento en el servidor: ' + conn.host + ' => ' + err)
      } else {
        deferred.resolve({
          message: 'Operacion ejecuta con exito en el servidor',
          result: results,
          field: fields
        })
      }
    })
  } else {
    conn.query(configuracion.query, (err, results, fields) => {
      if (err !== null && err !== '') {
        deferred.reject('Ha ocurrido un error al ejecutar la consulta o el procedimiento en el servidor: ' + conn.host + ' => ' + err)
      } else {
        deferred.resolve({
          message: 'Operacion ejecuta con exito en el servidor',
          result: results,
          field: fields
        })
      }
    })
  }
  if (connection === null) {
    // Finalizamos la conexion actual con el servidor
    conn.end()
  }
  // Regresa como respuesta una promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_usersLoginWithNicknameAndPass = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Proceso desde la base de datos obtiene los datos del usuario
  // Parameters:
  // * configuracion. username = nombre de usuarioa iniciar sesion
  // * configuracion. pass= contraseña del usuario a validar
  // ------------------------| End Description |------------------------
  // Definicion de los datos a retornar en caso de ser positiva la respuesta
  // del servidor
  let data = {
    userConsult: '',
    permissionsConsult: []
  }
  // Definicion de variables de Q para generar promesas dentro de un modulo
  let deferred = q.defer()
  this._database_runQuery({ query: 'call getProfileLogins(\'' + configuracion.username + '\', \'' + configuracion.pass + '\');' }).then((rta) => {
    let resultData1 = rta.result[0]
    let resultData2 = rta.result[1]
    let resultData3 = rta.result[2]
    // Verificacion de la cantidad de resultados obtenidos desde la base de datos,
    // en caso de obtener 3 tablas de datos y la del sistema crear el token y permitir el inicio de sesion
    if (rta.result.length === 4) {
      // Se recorren todos los permisos del usuario
      for (let i = 0; i < resultData3.length; i++) {
        data.permissionsConsult.push(require('./objects.js').createPermissionsToken(resultData3[i].tb_permission_content, resultData3[i].tb_permission_description))
      }
      this._database_runQuery({
        query: 'call getAdittionalInfoUser(?);',
        parameters: [ resultData2[0].tb_users_username ]
      }).then((response) => {
        let gestorInfo, operadorInfo, entidadInfo, confiInfo
        // obtener informacion de gestores asociados al usuario
        gestorInfo = []
        for (let i = 0; i < response.result[0].length; i++) {
          const gestores = response.result[0][i]
          gestorInfo.push(require('./objects.js').createGestorInfo(gestores.idtb_gestores, gestores.tb_gestores_codigo, gestores.tb_gestores_fd))
        }
        // obtener informacion del operador al que se encuentra asociado el usuario
        let operadorData = response.result[1][0]
        operadorInfo = require('./objects.js').createOperador(operadorData.idtb_operadores, operadorData.tb_operadores_nombre, operadorData.tb_operadores_representantecc, operadorData.tb_operadores_representantenombre, operadorData.tb_operadores_direccion, operadorData.tb_operadores_telefono, operadorData.tb_operadores_logo, require('./objects.js').createCiudad(operadorData.idtb_ciudad, operadorData.tb_ciudad_nombre, require('./objects.js').createDepartamento(operadorData.idtb_departamento, operadorData.tb_departamento_nombre, require('./objects.js').createPais(operadorData.idtb_pais, operadorData.tb_pais_nombre))))
        // obtener informacion de la entidad al que se encuentra asociado el operador y asu vez el usuario
        let entidadData = response.result[2][0]
        entidadInfo = require('./objects.js').createEntidad(entidadData.idtb_entidad, entidadData.tb_entidad_identificacion, entidadData.tb_entidad_nombre, entidadData.tb_entidad_representatecc, entidadData.tb_entidad_representantenombre, entidadData.tb_entidad_direccion, entidadData.tb_entidad_telefono, entidadData.tb_entidad_logo, require('./objects.js').createCiudad(entidadData.idtb_ciudad, entidadData.tb_ciudad_nombre, require('./objects.js').createDepartamento(entidadData.idtb_departamento, entidadData.tb_departamento_nombre, require('./objects.js').createPais(entidadData.idtb_pais, entidadData.tb_pais_nombre))))
        // obtener informacion de la configuracion de la plataforma
        let configData = response.result[3][0]
        confiInfo = require('./objects.js').createConfig(configData.idtb_cnf_so, configData.tb_cnf_so_usepath, configData.tb_cnf_so_path, configData.tb_cnf_so_version, configData.tb_cnf_so_requirehorarios, configData.tb_cnf_so_enabledmaps, configData.tb_cnf_so_notifications, configData.tb_cnf_so_mail_interval_hour, configData.tb_cnf_so_mail_interval_min, configData.tb_cnf_so_mail_interval_sec, configData.tb_cnf_so_security_key16, configData.tb_cnf_so_security_key8)
        // Se obtienen los datos del usuario, y se agregan los permisos obtenidos
        data.userConsult = require('./objects.js').createUserToken(resultData2[0].idtb_users, resultData2[0].tb_users_identification, resultData2[0].tb_tiposidentificacion_nombre, resultData2[0].tb_users_primernombre, resultData2[0].tb_users_segundonombre, resultData2[0].tb_users_primerapellido, resultData2[0].tb_users_segundoapellido, resultData2[0].tb_users_username, resultData2[0].tb_cargos_nombre, resultData2[0].tb_users_fechanacimiento, resultData2[0].tb_users_imagenperfil, resultData2[0].tb_oficinas_nombre, resultData2[0].tb_users_isactive, data.permissionsConsult, entidadInfo, operadorInfo, confiInfo, gestorInfo)
        deferred.resolve(data)
      }).catch((err) => {
        deferred.reject('Respuesta del servidor => ' + err)
      })
    } else if (rta.result.length === 3) {
      deferred.reject('Su usuario aun no esta preparado para ser utilizado, pongase en contacto con el administrador del sistema.')
    } else {
      deferred.reject('Respuesta del servidor => ' + resultData1[0].typeMessage + ': ' + resultData1[0].messageMessage)
    }
  }).catch((err) => {
    deferred.reject(err)
  })
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_getSecurityQuestions = (username) => {
  // --------------------------| Description |--------------------------
  // Description: Proceso que obtiene los datos de preguntas de seguridad con el username
  // Parameters:
  // * configuracion. username = nombre de usuarioa iniciar sesion
  // ------------------------| End Description |------------------------
  // Definicion de los datos a retornar en caso de ser positiva la respuesta
  // del servidor
  let data = []
  // Definicion de variables de Q para generar promesas dentro de un modulo
  let deferred = q.defer()
  this._database_runQuery({ query: 'call getSecurityQuestions(?);', parameters: [username] }).then((rta) => {
    // instanciamos la libreria de objetos
    let objects = require('./objects')
    // Verificacion de la cantidad de resultados obtenidos desde la base de datos
    // Recorremos con un for todos los resultados arrojados por el servidor
    for (let i = 0; i < rta.result[0].length; i++) {
      const row = rta.result[0][i]
      data.push(objects.createSecurityQuestion(row.idtb_users_has_tb_users_pseguridadcol, row.tb_users_pseguridad_pregunta, row.tb_users_has_tb_users_pseguridad_respuesta))
    }
    // Retornamos la informacion allada
    deferred.resolve(data)
  }).catch((err) => {
    console.log(err)
    deferred.reject(err)
  })
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_changePassword = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Proceso que valida la contraseña del lado del servidor y si es positivo realiza el cambio
  // Parameters:
  // * configuracion. comparation = Se envia n/a si no se desea realizar una comparacion o la contraseña vieja para comparar
  // * configuracion. nickname = Se envia el usuario al que se le va a aplicar el cambio en caso de ser efectivo
  // * configuracion. newpassword = Se envia el password que se va a definir como nuevo
  // ------------------------| End Description |------------------------
  // Definicion de variables de Q para generar promesas dentro de un modulo
  let deferred = q.defer()
  this._database_runQuery(
    {
      query: 'call changePassword(?, ?, ?);',
      parameters: [configuracion.comparation, configuracion.nickname, configuracion.newpassword]
    }).then((rta) => {
    deferred.resolve({
      type: rta.result[0][0].typemessage,
      message: rta.result[0][0].message
    })
  }).catch((err) => {
    console.log(err)
    deferred.reject(err)
  })
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_consultTerceros = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Proceso desde la base de datos que obtiene un listado de usuarios
  // Parameters:
  // * configuracion. type = 'juridica' || 'natural'
  // ------------------------| End Description |------------------------
  // Definicion de datos de resultado desde el servidor
  let terceros = []
  // Definicion de variables de Q para generar promesas dentro de un modulo
  let deferred = q.defer()
  // creamos el query en funcion de los permisos del usuario
  let acProfile = require('./settings.js').getSesionProfile()
  let query = ''
  if (acProfile.verifyPermission('ADMIN_EDITOR') === true) {
    query = configuracion.type === 'juridica' ? 'SELECT * FROM consultTercerosJuridicas;' : 'SELECT * FROM consultTercerosNaturales;'
  } else {
    query = configuracion.type === 'juridica' ? 'SELECT * FROM consultTercerosJuridicas WHERE tb_terceros_isactive = 1;' : 'SELECT * FROM consultTercerosNaturales WHERE tb_terceros_isactive = 1;'
  }
  // ejecutamos el proceso de obtencion de datos en el servidor
  this._database_runQuery({
    query: query
  }).then((rta) => {
    // Verficacion de la cantidad de resultados obtenidos desde la base de datos
    if (rta.result !== 0 && rta.result !== null) {
      for (let i = 0; i < rta.result.length; i++) {
        if (configuracion.type === 'juridica') {
          terceros.push(require('./objects.js').createTercerosJuridica(rta.result[i].idtb_tercerosjuridicas, rta.result[i].tb_tercerosjuridicas_razonsocial, rta.result[i].tb_tercerosjuridicas_representantelegal, require('./objects.js').createTerceros(rta.result[i].idtb_terceros, require('./objects.js').createTiposIdentificacion(rta.result[i].tb_terceros_tipodocumento, rta.result[i].tb_tiposidentificacion_nombre, null), rta.result[i].tb_terceros_numerodocumento, rta.result[i].tb_terceros_isactive)))
        } else {
          terceros.push(require('./objects.js').createTercerosNatural(rta.result[i].idtb_tercerosjuridicas, rta.result[i].tb_tercerospersonas_primernombre, rta.result[i].tb_tercerospersonas_segundonombre, rta.result[i].tb_tercerospersonas_primerapellido, rta.result[i].tb_tercerospersonas_segundoapellido, require('./objects.js').createTerceros(rta.result[i].idtb_terceros, require('./objects.js').createTiposIdentificacion(rta.result[i].tb_terceros_tipodocumento, rta.result[i].tb_tiposidentificacion_nombre, null), rta.result[i].tb_terceros_numerodocumento, rta.result[i].tb_terceros_isactive)))
        }
      }
      deferred.resolve(terceros)
    } else {
      deferred.reject('La consulta no ha arrojado resultados')
    }
  }).catch((err) => {
    deferred.reject(err)
  })
  // Retornamos una promesa como respuesta
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_changeStateTerceros = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Proceso desde la base de dats que cambia el estado de un tercero
  // Parameters:
  // * configuracion. id = llave de la tabla de terceros del tercero a cambiar
  // * configuracion. state = estado a aplicarse al tercero
  // ------------------------| End Description |------------------------
  // Definicion de variables de Q para generar promesas dentro de un modulo
  let deferred = q.defer()
  // Se ejecuta el respectivo query con la accion
  this._database_runQuery({ query: 'call updateTerceroState (\'' + configuracion.id + '\', \'' + configuracion.state + '\');' }).then(() => {
    deferred.resolve('Tercero actualizado')
  }).catch((err) => {
    deferred.reject(err)
  })
  // Se retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_getTerceroDireccionesbyID = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Procedimiento almacenado en la base de datos
  // Parameters:
  // * configuracion. id = numero de identificacion a consultar
  // ------------------------| End Description |------------------------
  // Definicion de variables de Q para generar promesas dentro de un modulo
  let deferred = q.defer()
  let tercero = ''
  let direcciones = []
  let acProfile = require('./settings.js').getSesionProfile()
  // se ejecuta el respectivo query con la accion
  this._database_runQuery({ query: 'call getTerceroDireccionesbyID(\'' + configuracion.id + '\', \'' + configuracion.type + '\');' }).then((rta) => {
    // Verficacion de la cantidad de resultados obtenidos desde la base de datos
    if (rta.result !== 0 && rta.result !== null) {
      if (configuracion.type === 0) {
        tercero = require('./objects.js').createTercerosJuridica(rta.result[0][0].idtb_tercerosjuridicas, rta.result[0][0].tb_tercerosjuridicas_razonsocial, rta.result[0][0].tb_tercerosjuridicas_representantelegal, require('./objects.js').createTerceros(rta.result[0][0].idtb_terceros, require('./objects.js').createTiposIdentificacion(rta.result[0][0].idtb_tiposidentificacion, rta.result[0][0].tb_tiposidentificacion_nombre, rta.result[0][0].tb_tiposidentificacion_descripcion), rta.result[0][0].tb_terceros_numerodocumento, rta.result[0][0].tb_terceros_isactive))
      } else {
        tercero = require('./objects.js').createTercerosNatural(rta.result[0][0].idtb_tercerospersonas, rta.result[0][0].tb_tercerospersonas_primernombre, rta.result[0][0].tb_tercerospersonas_segundonombre, rta.result[0][0].tb_tercerospersonas_primerapellido, rta.result[0][0].tb_tercerospersonas_segundoapellido, require('./objects.js').createTerceros(rta.result[0][0].idtb_terceros, require('./objects.js').createTiposIdentificacion(rta.result[0][0].idtb_tiposidentificacion, rta.result[0][0].tb_tiposidentificacion_nombre, rta.result[0][0].tb_tiposidentificacion_descripcion), rta.result[0][0].tb_terceros_numerodocumento, rta.result[0][0].tb_terceros_isactive))
      }
      for (let i = 0; i < rta.result.length; i++) {
        if (rta.result[1][i] !== undefined) {
          if (acProfile.verifyPermission('ADMIN_EDITOR') === true) {
            direcciones.push(require('./objects.js').createDireccion(rta.result[1][i].idtb_tercerosdirecciones, require('./objects.js').createTipoDireccion(rta.result[1][i].idtb_tercerosdirecciones_tipo, rta.result[1][i].tb_tercerosdirecciones_tipo_nombre, rta.result[1][i].tb_tercerosdirecciones_tipo_reqdependencia, rta.result[1][i].tb_tercerosdirecciones_tipo_reqhorario, rta.result[1][i].tb_tercerosdirecciones_tipo_isactive), rta.result[1][i].tb_tercerosdirecciones_dependencia, rta.result[1][i].tb_tercerosdirecciones_direccion, rta.result[1][i].tb_tercerosdirecciones_tagsjson, require('./objects.js').createCiudad(rta.result[1][i].idtb_ciudad, rta.result[1][i].tb_ciudad_nombre, require('./objects.js').createDepartamento(rta.result[1][i].idtb_departamento, rta.result[1][i].tb_departamento_nombre, require('./objects.js').createPais(rta.result[1][i].idtb_pais, rta.result[1][i].tb_pais_nombre))), rta.result[1][i].tb_tercerosdirecciones_webstring, rta.result[1][i].tb_tercerosdirecciones_isactive))
          } else {
            if (rta.result[1][i].tb_tercerosdirecciones_isactive === 1) {
              direcciones.push(require('./objects.js').createDireccion(rta.result[1][i].idtb_tercerosdirecciones, require('./objects.js').createTipoDireccion(rta.result[1][i].idtb_tercerosdirecciones_tipo, rta.result[1][i].tb_tercerosdirecciones_tipo_nombre, rta.result[1][i].tb_tercerosdirecciones_tipo_reqdependencia, rta.result[1][i].tb_tercerosdirecciones_tipo_reqhorario, rta.result[1][i].tb_tercerosdirecciones_tipo_isactive), rta.result[1][i].tb_tercerosdirecciones_dependencia, rta.result[1][i].tb_tercerosdirecciones_direccion, rta.result[1][i].tb_tercerosdirecciones_tagsjson, require('./objects.js').createCiudad(rta.result[1][i].idtb_ciudad, rta.result[1][i].tb_ciudad_nombre, require('./objects.js').createDepartamento(rta.result[1][i].idtb_departamento, rta.result[1][i].tb_departamento_nombre, require('./objects.js').createPais(rta.result[1][i].idtb_pais, rta.result[1][i].tb_pais_nombre))), rta.result[1][i].tb_tercerosdirecciones_webstring, rta.result[1][i].tb_tercerosdirecciones_isactive))
            }
          }
        }
      }
      deferred.resolve({tercero, direcciones})
    } else {
      deferred.reject('La consulta no ha arrojado resultados')
    }
  }).catch((err) => {
    deferred.reject(err)
    console.log('error en storage', err)
  })
  // se retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_consultTiposIdentificacion = () => {
  // --------------------------| Description |--------------------------
  // Description: Permite obtener todos los tipos de identificacion
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  let tiposidentificacion = []
  this._database_runQuery({ query: 'SELECT * FROM consultTipoIdentificacion;' }).then((rta) => {
    if (rta.result !== 0 && rta.result !== null) {
      for (let i = 0; i < rta.result.length; i++) {
        tiposidentificacion.push(require('./objects.js').createTiposIdentificacion(rta.result[i].idtb_tiposidentificacion, rta.result[i].tb_tiposidentificacion_nombre, rta.result[i].tb_tiposidentificacion_descripcion))
      }
      deferred.resolve(tiposidentificacion)
    } else {
      deferred.reject('La consulta no ha arrojado resultados: ERR consultTipoIdentificacion')
    }
  }).catch((err) => {
    deferred.reject(err)
  })
  // Se retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_updateTercerobyID = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Actualiza un tercero en el sistema
  // Parameters:
  // * configuracion. idTercero = Numero de llave del tercero principal en la herencia
  // * configuracion. idHerencia = Numero de llave del tercero de herencia
  // * configuracion. idTipoDocumento = Numero de llave del tipo de documento
  // * configuracion. typeT = Tipo de Tercero Herencia a modificar 0 = Juridica, 1 = Natural
  // * configuracion. numerodocumento = Numero de documento del tercero principal en la herencia
  // * configuracion. datonombre1 = (typeT = 0): hace referencia a la razon social, (typeT = 1): hace referencia al primer nombre
  // * configuracion. datonombre2 = (typeT = 0): hace referencia al nombre del rep. legal, (typeT = 1): hace referencia al segundo nombre
  // * configuracion. datonombre3 = (typeT = 1): hace referencia al primer apellido
  // * configuracion. datonombre4 = (typeT = 1): hace referencia al segundo apellido
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call updateTercerobyID(?, ?, ?, ?, ?, ?, ?, ?, ?);',
    parameters: [configuracion.idTercero, configuracion.idHerencia, configuracion.idTipoDocumento, configuracion.typeT, configuracion.numerodocumento, configuracion.datonombre1, configuracion.datonombre2, configuracion.datonombre3, configuracion.datonombre4]
  }).then((rta) => {
    deferred.resolve('Tercero Actualizado')
  }).catch((err) => {
    deferred.reject(err)
  })

  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_createTercero = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Crea un nuevo tercero en la base de datos
  // Parameters:
  // * configuracion. typeT = Tipo de Tercero Herencia a modificar 0 = Juridica, 1 = Natural
  // * configuracion. idTipoDocumento = Numero de llave del tipo de documento
  // * configuracion. numerodocumento = Numero de documento del tercero principal en la herencia
  // * configuracion. datonombre1 = (typeT = 0): hace referencia a la razon social, (typeT = 1): hace referencia al primer nombre
  // * configuracion. datonombre2 = (typeT = 0): hace referencia al nombre del rep. legal, (typeT = 1): hace referencia al segundo nombre
  // * configuracion. datonombre3 = (typeT = 1): hace referencia al primer apellido
  // * configuracion. datonombre4 = (typeT = 1): hace referencia al segundo apellido
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  // Proceso de creacion del registro principal del Tercero
  this._database_runQuery({
    query: 'INSERT INTO tb_terceros(tb_terceros_tipodocumento, tb_terceros_numerodocumento, tb_terceros_isactive) VALUES(?, ?, 1);',
    parameters: [ configuracion.idTipoDocumento, configuracion.numerodocumento ]
  }).then((rta) => {
    this._database_runQuery({
      query: configuracion.typeT === 0 ? 'INSERT INTO tb_tercerosjuridicas(tb_tercerosjuridicas_razonsocial, tb_tercerosjuridicas_representantelegal, idtb_terceros) VALUES(?, ?, ?);' : 'INSERT INTO tb_tercerosnaturales(tb_tercerospersonas_primernombre, tb_tercerospersonas_segundonombre, tb_tercerospersonas_primerapellido, tb_tercerospersonas_segundoapellido, idtb_terceros) VALUES(?, ?, ?, ?, ?);',
      parameters: configuracion.typeT === 0 ? [ configuracion.datonombre1, configuracion.datonombre2, rta.result.insertId ] : [ configuracion.datonombre1, configuracion.datonombre2, configuracion.datonombre3, configuracion.datonombre4, rta.result.insertId ]
    }).then((rta) => {
      deferred.resolve('Tercero creado')
    }).catch((err) => {
      console.log('Error en proceso de creacion de Tercero', err)
      deferred.reject(err)
    })
  }).catch((err) => {
    console.log('Error en proceso de creacion de Tercero', err)
    deferred.reject(err)
  })

  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_consultTiposDirecciones = () => {
  // --------------------------| Description |--------------------------
  // Description: Obtiene un listado de los tipos de direcciones
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  let tiposDirecciones = []
  let acProfile = require('./settings.js').getSesionProfile()
  let query = ''
  if (acProfile.verifyPermission('ADMIN_EDITOR') === true) {
    query = 'SELECT * FROM consultTiposDirecciones;'
  } else {
    query = 'SELECT * FROM consultTiposDirecciones WHERE tb_tercerosdirecciones_tipo_isactive = 1;'
  }
  this._database_runQuery({ query: query }).then((rta) => {
    if (rta.result !== 0 && rta.result !== null) {
      for (let i = 0; i < rta.result.length; i++) {
        tiposDirecciones.push(require('./objects.js').createTipoDireccion(rta.result[i].idtb_tercerosdirecciones_tipo, rta.result[i].tb_tercerosdirecciones_tipo_nombre, rta.result[i].tb_tercerosdirecciones_tipo_reqdependencia, rta.result[i].tb_tercerosdirecciones_tipo_reqhorario, rta.result[i].tb_tercerosdirecciones_tipo_isactive))
      }
      deferred.resolve(tiposDirecciones)
    } else {
      deferred.reject('La consulta no ha arrojado resultados: ERR consultTiposDirecciones')
    }
  }).catch((err) => {
    deferred.reject(err)
  })
  // Se retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_consultPaises = () => {
  // --------------------------| Description |--------------------------
  // Description: Obtiene un listado de los paises en la base de datos
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  let paises = []
  this._database_runQuery({ query: 'SELECT * FROM consultPaises;' }).then((rta) => {
    if (rta.result !== 0 && rta.result !== null) {
      for (let i = 0; i < rta.result.length; i++) {
        paises.push(require('./objects.js').createPais(rta.result[i].idtb_pais, rta.result[i].tb_pais_nombre))
      }
      deferred.resolve(paises)
    } else {
      deferred.reject('La consulta no ha arrojado resultados: ERR consultPaises')
    }
  }).catch((err) => {
    deferred.reject(err)
  })
  // Se retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_consultDepartamentos = (idPais) => {
  // --------------------------| Description |--------------------------
  // Description: Obtiene un listado de los departamentos en la base de datos
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  let departamentos = []
  this._database_runQuery({ query: 'SELECT * FROM consultDepartamentos WHERE idtb_pais = ' + idPais + ';' }).then((rta) => {
    if (rta.result !== 0 && rta.result !== null) {
      for (let i = 0; i < rta.result.length; i++) {
        departamentos.push(require('./objects.js').createDepartamento(rta.result[i].idtb_departamento, rta.result[i].tb_departamento_nombre, idPais))
      }
      deferred.resolve(departamentos)
    } else {
      deferred.reject('La consulta no ha arrojado resultados: ERR consultDepartamentos')
    }
  }).catch((err) => {
    deferred.reject(err)
  })
  // Se retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_consultCiudades = (idDepartamento) => {
  // --------------------------| Description |--------------------------
  // Description: Obtiene un listado de las ciudades en la base de datos
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  let ciudades = []
  this._database_runQuery({ query: 'SELECT * FROM consultCiudades WHERE idtb_departamento = ' + idDepartamento + ';' }).then((rta) => {
    if (rta.result !== 0 && rta.result !== null) {
      for (let i = 0; i < rta.result.length; i++) {
        ciudades.push(require('./objects.js').createDepartamento(rta.result[i].idtb_ciudad, rta.result[i].tb_ciudad_nombre, idDepartamento))
      }
      deferred.resolve(ciudades)
    } else {
      deferred.reject('La consulta no ha arrojado resultados: ERR consultCiudades')
    }
  }).catch((err) => {
    deferred.reject(err)
  })
  // Se retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_createDireccion = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: crea una nueva direccion asociada a un tercero
  // Parameters:
  // * configuracion. idTercero = Numero de id del tercero principal
  // * configuracion. idTipoDireccion = Numero de id del tipo de direccion asociada
  // * configuracion. dependencia = Opcional, define la dependencia de la direccion solo en caso que el tipo de direccion lo requiera
  // * configuracion. direccion = define la direccion en modo texto
  // * configuracion. direcciontagsjson = define la direccion en modo json para postestructuracion, lo recibe en texto para ser almancenado
  // * configuracion. idCiudad = Numero de id de la ciudad a donde pertenece la direccion
  // * configuracion. webString = Opcional, define la direccion de GoogleMaps para hacer renderizacion de la misma.
  // return:
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call createDireccion(?, ?, ?, ?, ?, ?, ?)',
    parameters: [ configuracion.idTercero, configuracion.idTipoDireccion, configuracion.dependencia, configuracion.direccion, configuracion.direcciontagsjson, configuracion.idCiudad, configuracion.webString ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_updateDireccion = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: actualiza una direccion existente asociada a un tercero
  // Parameters:
  // * configuracion. idDireccion = Numero de id de la Direccion a actualizarse
  // * configuracion. idTipoDireccion = Numero de id del tipo de direccion asociada
  // * configuracion. dependencia = Opcional, define la dependencia de la direccion solo en caso que el tipo de direccion lo requiera
  // * configuracion. direccion = define la direccion en modo texto
  // * configuracion. direcciontagsjson = define la direccion en modo json para postestructuracion, lo recibe en texto para ser almancenado
  // * configuracion. idCiudad = Numero de id de la ciudad a donde pertenece la direccion
  // * configuracion. webString = Opcional, define la direccion de GoogleMaps para hacer renderizacion de la misma.
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call updateDireccion(?, ?, ?, ?, ?, ?, ?)',
    parameters: [ configuracion.idDireccion, configuracion.idTipoDireccion, configuracion.dependencia, configuracion.direccion, configuracion.direcciontagsjson, configuracion.idCiudad, configuracion.webString ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_updateDireccionState = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: actualiza unicamente el estado de una direccion asociada a un tercero
  // Parameters:
  // * configuracion. idDireccion = Numero de id de la Direccion a actualizarse
  // * configuracion. state = Estado a utilizarse que puede ser 0 o 1
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call updateDireccionState(?, ?)',
    parameters: [ configuracion.idDireccion, configuracion.state ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_getDireccionHorariosContactos = (idDireccion) => {
  // --------------------------| Description |--------------------------
  // Description: Consulta en la BD todas las ID de direccion
  // Parameters:
  // * idDireccion = Numero de id de la Direccion a actualizarse
  // return: una promesa
  // ------------------------| End Description |------------------------
  const objetos = require('./objects')
  let deferred = q.defer()
  let horarios = []
  let contactos = []
  this._database_runQuery({
    query: 'call getDireccionHorariosContactos(?)',
    parameters: [ idDireccion ]
  }).then((rta) => {
    if (rta.result !== 0 && rta.result !== null) {
      for (let i = 0; i < rta.result[0].length; i++) {
        const dbhorario = rta.result[0][i]
        horarios.push(objetos.createHorario(dbhorario.idtb_terceroshorarios, idDireccion, dbhorario.tb_terceroshorarios_diainicio, dbhorario.tb_terceroshorarios_diafin, dbhorario.tb_terceroshorarios_horainicio, dbhorario.tb_terceroshorarios_horafin))
      }
      for (let i = 0; i < rta.result[1].length; i++) {
        const dbcontacto = rta.result[1][i]
        contactos.push(objetos.createContacto(dbcontacto.idtb_terceroscontactos, idDireccion, dbcontacto.tb_terceroscontactos_nombre, dbcontacto.tb_terceroscontactos_cargo, dbcontacto.tb_terceroscontactos_isactive))
      }
      deferred.resolve({horarios, contactos})
    } else {
      deferred.reject('La consulta no ha arrojado resultados')
    }
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_updateContactoState = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: actualiza unicamente el estado de un contacto asociada a una direccion
  // Parameters:
  // * configuracion. idContacto = Numero de id del contacto a actualizarse
  // * configuracion. state = Estado a utilizarse que puede ser 0 o 1
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call updateContactosState(?, ?)',
    parameters: [ configuracion.idContacto, configuracion.state ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_removeHorario = (idHorario) => {
  // --------------------------| Description |--------------------------
  // Description: elimina permanentemente un horario del sistema
  // Parameters:
  // * idHorario = Numero de id del horario a eliminarse permanentemente
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call removeHorario(?)',
    parameters: [ idHorario ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_createHorario = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: crea un nuevo horario de una direccion en el sistema
  // Parameters:
  // * configuracion .idDireccion = Numero de id de la direccion a la que ira asociada el horario
  // * configuracion .diainicio = Numero del dia en que inicia el horario
  // * configuracion .diafinal = Numero del dia en que finaliza el horario
  // * configuracion .horainicio = Hora en que inicia el horario
  // * configuracion .horafinal = Hora en que finaliza el horario
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call createHorario(?, ?, ?, ?, ?)',
    parameters: [ configuracion.idDireccion, configuracion.diainicio, configuracion.diafinal, configuracion.horainicio, configuracion.horafinal ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_updateHorario = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: actualiza un horario de una direccion en el sistema
  // Parameters:
  // * configuracion .idHorario = Numero de id de la direccion a la que ira asociada el horario
  // * configuracion .diainicio = Numero del dia en que inicia el horario
  // * configuracion .diafinal = Numero del dia en que finaliza el horario
  // * configuracion .horainicio = Hora en que inicia el horario
  // * configuracion .horafinal = Hora en que finaliza el horario
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call updateHorario(?, ?, ?, ?, ?)',
    parameters: [ configuracion.idHorario, configuracion.diainicio, configuracion.diafinal, configuracion.horainicio, configuracion.horafinal ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_createContacto = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: crea un nuevo contacto de una direccion en el sistema
  // Parameters:
  // * configuracion .idDireccion = Numero de id de la direccion a la que ira asociada el horario
  // * configuracion .nombre = Nombre del contacto a crearse
  // * configuracion .cargo = Cargo del contacto a crearse
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call createContacto(?, ?, ?)',
    parameters: [ configuracion.idDireccion, configuracion.nombre, configuracion.cargo ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_updateContacto = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: crea un nuevo contacto de una direccion en el sistema
  // Parameters:
  // * configuracion .idContacto = Numero de id del contacto a actualizarse
  // * configuracion .nombre = Nombre del contacto a actualizarse
  // * configuracion .cargo = Cargo del contacto a actualizarse
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call updateContacto(?, ?, ?)',
    parameters: [ configuracion.idContacto, configuracion.nombre, configuracion.cargo ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_createEmail = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Crea un nuevo email en la base de datos
  // Parameters:
  // * configuracion. mail = direccion del correo electronico
  // * configuracion. idcontacto = numero de identificacion del contacto a donde se enlazara el correo electronico
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call createEmail(?, ?)',
    parameters: [ configuracion.mail, configuracion.idcontacto ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_updateEmail = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: actualizar un email en la base de datos
  // Parameters:
  // * configuracion. idmail = numero de identificacion del email a editar
  // * configuracion. mail = direccion del correo electronico
  // * configuracion. isdefault = define que si es predefinada esta direccion para enviar correos electronicos
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call updateEmail(?, ?, ?)',
    parameters: [ configuracion.idmail, configuracion.mail, configuracion.isdefault ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_removeEmail = (idEmail) => {
  // --------------------------| Description |--------------------------
  // Description: Elimina un telefono
  // Parameters:
  // * configuracion. idTelefono = numero de id principal del Telefono a editarse
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call removeEmail(?)',
    parameters: [ idEmail ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_createTelefono = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Crea un nuevo telefono en la base de datos
  // Parameters:
  // * configuracion. tipo = define el tipo de Telefono que se creara 0 para el Telefono fijo, 1 telefono celular
  // * configuracion. numero = especifica el numero de telefono a guardarse
  // * configuracion. ext = opcional, define el numero de la extension en caso de que sea requerido
  // * configuracion. idContacto = define el numero de llave principal del contacto a enlzar el telefono
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call createTelefono(?, ?, ?, ?)',
    parameters: [ configuracion.tipo, configuracion.numero, configuracion.ext, configuracion.idContacto ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_updateTelefono = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Crea un nuevo telefono en la base de datos
  // Parameters:
  // * configuracion. idTelefono = numero de id principal del Telefono a editarse
  // * configuracion. tipo = tipo de telefono siendo 0 un telefono fijo y 1 un celular
  // * configuracion. numero = numero de telefono
  // * configuracion. ext = opcional, define el numero de la extension en caso de que sea requerido
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call updateTelefono(?, ?, ?, ?)',
    parameters: [ configuracion.idTelefono, configuracion.tipo, configuracion.numero, configuracion.ext ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_removeTelefono = (idTelefono) => {
  // --------------------------| Description |--------------------------
  // Description: Elimina un telefono
  // Parameters:
  // * configuracion. idTelefono = numero de id principal del Telefono a editarse
  // return: una promesa
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call removeTelefono(?)',
    parameters: [ idTelefono ]
  }).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_getContactoInfo = (idContacto) => {
  // --------------------------| Description |--------------------------
  // Description: Obtiene la informacion adicional del contacto
  // Parameters:
  // * idContacto = Numero del id
  // return: una coleccion con la informacion recolectada
  // ------------------------| End Description |------------------------
  const objects = require('./objects')
  let deferred = q.defer()
  let telefonos = []
  let mails = []
  this._database_runQuery({
    query: 'call getContactoInfo(?)',
    parameters: [ idContacto ]
  }).then((rta) => {
    if (rta.result !== 0 && rta.result !== null) {
      for (let i = 0; i < rta.result[0].length; i++) {
        const dbtelefono = rta.result[0][i]
        telefonos.push(objects.createContactoTelefono(dbtelefono.idtb_tercerostelefonos, dbtelefono.tb_tercerostelefonos_tipo, dbtelefono.tb_tercerostelefonos_numero, dbtelefono.tb_tercerostelefonos_ext, idContacto))
      }
      for (let i = 0; i < rta.result[1].length; i++) {
        const dbmail = rta.result[1][i]
        mails.push(objects.createContactoEmail(dbmail.idtb_tercerosmails, dbmail.tb_tercerosmails_mail, dbmail.tb_tercerosmails_isdefault, idContacto))
      }
      deferred.resolve({telefonos, mails})
    } else {
      deferred.reject('La consulta no ha arrojado resultados')
    }
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })

  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_createFactura = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Crea una nueva factura en la base de datos
  // Parameters:
  // * configuracion. idtercero = llave principal del tercero necesario para incluir relacion entre factura y facturado
  // * configuracion. numero = numero real de la factura
  // * configuracion. fecha = fecha de expedicion de la factura
  // * configuracion. regimen = numero segun lineamientos de rips que definen el tipo de regimen de la factura
  // * configuracion. valorfactura = valor de la factura
  // * configuracion. connection = conexion para usar en caso de que sean bloques de ejecucion, debe enviarse asi sean en null
  // return:
  // una clase que contiene el id creado de la factura.
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call createFactura(?, ?, ?, ?, ?)',
    parameters: [ configuracion.idtercero, configuracion.numero, configuracion.fecha, configuracion.regimen, configuracion.valorfactura ]
  }, configuracion.connection).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_createDocumento = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Crea una nueva factura en la base de datos
  // Parameters:
  // * configuracion. idtipo = numero id del tipo de documento
  // * configuracion. consecutivo = consecutivo del documento
  // * configuracion. anexo = aqui va el documento anexo en blob
  // * configuracion. anexoformat = extension del documento anexo
  // * configuracion. observacion = Una observacion breve sobre el documento
  // * configuracion. connection = conexion para usar en caso de que sean bloques de ejecucion, debe enviarse asi sean en null
  // return:
  // una clase que contiene el id creado de la factura.
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call createDocumento(?, ?, ?, ?, ?)',
    parameters: [ configuracion.idtipo, configuracion.consecutivo, configuracion.anexo, configuracion.anexoformat, configuracion.observacion ]
  }, configuracion.connection).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_createRelationDocumentoFactura = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Crea una nueva relacion entre el documento y la factura
  // Parameters:
  // * configuracion. idfactura = numero id de la factura relacionada
  // * configuracion. iddocumento = numero de id del documento que tiene este documento
  // * configuracion. connection = conexion para usar en caso de que sean bloques de ejecucion, debe enviarse asi sean en null
  // return:
  // nada
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call createRelationDocumentoFactura(?, ?)',
    parameters: [ configuracion.idfactura, configuracion.iddocumento ]
  }, configuracion.connection).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports.createRelationFactura = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Crea acciones para la factura (trazbilidad)
  // Parameters:
  // * configuracion. idfactura = numero id de la factura relacionada
  // * configuracion. idaccion = numero de id del documento que tiene este documento
  // * configuracion. idusuario = numero del id del usuario que realiza el movimiento
  // * configuracion. connection = conexion para usar en caso de que sean bloques de ejecucion, debe enviarse asi sean en null
  // return:
  // nada
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call createRelationFactura(?, ?, ?)',
    parameters: [ configuracion.idfactura, configuracion.idaccion, configuracion.idusuario ]
  }, configuracion.connection).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports.verifyDocumento = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Consulta si existe un documento o no
  // Parameters:
  // * configuracion. consecutivo = numero id de la factura relacionada
  // * configuracion. connection = conexion para usar en caso de que sean bloques de ejecucion, debe enviarse asi sean en null
  // return:
  // true or false si existe o no un documento
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call verifyDocumento(?)',
    parameters: [ configuracion.consecutivo ]
  }, configuracion.connection).then((rta) => {
    if (rta.result[0].length === 0) {
      deferred.resolve(false)
    } else {
      deferred.resolve(true)
    }
  }).catch((err) => {
    deferred.reject(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports.verifyFactura = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Consulta si existe un documento o no
  // Parameters:
  // * configuracion. numero = numero id de la factura relacionada
  // * configuracion. connection = conexion para usar en caso de que sean bloques de ejecucion, debe enviarse asi sean en null
  // return:
  // true or false si existe o no un documento
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call verifyFactura(?)',
    parameters: [ configuracion.numero ]
  }, configuracion.connection).then((rta) => {
    if (rta.result[0].length === 0) {
      deferred.resolve({
        state: false,
        content: rta.result[0][0]
      })
    } else {
      deferred.resolve({
        state: true,
        content: rta.result[0][0]
      })
    }
  }).catch((err) => {
    deferred.reject(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports.verifyFacturaTercero = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Consulta los datos de tercero de una factura
  // Parameters:
  // * configuracion. numero = numero de la factura
  // * configuracion. connection = conexion para usar en caso de que sean bloques de ejecucion, debe enviarse asi sean en null
  // return:
  // true or false si existe o no un documento
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call verifyFacturaTercero(?)',
    parameters: [ configuracion.numero ]
  }, configuracion.connection).then((rta) => {
    deferred.resolve(rta)
  }).catch((err) => {
    deferred.reject(err)
  })
  // retorna la promesa
  return deferred.promise
}

// -----------------------------------------------------------------------------------------------------------
exports._database_generaConsecutivoDocumento = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Genera un consecutivo nuevo
  // Parameters:
  // * configuracion. iddocumento = id del tipo de documento
  // * configuracion. parameters = [ { param: ?, content: ? } ]
  // return:
  // un objeto con el consecutivo y el BLOB del formato
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call getLastIdDocumento(?)',
    parameters: [ configuracion.iddocumento ]
  }, configuracion.connection).then((rta) => {
    // generamos el consecutivo
    let numero = '"' + rta.result[0][0].consecutivo
    while (numero.length < 7) {
      numero = '0' + numero
    }
    numero = numero.replace('"', '')
    let consecutivo = rta.result[1][0].tb_documentos_tipos_prefijo
    consecutivo = consecutivo.replace('#CONSECUTIVE', numero)
    configuracion.parameters.forEach(parameter => {
      console.log(parameter)
      consecutivo = consecutivo.replace(parameter.param, parameter.content)
    })
    deferred.resolve({
      consecutivo: consecutivo,
      formato: rta.result[1][0].tb_formatos_contenido,
      encabezado: rta.result[1][0].tb_formatos_logoencabezado
    })
  }).catch((err) => {
    deferred.reject(err)
  })
  // retorna la promesa
  return deferred.promise
}
