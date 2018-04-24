
const q = require('q')

// Funcion publica que lee los archivos seleccionados por el selector de RIPS uno a uno
exports.readFileRips = (files, _callback) => {
  let objects = require('./objects')
  // creamos la variable de orden de Lectura
  let ordenLectura = []
  ordenLectura.push(objects.createRIPSContainer('FACTURAS'))
  ordenLectura.push(objects.createRIPSContainer('CT'))
  ordenLectura.push(objects.createRIPSContainer('AF'))
  ordenLectura.push(objects.createRIPSContainer('US'))
  ordenLectura.push(objects.createRIPSContainer('AD'))
  ordenLectura.push(objects.createRIPSContainer('AC'))
  ordenLectura.push(objects.createRIPSContainer('AP'))
  ordenLectura.push(objects.createRIPSContainer('AU'))
  ordenLectura.push(objects.createRIPSContainer('AH'))
  ordenLectura.push(objects.createRIPSContainer('AN'))
  ordenLectura.push(objects.createRIPSContainer('AM'))
  ordenLectura.push(objects.createRIPSContainer('AT'))
  // variable de finalizacion y cuenta
  let countFinalize = 0
  // variable de archivos con posible lectura
  let counFilesToRead = 0
  // recorremos el orden de Lectura de los archivos
  ordenLectura.forEach(element => {
    if (element.pref !== 'FACTURAS') {
      // recorremos la matriz de archivos para realizar la lectura
      let fileFinder = false
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        // verificamos la extencion del archivo y el nombre segun el orden de Lectura
        if (file.name.toUpperCase().indexOf(element.pref) > -1 && file.name.toUpperCase().indexOf(element.ext) > -1) {
          fileFinder = true
          element.updateFileName(file.name.toUpperCase())
          element.result.push(objects.createErrorReader('?READ/EXIST')) // actualizacion del log del archivo
          counFilesToRead = counFilesToRead + 1 // contamos como un archivo de posible lectura
          // en caso que concuerden la extension con el nombre, se envia a lectura del FileReader
          this._readerFile(file, element.ext).then((result) => {
            // en caso que sea posible su lectura
            // verificamos el contenido de la lectura para eliminar lineas en blanco
            let lineaActual = 0 // linea en la que se encuentra la lectura
            let newBuffer = '' // nuevo buffer limpio de lineas en blanco
            for (let i = 0; i < result.split('\n').length; i++) {
              const linealeida = result.split('\n')[i] // obtenemos la linea
              // verificamos que no este en blanco
              if (linealeida.length !== 0) {
                // si la linea actual es la primera, reemplazamos el buffer con el valor de la linea
                if (lineaActual === 0) {
                  newBuffer = linealeida
                } else {
                  // si no, insertamos un salto de linea y metemos la linea
                  newBuffer = newBuffer + '\n' + linealeida
                }
                // sumamos una posicion a la linea actual
                lineaActual = lineaActual + 1
              }
            }
            element.stateDB = objects.createErrorReader('?READED')
            element.result.push(objects.createErrorReader('*READ/IO')) // actualizacion del log del archivo
            element.state = true // definimos como existente y leible el archivo
            element.buffer = newBuffer // definimos el contenido del archivo
            countFinalize = countFinalize + 1 // contamos un archivo leido
            // llamamos al callback y retornamos el valor, si leimos todos los archivos
            if (countFinalize === counFilesToRead) {
              _callback(ordenLectura)
            }
          }).catch((err) => {
            // en caso que no sea posible la lectura
            element.stateDB = objects.createErrorReader('#READED')
            element.state = false // definimos como no existente o leible el archivo
            element.result.push(objects.createErrorReader('#READ/IO', 0, err)) // definimos el contenido del result con el error
            countFinalize = countFinalize + 1 // contamos un archivo leido
            // llamamos al callback y retornamos el valor, si leimos todos los archivos
            if (countFinalize === counFilesToRead) {
              _callback(ordenLectura)
            }
          })
        }
      }
      // verificamos si el archivo fue encontrado
      if (fileFinder === false) {
        element.result.push(objects.createErrorReader('!READ/EXIST')) // actualizacion del log del archivo
      }
    }
  })
}

// Funcion publica que valida cada uno de los archivos de un contenedor de rips
exports.decodeFileRips = (ripsContainer, ripCollection) => {
  let deferred = q.defer()
  let objects = require('./objects')
  try {
    if (ripsContainer.pref === 'FACTURAS') {
      deferred.resolve(ripsContainer)
    } else {
      // separamos las lineas del contenido
      let temp = ripsContainer.buffer.split('\n')
      ripsContainer.buffer = temp
      // definimos el numero de lineas leidas
      ripsContainer.lines = ripsContainer.buffer.length
      // seleccionamos la validacion dependiendo del tipo de archivo
      switch (ripsContainer.pref) {
        case 'CT':
          ripsContainer = this._validatorCT(ripsContainer, ripCollection)
          break
        case 'AF':
          ripsContainer = this._validatorAF(ripsContainer, ripCollection)
          break
        case 'US':
          ripsContainer = this._validatorUS(ripsContainer, ripCollection)
          break
      }
      deferred.resolve(ripsContainer)
    }
  } catch (error) {
    console.log(ripsContainer.pref, error)
    deferred.reject(objects.createErrorReader('#VALIDATOR/UNKNOWN', 0, error))
  }
  // retornamos la promesa
  return deferred.promise
}

// Funcion publica que crea objetos de facturacion, siempre y cuando no existan errores en los objetos
exports.generateObjects = (ripsContainer) => {
  
}

// Funcion de sistema utilizada para leer el contenido de archivos desde un fileReader
exports._readerFile = (file, ext) => {
  let deferred = q.defer()
  let fileReader = new FileReader()
  let plainBase64 = 'data:text/plain;base64,'
  let result
  try {
    fileReader.onload = () => {
      result = atob(fileReader.result.replace(plainBase64, ''))
      deferred.resolve(result)
      console.log()
    }
    fileReader.readAsDataURL(file)
  } catch (error) {
    if (error) {
      deferred.reject(error)
    }
  }
  return deferred.promise
}

// Funcion de sistema utilizada para validar un arhivo del tipo CT
exports._validatorCT = (ripObject, ripCollection) => {
  const objects = require('./objects')
  let columnLimit = 4 // limite de columnas del archivo
  let tempbuffer = [] // objeto temporal para hacer cambios
  let readyFiles = 0 // cantidad de archivos listos para verificacion
  let errorCount = 0 // contador de errores
  ripCollection.forEach(element => {
    if (element.state === true) {
      readyFiles = readyFiles + 1
    }
  })
  // recorrer linea por linea el buffer
  for (let i = 0; i < ripObject.buffer.length; i++) {
    let linea = ripObject.buffer[i] // obtenemos la linea actual en la que esta parada
    let matrizContenido = linea.split(',') // obtenemos la matriz de la linea
    // verificamos que el numero de columnas de la linea sea el indicado por el tipo de archivo
    if (matrizContenido.length === columnLimit) {
      // guardamos el Log de estructura en el temporal
      ripObject.result.push(objects.createErrorReader('?VALIDATOR/STRUCTURE/COLUMNS', i + 1))
      // le damos formato correcto a los objetos de la linea
      // verificacion del primer objeto []
      // creamos los objetos del tipo CTFile
      let result = objects.createCTfile(matrizContenido[0], matrizContenido[1], matrizContenido[2], matrizContenido[3])
      if (result['error']) {
        for (let k = 0; k < result.error.length; k++) {
          const error = result.error[k]
          ripObject.result.push(objects.createErrorReader('#VALIDATOR/TYPE||VALUE', i + 1, error))
          errorCount = errorCount + 1
        }
      } else {
        tempbuffer.push(result)
      }
    } else { // en caso de no cumplir con el numero de columnas, lanzar error de estructura y detener la validacion
      ripObject.result.push(objects.createErrorReader('#VALIDATOR/STRUCTURE', i + 1, 'El numero de columnas para este archivo es de ' + columnLimit + ' y esta linea cuenta con ' + matrizContenido.length))
      errorCount = errorCount + 1
    }
  }
  // verificamos si existieron cambios en el buffer temporal y reemplazamos
  if (tempbuffer.length !== 0) {
    ripObject.buffer = tempbuffer
  }
  // verificamos los nombres de los archivos
  let verifiedFiles = 0 // nombres de archivos verificados y cantidad de registros verificados
  let line = 1
  ripObject.buffer.forEach(element => {
    let nameVerified = false
    let numberVerified = false
    ripCollection.forEach(file => {
      if (element.codigoArchivo === file.fileName) {
        nameVerified = true
        let numberlines = file.buffer.split('\n')
        if (element.totalRegistros === numberlines.length) {
          numberVerified = true
        }
      }
    })
    if (nameVerified === true && numberVerified === true) {
      verifiedFiles = verifiedFiles + 1
    } else if (nameVerified === true && numberVerified === false) {
      ripObject.result.push(objects.createErrorReader('#VALIDATOR/TYPE||VALUE', line, 'La cantidad de registros en el archivo: ' + element.codigoArchivo + ' no coincide con el especificado en la Columna 4'))
      errorCount = errorCount + 1
    } else if (nameVerified === false && numberVerified === true) {
      ripObject.result.push(objects.createErrorReader('#VALIDATOR/TYPE||VALUE', line, 'El nombre del archivo ' + element.codigoArchivo + ' especificado en la Columna 3, no coincide con el real del archivo'))
      errorCount = errorCount + 1
    } else if (nameVerified === false && numberVerified === false) {
      ripObject.result.push(objects.createErrorReader('#VALIDATOR/TYPE||VALUE', line, 'La cantidad de registros en el archivo: ' + element.codigoArchivo + ' no coincide con el especificado en la Columna 4'))
      ripObject.result.push(objects.createErrorReader('#VALIDATOR/TYPE||VALUE', line, 'El nombre del archivo ' + element.codigoArchivo + ' especificado en la Columna 3, no coincide con el real del archivo'))
      errorCount = errorCount + 2
    }
  })
  ripObject.errors = errorCount
  if (errorCount === 0) {
    ripObject.stateDB = objects.createErrorReader('?VERIFIED')
  } else {
    ripObject.stateDB = objects.createErrorReader('#VERIFIED')
  }
  return ripObject
}

// Funcion de sistema utilizada pra validar un archivo del tipo AF
exports._validatorAF = (ripObject, ripCollection) => {
  const objects = require('./objects')
  let columnLimit = 17 // limite de columnasdel archivo
  let tempbuffer = [] // objeto temporal para hacer cambios
  let errorCount = 0 // contador de errores
  // recorrer linea por linea el buffer
  for (let i = 0; i < ripObject.buffer.length; i++) {
    const linea = ripObject.buffer[i] // obtenemos la linea actual en la que esta parada
    let matrizContenido = linea.split(',') // obtenemos la matriz de la linea
    // verificamos que el numero de columnas de la linea sea el indicado por el tipo de archivo
    if (matrizContenido.length === columnLimit) {
      // guardamos el Log de estructura en el temporal
      ripObject.result.push(objects.createErrorReader('?VALIDATOR/STRUCTURE/COLUMNS', i + 1))
      // le damos formato correcto a los objetos de la linea
      // verificacion del primer objeto []
      // creamos los objetos del tipo CTFile
      let result = objects.createAFfile(matrizContenido[0], matrizContenido[1], matrizContenido[2], matrizContenido[3], matrizContenido[4], matrizContenido[5], matrizContenido[6], matrizContenido[7], matrizContenido[8], matrizContenido[9], matrizContenido[10], matrizContenido[11], matrizContenido[12], matrizContenido[13], matrizContenido[14], matrizContenido[15], matrizContenido[16])
      if (result['error']) {
        for (let k = 0; k < result.error.length; k++) {
          const error = result.error[k]
          ripObject.result.push(objects.createErrorReader('#VALIDATOR/TYPE||VALUE', i + 1, error))
          errorCount = errorCount + 1
        }
      } else {
        tempbuffer.push(result)
      }
    } else { // en caso de no cumplir con el numero de columnas, lanzar error de estructura y detener la validacion
      ripObject.result.push(objects.createErrorReader('#VALIDATOR/STRUCTURE', i + 1, 'El numero de columnas para este archivo es de ' + columnLimit + ' y esta linea cuenta con ' + matrizContenido.length))
      errorCount = errorCount + 1
    }
  }
  // verificamos si existieron cambios en el buffer temporal y reemplazamos
  if (tempbuffer.length !== 0) {
    ripObject.buffer = tempbuffer
  }
  ripObject.errors = errorCount
  if (errorCount === 0) {
    ripObject.stateDB = objects.createErrorReader('?VERIFIED')
  } else {
    ripObject.stateDB = objects.createErrorReader('#VERIFIED')
  }
  return ripObject
}

// Funcion de sistema utilizada para validar un archivo del tipo US
exports._validatorUS = (ripObject, ripCollection) => {
  const objects = require('./objects')
  let columnLimit = 14 // limite de columnasdel archivo
  let tempbuffer = [] // objeto temporal para hacer cambios
  let errorCount = 0 // contador de errores
  // recorrer linea por linea el buffer
  for (let i = 0; i < ripObject.buffer.length; i++) {
    const linea = ripObject.buffer[i] // obtenemos la linea actual en la que esta parada
    let matrizContenido = linea.split(',') // obtenemos la matriz de la linea
    // verificamos que el numero de columnas de la linea sea el indicado por el tipo de archivo
    if (matrizContenido.length === columnLimit) {
      // guardamos el Log de estructura en el temporal
      ripObject.result.push(objects.createErrorReader('?VALIDATOR/STRUCTURE/COLUMNS', i + 1))
      // le damos formato correcto a los objetos de la linea
      // verificacion del primer objeto []
      // creamos los objetos del tipo CTFile
      let result = objects.createUSfile(matrizContenido[0], matrizContenido[1], matrizContenido[2], matrizContenido[3], matrizContenido[4], matrizContenido[5], matrizContenido[6], matrizContenido[7], matrizContenido[8], matrizContenido[9], matrizContenido[10], matrizContenido[11], matrizContenido[12], matrizContenido[13])
      if (result['error']) {
        for (let k = 0; k < result.error.length; k++) {
          const error = result.error[k]
          ripObject.result.push(objects.createErrorReader('#VALIDATOR/TYPE||VALUE', i + 1, error))
          errorCount = errorCount + 1
        }
      } else {
        tempbuffer.push(result)
      }
    } else { // en caso de no cumplir con el numero de columnas, lanzar error de estructura y detener la validacion
      ripObject.result.push(objects.createErrorReader('#VALIDATOR/STRUCTURE', i + 1, 'El numero de columnas para este archivo es de ' + columnLimit + ' y esta linea cuenta con ' + matrizContenido.length))
      errorCount = errorCount + 1
    }
  }
  // verificamos si existieron cambios en el buffer temporal y reemplazamos
  if (tempbuffer.length !== 0) {
    ripObject.buffer = tempbuffer
  }
  ripObject.errors = errorCount
  if (errorCount === 0) {
    ripObject.stateDB = objects.createErrorReader('?VERIFIED')
  } else {
    ripObject.stateDB = objects.createErrorReader('#VERIFIED')
  }
  return ripObject
}
