
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
exports._database_runQuery = (configuracion) => {
  // --------------------------| Description |--------------------------
  // Description: Corre un query que puede o no regresar una serie de datos
  // Parameters:
  // * configuracion. query = Es el query que se correra en el servidor
  // * configuracion. parameters = aqui se especifica los parametros de un procedimiento almacenado
  // * configuracion. useActualConn = Define si se utiliza la conexion actual del sistema o si utiliza otra, por defecto esta propiedad esta establecida en true
  // * configuracion. alterConn = Define una conexion alternativa en caso de definir la propiedad useActualConn en false
  // ------------------------| End Description |------------------------
  let deferred = q.defer()
  let conn = configuracion.useActualConn === false ? configuracion.alterConn : this.getActualConnection()
  // se intenta realizar la conexion
  conn.connect((err) => {
    if (err) { // en caso de presentarse un error se notifica a la promesa de ello
      deferred.reject('Hha ocurrido un error al intentar conectarse al servidor: ' + conn.host + ' => ' + err)
    }
  })
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
  // Finalizamos la conexion actual con el servidor
  conn.end()
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
      // Se obtienen los datos del usuario, y se agregan los permisos obtenidos
      data.userConsult = require('./objects.js').createUserToken(resultData2[0].idtb_users, resultData2[0].tb_users_identificacion, resultData2[0].tb_tiposidentificacion_nombre, resultData2[0].tb_users_primernombre, resultData2[0].tb_users_segundonombre, resultData2[0].tb_users_primerapellido, resultData2[0].tb_users_segundoapellido, resultData2[0].tb_users_username, resultData2[0].tb_cargos_nombre, resultData2[0].tb_users_fechanacimiento, resultData2[0].tb_users_imagenperfil, resultData2[0].tb_oficinas_nombre, resultData2[0].tb_users_isactive, data.permissionsConsult)
      deferred.resolve(data)
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
  console.log(configuracion)
  let deferred = q.defer()
  this._database_runQuery({
    query: 'call createDireccion(?, ?, ?, ?, ?, ?, ?)',
    parameters: [ configuracion.idTercero, configuracion.idTipoDireccion, configuracion.dependencia, configuracion.direccion, configuracion.direcciontagsjson, configuracion.idCiudad, configuracion.webString ]
  }).then((rta) => {
    deferred.resolve(rta)
    console.log(rta)
  }).catch((err) => {
    deferred.reject(err)
    console.log(err)
  })
  // retorna la promesa
  return deferred.promise
}
