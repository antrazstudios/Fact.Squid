// Instancias de Librerias
const q = require('q') // Requiere la libreria q para exportar promesas como objetos sin afectar la modularidad
const settings = require('./settings') // Seinstancia libreria de settings.
/**
 * Elimina un objeto de una matriz de acuerdo a un valor en cierto atributo.
 *
 * Recorre una matriz verificando elemento por elemento en cada atributo enviado en la matriz de atributos
 * que el valor sea el indicado y elimina el objeto.
 *
 * @param {array} arr - Recibe una matriz para trabajar.
 * @param {string} attr - Define el atributo en donde se busca el valor para comparar y remover.
 * @param {string} value - El valor de comparacion que define la eliminacion del objeto.
 * @returns {array} Matriz nueva con el o los objetos removidos.
 */
exports.removeValueinArray = (arr, attr, value) => {
  var i = arr.length
  while (i--) {
    if (arr[i] && arr[i].hasOwnProperty(attr) && (arguments.length > 2 && arr[i][attr] === value)) {
      arr.splice(i, 1)
    }
  }
  return arr
}

/**
 * Filtra un arreglo o una matriz de acuerdo a ciertos parametros.
 *
 * @param {array} arr - Recibe una matriz para trabajar.
 * @param {array} columns - Recibe una matriz que contiene las columnas del arreglo incial para evaluar el filtro.
 * @param {string} value - El valor para comparar y ejecutar el filtro.
 * @returns {array} Matriz filtrada
 */
exports.filterValueinArray = (arr, columns, value) => {
  return arr.filter((row) => {
    for (let i = 0; i < columns.length - 1; i++) {
      if (String(row[columns[i].key]).toLowerCase().indexOf(value.toLowerCase()) !== -1) {
        return true
      }
    }
  })
}

/**
 * Verifica el tipo de dato de una cadena String y la regresa en su tipo Original, retorna el valor en el tipo correcto.
 *
 * @param {string} type - El tipo de valor que puede verificar: 'numeric', 'double', 'string', 'string-numeric', 'string-special', 'date'.
 * @param {obj} value - Es un objeto en el que se hara la verificacion.
 * @param {string} [format=null] - Se utiliza para verificar formatos en fechas: 'dd/mm/aaaa', 'dd-mm-aaaa'.
 */
exports.verifiedType = (type, value, format = null) => {
  let result = 'ERROR'
  let permitidosNumeric = '1234567890'
  let permitidosDate = '1234567890' + '/'
  let permitidosStringUPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let permitidosSpecial = '-+[](){}'
  switch (type) {
    case 'numeric':
      const valuesPermitidosN = this._verifiedPermittedValues(permitidosNumeric, value, 'number')
      if (valuesPermitidosN === false) {
        return result
      }
      result = parseInt(value)
      break
    case 'date':
      const valuesPermitidosD = this._verifiedPermittedValues(permitidosDate, value, 'date')
      if (valuesPermitidosD === false) {
        return result
      }
      let tempDate = this.convertStringToDate(value, format)
      if (tempDate === 'ERROR') {
        return tempDate
      } else {
        result = tempDate
      }
      break
    case 'string-numeric':
      const valuesPermitidosSN = this._verifiedPermittedValues(permitidosStringUPPER + permitidosNumeric, value, 'string')
      if (valuesPermitidosSN === false) {
        return result
      }
      result = value
      break
    case 'string-special':
      const valuesPermitidosSS = this._verifiedPermittedValues(permitidosNumeric + permitidosSpecial, value, 'string')
      if (valuesPermitidosSS === false) {
        return result
      }
      result = value
      break
    default:
      break
  }
  return result
}

/**
 * Verifica valores permitidos entre dos cadenas de texto o tipos de datos.
 *
 * @param {string} permittedString - Cadena de caracteres permitidos.
 * @param {string} value - Valor que se comparara con los caracteres permitidos.
 * @param {obj} [additionaltype=null] - Valor opcional que se utiliza para comparar tipos que no son string.
 * @returns {boolean} Retorna 'false' si falla la verificacion y 'true' si es exitosa.
 */
exports._verifiedPermittedValues = (permittedString, value, additionaltype = null) => {
  // verificamos el tipo de valor recepcionado
  if (this._getType(value) === 'string') { // en caso de ser string
    let splitValue = [] // creamos un split del value recepcionado, para eliminar valores vacios
    for (var i = 0; i < value.length; i++) { // recorremos caracter por caracter el string
      let tempValue = value.charAt(i).toString() // descomponemos el string
      if (tempValue.charCodeAt(0) !== 13) { // verificamos que no este vacio el char actual
        splitValue.push(tempValue) // si no esta vacio se agrega al nuevo arreglo
      }
    }
    // Recorremos el nuevo array generado limpio
    for (let i = 0; i < splitValue.length; i++) {
      let coincidencia = 0 // bandera de coincidencias
      for (let j = 0; j < permittedString.split('').length; j++) { // recorremos los valores permittedString
        if (splitValue[i] === permittedString.split('')[j]) { // comparamos que el char actual del array generado este entre los permittedString
          coincidencia = 1 // definimos que existe coincidencia
        }
      }
      // al teminar el recorrido de los array, verificamos si no existio coincidencia para retornar false
      if (coincidencia === 0) {
        return false
      }
    }
  } else {
    if (this._getType(value) === additionaltype) { // en caso que no sea string, verificamos coincidencia del formato requerido frente al real
      return true
    } else {
      return false
    }
  }
  return true
}

/**
 * Obtiene el nombre del tipo del objeto o variable que recibe.
 *
 * @param {var} obj - Objeto a obtener el tipo.
 * @returns {string} El nombre del tipo del objeto.
 */
exports._getType = (obj) => {
  // var type
  // faster than if/else
  return ({}).toString.call(obj).match(/\s([a-z|A-Z]+)/)[1].toLowerCase()
}

/**
 * Funcion que crea un archivo comprimido en formato 'ZIP' de una coleccion de archivos.
 *
 * @param {array} filesCollection - Matriz que contiene los archivos a convertir en un archivo comprimido.
 * @param {string} [pathToSave='default'] - Cadena que representa la ubicacion en la que se quiere almacenar el archivo.
 * @param {string} [filenameToSave='tempZipFile.zip'] - Cadena que representa el nombre del archivo junto con la extension '.zip'.
 * @returns {promise} Retorna una promesa, en 'catch' una variable con el error, en 'then' { pathFile, blobFile }.
 */
exports.createZipFile = (filesCollection, pathToSave = 'default', filenameToSave = 'tempZipFile.zip') => {
  let deferred = q.defer()
  var JSZip = require('jszip')
  var zip = new JSZip()
  if (pathToSave === 'default') {
    pathToSave = settings.getDocumentsPath() + 'temp'
  }
  filesCollection.forEach(file => {
    zip.file(file.name, file.content)
  })
  zip.generateAsync({type: 'arraybuffer'}).then((blob) => {
    var bufferBlob = Buffer.from(blob, 'binary')
    require('fs').writeFile(pathToSave + filenameToSave, bufferBlob, (err) => {
      if (err) {
        console.log('No ha sido posible guardar el archivo', err)
        deferred.reject(err)
      }
      deferred.resolve({
        pathFile: pathToSave + filenameToSave,
        blobFile: bufferBlob
      })
    })
  })
  return deferred.promise
}

/**
 * Convierte una fecha en una cadena para almacenar.
 *
 * @param {Date} val - La fecha en su respectivo formato para convertir.
 * @returns {string} Fecha en cadena de texto en formato para datetime dd-mm-aaaa ##:##:##.
 */
exports.convertDateToStringStorage = (val) => {
  let dateWork = new Date(val)
  return dateWork.toLocaleDateString() + ' ' + dateWork.toLocaleTimeString()
}

/**
 * Convierte una cadena de texto y la convierte a fecha siguiento un formato especifico.
 *
 * @param {string} value - Recibe una cadena para convertir.
 * @param {string} format - Recibe una cadena con el formato de fecha a convertir: 'dd/mm/aaaa', 'dd-mm-aaaa'.
 * @returns {Date} Objeto Date con la fecha. si no especifica hora, la hora que toma es 12:00:00, o una cadena de texto en caso de no poder realizar la conversion.
 */
exports.convertStringToDate = (value, format) => {
  let dateSplit
  let result
  switch (format) {
    case 'dd/mm/aaaa':
      dateSplit = value.split('/')
      result = new Date(parseInt(dateSplit[2]), parseInt(dateSplit[1]) - 1, parseInt(dateSplit[0]), 12, 0, 0, 0)
      break
    case 'dd-mm-aaaa':
      dateSplit = value.split('-')
      result = new Date(parseInt(dateSplit[2]), parseInt(dateSplit[1]) - 1, parseInt(dateSplit[0]), 12, 0, 0, 0)
      break
    default:
      result = 'ERROR DE CONVERSION, FORMATO NO RECONOCIDO'
      break
  }
  return result
}

/**
 * Convierte una variable en un objeto de fecha.
 *
 * @deprecated 0.0.2 Use convertDateToStringStorage() instead.
 * @param {var} val - Recibe una variable.
 */
exports.convertDateToStringSQL = (val) => {
  let dateWork = new Date(val)
  let dateMatriz = dateWork.toLocaleDateString().split('/')
  return dateMatriz[2] + '-' + dateMatriz[1] + '-' + dateMatriz[0]
}

/**
 * Convierte un Base64 en BLOB para realizar el almacenamiento.
 *
 * @param {String} val Cadena del tipo Base64 para convertir a {BLOB}.
 * @param {String} contentType - Tipo de contenido a convertir.
 * @returns {Blob} Objeto convertido en Blob.
 */
exports.convertBase64ToBLOB = (val, contentType) => {
  var byteCharacters = atob(val)
  var byteNumbers = new Array(byteCharacters.length)
  for (var i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i)
  }
  var byteArray = new Uint8Array(byteNumbers)
  var blob = new Blob([byteArray], {type: contentType})
  return blob
}

/**
 * Lee un documento XLSX de glosa, y retorna un objeto con los datos del mismo.
 *
 * @param {Object} documento - Objeto woorkbook de la libreria 'exceljs.
 * @returns {Q.Promise<Array>} Un apromesa (.then) Collecion del objeto Glosa de Objects.js, (catch) Variable que contiene el 'err' generado durante la ejecucion.
 */
exports.decodeXLSXGlosas = (documento) => {
  let deferred = q.defer()
  try {
    const objects = require('./objects')
    // Variable de Retorno
    let glosa = {
      documentoGestor: '',
      fechaDocumento: '',
      tipoDocumento: '',
      nit: '',
      facturas: []
    }
    // obtenemos la pagina que contiene la glosa
    let worksheetDETAILS = documento.getWorksheet('DETAILS')
    let worksheetGLOSAS = documento.getWorksheet('GLOSAS')
    // verificamos la version del decodificador
    // verificacion del decodificador version 1.0
    if (worksheetDETAILS.getCell('B1').value === '3.0') {
      worksheetGLOSAS.eachRow((row, rowNumber) => {
        if (row.values[1] === 'DOCUMENTO GESTOR') {
          glosa.documentoGestor = row.values[2]
        } else if (row.values[1] === 'FECHA DOCUMENTO') {
          glosa.fechaDocumento = new Date(row.values[6], row.values[5] - 1, row.values[4], 12, 0, 0, 0)
          console.log(glosa.fechaDocumento)
        } else if (row.values[1] === 'TIPO') {
          glosa.tipoDocumento = row.values[2].substr(0, 1)
        } else if (row.values[1] === 'NIT') {
          glosa.nit = row.values[2]
        } else if (row.values[1] === 'FACTURA') {
          console.log('Leyendo Encabezados de plantilla de glosas')
        } else {
          glosa.facturas.push(objects.createGlosas(0, glosa.tipoDocumento, row.values[1], row.values[2], row.values[3], row.values[4], row.values[5], row.values[6]))
        }
      })
      deferred.resolve(glosa)
    } else {
      deferred.reject('La version de la plantilla no coincide con las admitidas por el sistema')
    }
  } catch (error) {
    deferred.reject(error)
  }
  return deferred.promise
}

/**
 * Crea un documento dependiendo del tipo de documentos establecidos en la BD principal o modelo de la misma.
 *
 * @param {Object} configuracion - Configuracion para crear un archivo.
 * @param {String} configuracion.consecutivo - numero del consecutivo del documento para generar la glosas.
 * @param {String} configuracion.entidadNombre - nombre de la entidad destinataria del paquete de glosas.
 * @param {String} configuracion.nombreGestor - nombre del gestor remitente de la glosa.
 * @param {String} configuracion.fechaDocumento - fecha en que se genera el documento.
 * @param {String} configuracion.contenido - collecion de glosas que van dentro del paquete de glosas.
 * @param {String} configuracion.formato - formato en modo buffer para ser trabajado.
 * @param {String} configuracion.encabezadoImg - Imagen del operador que va en el encabezado.
 * @param {String} configuracion.tipo - tipo de documento segun nomenclatura del modelo actual de la BD.
 * @param {Buffer} configuracion.firmaImg - Imagen de la firma digital del gestor.
 * @returns {Buffer} - Buffer para carga a la BD
 */
exports.createDocumento = (configuracion) => {
  // configuracion. consecutivo = numero del consecutivo del documento para generar la glosas
  // configuracion. entidadNombre = nombre de la entidad destinataria del paquete de glosas
  // configuracion. nombreGestor = nombre del gestor remitente de la glosa
  // configuracion. fechaDocumento = fecha en que se genera el documento
  // configuracion. contenido = collecion de glosas que van dentro del paquete de glosas
  // configuracion. formato = formato en modo buffer para ser trabajado
  // configuracion. encabezadoImg = Imagen del operador que va en el encabezado
  // configuracion. tipo = tipo de documento segun nomenclatura del modelo actual de la BD
  // configuracion. firmaImg = Imagen de la firma digital del gestor
  // return:
  // retorna un buffer listo para cargar a BD del archivo de la glosa
  let deferred = q.defer()
  // Primero se escribira el archivo temporal basandonos en el formato
  var bufferBlob = Buffer.from(configuracion.formato, 'binary')
  const pathDownload = require('./settings.js').getDocumentsPath()
  const fs = require('fs')
  fs.writeFile(pathDownload + 'temps/temp_document.xlsx', bufferBlob, (err) => {
    if (err) {
      console.log('No ha sido posible guardar el archivo', err)
      deferred.reject(err)
    }
    // luego se realizarse la escritura del archivo se procede a leer con la libreria de excel
    var Excel = require('exceljs')
    var workbook = new Excel.Workbook()
    workbook.xlsx.readFile(pathDownload + 'temps/temp_document.xlsx').then(() => {
      if (configuracion.tipo === 2 || configuracion.tipo === '2') {
        let sheetFormato = workbook.getWorksheet('GLOSA INICIAL')
        // insertamos la imagen
        let imageEncabezado = workbook.addImage({
          buffer: Buffer.from(configuracion.encabezadoImg, 'binary'),
          extension: 'png'
        })
        // le damos formato a la imagen
        sheetFormato.addImage(imageEncabezado, {
          tl: {col: 0, row: 0.5},
          br: {col: 3.85, row: 1},
          editAs: 'oneCell'
        })
        // definicion del consecutivo de la glosa
        sheetFormato.getCell('C3').value = configuracion.consecutivo
        // definicion del nombre de la entidad destinataria
        sheetFormato.getCell('C4').value = configuracion.entidadNombre
        // definicion del nombre del gestor remitente
        sheetFormato.getCell('C5').value = configuracion.nombreGestor
        // definicion de la fecha del documento
        sheetFormato.getCell('G5').value = configuracion.fechaDocumento
        // definicion del contenido del paquete de glosas
        // primero definimos un punto de partida en las ROWs del libro
        let countItems = 0
        let row = 9 // linea de encabezados
        let totalvalorglosas = 0
        let totalvaloraceptado = 0
        let totalvalornoaceptado = 0
        configuracion.contenido.forEach(glosa => {
          // Generamos las sumas de saldos
          totalvalorglosas = totalvalorglosas + glosa.valor // suma de valor glosado
          totalvaloraceptado = totalvaloraceptado + glosa.valoraceptado // suma de valor aceptado
          totalvalornoaceptado = totalvalornoaceptado + glosa.valornoaceptado // suma de valor no aceptado
          // Definimos el contenido del documento
          row = row + 1 // nos movemos a la siguiente linea
          countItems = countItems + 1 // añadimos un nuevo item al contador
          sheetFormato.getCell('A' + row).value = countItems // definimos el numero de la lista o item
          // definimos formato de bordes
          sheetFormato.getCell('A' + row).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
          }
          sheetFormato.getCell('B' + row).value = glosa.factura // definimos el numero de factura de la glosa
          // definimos formato de bordes
          sheetFormato.getCell('B' + row).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
          }
          sheetFormato.getCell('C' + row).value = glosa.fecha // definimos la fecha del tramite
          // definimos formato de bordes
          sheetFormato.getCell('C' + row).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
          }
          sheetFormato.getCell('D' + row).value = glosa.valor // definimos el valor del tramite
          // definimos formato de bordes
          sheetFormato.getCell('D' + row).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
          }
          sheetFormato.getCell('E' + row).value = glosa.valoraceptado // definimos el valor aceptado del tramite por el gestor
          // definimos formato de bordes
          sheetFormato.getCell('E' + row).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
          }
          sheetFormato.getCell('F' + row).value = glosa.valornoaceptado // definimos el valor no aceptado del tramite por el gestor
          // definimos formato de bordes
          sheetFormato.getCell('F' + row).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
          }
          sheetFormato.getCell('G' + row).value = glosa.numerotramiteinterno // definimos el numero de tramite interno
          // definimos formato de bordes
          sheetFormato.getCell('G' + row).border = {
            top: {style: 'thin'},
            left: {style: 'thin'},
            bottom: {style: 'thin'},
            right: {style: 'thin'}
          }
        })
        // definimos los estilos para el contenido
        sheetFormato.getColumn(4).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00' // Formato de moneda
        sheetFormato.getColumn(5).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00' // Formato de moneda
        sheetFormato.getColumn(6).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00' // Formato de moneda
        // definimos los totales
        sheetFormato.getCell('C' + (row + 1)).alignment = {vertical: 'middle', horizontal: 'center'}
        sheetFormato.getCell('C' + (row + 1)).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        }
        sheetFormato.getCell('C' + (row + 1)).value = 'TOTAL:' // definimos el titulo total a una celda
        // definimos el estilo del texto y de los bordes
        sheetFormato.getCell('C' + (row + 1)).font = {
          bold: true
        }
        // definimos el total del valor de lo glosado
        sheetFormato.getCell('D' + (row + 1)).value = totalvalorglosas
        sheetFormato.getCell('D' + (row + 1)).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        }
        // definimos el total del valor de lo aceptado
        sheetFormato.getCell('E' + (row + 1)).value = totalvaloraceptado
        sheetFormato.getCell('E' + (row + 1)).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        }
        // definimos el total del valor de lo aceptado
        sheetFormato.getCell('F' + (row + 1)).value = totalvalornoaceptado
        sheetFormato.getCell('F' + (row + 1)).border = {
          top: {style: 'thin'},
          left: {style: 'thin'},
          bottom: {style: 'thin'},
          right: {style: 'thin'}
        }
        // definir firma del gestor
        // insertamos la firma digital desde el buffer
        let firmaGestor = workbook.addImage({
          buffer: Buffer.from(configuracion.firmaImg, 'binary'),
          extension: 'png'
        })
        sheetFormato.addImage(firmaGestor, {
          tl: {col: 2, row: row + 4},
          br: {col: 4.75, row: row + 11},
          editAs: 'oneCell'
        })
        // insertamos titulo de la firma
        sheetFormato.getCell('C' + (row + 12)).value = configuracion.nombreGestor
        sheetFormato.getCell('C' + (row + 13)).value = configuracion.numeroGestor
        // definimos los bordes de la firma
        sheetFormato.getCell('C' + (row + 12)).border = {
          top: {style: 'thin'}
        }
        sheetFormato.getCell('D' + (row + 12)).border = {
          top: {style: 'thin'}
        }
        sheetFormato.getCell('E' + (row + 12)).border = {
          top: {style: 'thin'}
        }
        sheetFormato.getCell('F' + (row + 12)).border = {
          top: {style: 'thin'}
        }
        workbook.xlsx.writeFile(pathDownload + 'temps/temp_document.xlsx').then(() => {
          deferred.resolve(pathDownload + 'temps/temp_document.xlsx')
        })
      }
    }).catch((err) => {
      deferred.reject(err)
    })
  })
  return deferred.promise
}

exports.deleteTempfiles = () => {
  // matriz que contiene los archivos temporales que deben ser eliminados
  let documentsMatriz = [
    {
      nombre: 'temp_compressRIPSZip.zip',
      origen: 'RIPS CONTENIDOS PARA CARGA'
    },
    {
      nombre: 'temp_document.xlsx',
      origen: 'DOCUMENTO TEMPORAL DE CARGA'
    }
  ]
  const settings = require('./settings')
  const fs = require('fs')
  documentsMatriz.forEach(documento => {
    try {
      fs.unlink(settings.getDocumentsPath() + documento.nombre, (err) => {
        if (err) {
          console.log(err)
        }
        console.log('DELETE TEMP FILE', documento.origen + ': ' + documento.nombre)
      })
    } catch (e) {
      console.log(e)
    }
  })
}
