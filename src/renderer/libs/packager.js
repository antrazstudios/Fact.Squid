const q = require('q')

exports.downloadFunction = (configuracion) => {
  // Definicion de variables de Q para generar promesas dentro de un modulo
  let deferred = q.defer()
  // Definicion de variables de tamaño de descarga
  let receivedBytes = 0
  let totalBytes = 0
  // Definicion de requerimiento
  let req = require('request')({
    method: 'GET',
    uri: configuracion.remoteuri
  })
  // Se crea un archivo mediante Stream
  let out = require('fs').createWriteStream(configuracion.localuri)
  req.pipe(out)
  // En el momento que responda la pagina
  req.on('response', (data) => {
    totalBytes = parseInt(data.headers['content-length'])
  })
  // En el momento se obtenta datos y se tenga acceso al proceso onProgress y contrario
  if (configuracion.hasOwnProperty('onProgress')) {
    req.on('data', (chunk) => {
      receivedBytes += chunk.length

      configuracion.onProgress(receivedBytes, totalBytes)
    })
  } else {
    req.on('data', (chunk) => {
      receivedBytes += chunk.length
    })
  }
  // En el momento en que termine notificar al usuario que termino la descarga
  req.on('end', () => {
    deferred.resolve('Se ha finalizado la descarga')
  })
  // En el momento en que ocurra un error, informar al usuario
  req.on('error', () => {
    deferred.reject(new Error('no ha sido posible descargar el paquete, revise su conexion a internet, si el problema persiste contacte a su proveedor'))
  })
  // Se termina el proceso y regresamos la promesa
  return deferred.promise
}

exports.unzipFunction = (configuracion) => {
  // Definicion de las variables Q para generar promesas dentro de los modulos.
  let deferred = q.defer()
  // Definicion de las variables del paquete de extraccion
  const extractZip = require('extract-zip')
  // Proceso de extraccion
  extractZip(configuracion.uri, { dir: configuracion.path }, (err) => {
    // en caso de ocurrir un error en la extraccion notificar al usuario
    if (err) {
      deferred.reject(new Error('Ha ocurrido un error durante la extraccion del paquete: ' + err))
    }
    // en caso de ocurrir un error en la eliminacion del archivo descargado
    require('fs').unlink(configuracion.uri, (err) => {
      if (err) {
        deferred.reject(new Error('Ha ocurrido un error al eliminar el cache del paquete: ' + err))
      } else {
        // en caso de no ocurrir un error, notificar el procedimiento exitoso
        deferred.resolve('Extraccion del paquete exitosa')
      }
    })
  })
  // retornar promesa
  return deferred.promise
}
