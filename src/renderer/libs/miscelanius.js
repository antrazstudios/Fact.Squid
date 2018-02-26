
const q = require('q')

exports.removeObjectinArray = (arr, attr, value) => {
  var i = arr.length
  while (i--) {
    if (arr[i] && arr[i].hasOwnProperty(attr) && (arguments.length > 2 && arr[i][attr] === value)) {
      arr.splice(i, 1)
    }
  }
  return arr
}

exports.filterMethod = (obj, columns, value) => {
  return obj.filter((row) => {
    for (let i = 0; i < columns.length - 1; i++) {
      if (String(row[columns[i].key]).toLowerCase().indexOf(value.toLowerCase()) !== -1) {
        return true
      }
    }
  })
}

exports.getEmojiURL = (code) => {
  return '/assets/images/emoji-72x72/' + code + '.png'
}

exports.createaZipFile = (filesCollection) => {
  let deferred = q.defer()
  var JSZip = require('jszip')
  var zip = new JSZip()
  const pathDownload = require('./settings.js').getDocumentsPath()
  filesCollection.forEach(file => {
    zip.file(file.name, file.content)
  })
  zip.generateAsync({type: 'arraybuffer'}).then((blob) => {
    var bufferBlob = Buffer.from(blob, 'binary')
    require('fs').writeFile(pathDownload + 'temp_compressRIPSZip.zip', bufferBlob, (err) => {
      if (err) {
        console.log('No ha sido posible guardar el archivo', err)
        deferred.reject(err)
      }
      deferred.resolve({
        pathFile: pathDownload + 'temp_compressRIPSZip.zip',
        blobFile: bufferBlob
      })
    })
  })
  return deferred.promise
}

exports.convertDateToStringStorage = (val) => {
  let dateWork = new Date(val)
  return dateWork.toLocaleDateString() + ' ' + dateWork.toLocaleTimeString()
}

exports.convertDateToStringSQL = (val) => {
  let dateWork = new Date(val)
  let dateMatriz = dateWork.toLocaleDateString().split('/')
  return dateMatriz[2] + '-' + dateMatriz[1] + '-' + dateMatriz[0]
}

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

exports.readFileRips = (file, _callback) => {
  // instanciamos al filereader
  let fileReader = new FileReader()
  // creamos un evento al terminar la carga de lectura del archivo
  fileReader.addEventListener('load', () => {
    // obtenemos el tipo de archivo que se cargara dependiendo del nombre
    let tipoArchivo = file.name.substr(0, 2)
    // obtenemos la cadena de texto separada con comas del base64 de la lectura
    let result = atob(fileReader.result.replace('data:text/plain;base64,', ''))
    // Llamamos al proceso de decodificacion del archivo segun el tipo de archivo
    let collection = this.decodeFileRips(tipoArchivo, result)
    // llamamos al callback y retornamos el valor
    _callback(collection)
  })
  // realizamos la lectura del archivo
  fileReader.readAsDataURL(file)
}

exports.decodeFileRips = (tipoArchivo, Contenido) => {
  // instanciar los objetos
  let objects = require('./objects')
  // matriz de respuesta
  let result = []
  // separamos las lineas del contenido
  let lines = Contenido.split('\n')
  if (tipoArchivo === 'AF') {
    // Comenzamos a recorrer las lineas del archivo una por una
    for (let i = 0; i < lines.length; i++) {
      const linea = lines[i]
      // Por cada linea las separamos por , y debemos obtener exactamente un length de 17
      let matrizContenido = linea.split(',')
      if (matrizContenido.length === 17) {
        result.push(objects.createAFfile(matrizContenido[0], matrizContenido[1], matrizContenido[2], matrizContenido[3], matrizContenido[4], matrizContenido[5], matrizContenido[6], matrizContenido[7], matrizContenido[8], matrizContenido[9], matrizContenido[10], matrizContenido[11], matrizContenido[12], matrizContenido[13], matrizContenido[14], matrizContenido[15], matrizContenido[16]))
      }
    }
  } else if (tipoArchivo === 'US') {
    // Comenzamos a recorrer las lineas del archivo una por una
    for (let i = 0; i < lines.length; i++) {
      const linea = lines[i]
      // Por cada linea las separamos por , y debemos obtener exactamente un length de 17
      let matrizContenido = linea.split(',')
      if (matrizContenido.length === 14) {
        result.push(objects.createUSfile(matrizContenido[0], matrizContenido[1], matrizContenido[2], matrizContenido[3], matrizContenido[4], matrizContenido[5], matrizContenido[6], matrizContenido[7], matrizContenido[8], matrizContenido[9], matrizContenido[10], matrizContenido[11], matrizContenido[12], matrizContenido[13]))
      }
    }
  }
  // retornamos la mtriz de resultado
  return result
}

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
    if (worksheetDETAILS.getCell('B1').value === '1.0') {
      worksheetGLOSAS.eachRow((row, rowNumber) => {
        if (row.values[1] === 'DOCUMENTO GESTOR') {
          glosa.documentoGestor = row.values[2]
        } else if (row.values[1] === 'FECHA DOCUMENTO') {
          glosa.fechaDocumento = row.values[2]
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

exports.createDocumento = (configuracion) => {
  // configuracion. consecutivo = numero del consecutivo del documento para generar la glosas
  // configuracion. entidadNombre = nombre de la entidad destinataria del paquete de glosas
  // configuracion. nombreGestor = nombre del gestor remitente de la glosa
  // configuracion. fechaDocumento = fecha en que se genera el documento
  // configuracion. contenido = collecion de glosas que van dentro del paquete de glosas
  // configuracion. formato = formato en modo buffer para ser trabajado
  // configuracion. tipo = tipo de documento segun nomenclatura del modelo actual de la BD
  // return:
  // retorna un buffer listo para cargar a BD del archivo de la glosa
  let deferred = q.defer()
  // Primero se escribira el archivo temporal basandonos en el formato
  var bufferBlob = Buffer.from(configuracion.formato, 'binary')
  const pathDownload = require('./settings.js').getDocumentsPath()
  require('fs').writeFile(pathDownload + 'temp_document.xlsx', bufferBlob, (err) => {
    if (err) {
      console.log('No ha sido posible guardar el archivo', err)
      deferred.reject(err)
    }
    // luego se realizarse la escritura del archivo se procede a leer con la libreria de excel
    var Excel = require('exceljs')
    var workbook = new Excel.Workbook()
    workbook.xlsx.readFile(pathDownload + 'temp_document.xlsx').then(() => {
      if (configuracion.tipo === 0) {
        let sheetFormato = workbook.getWorksheet('GLOSA INICIAL')
        // definicion del consecutivo de la glosa
        sheetFormato.getCell('C2').value = configuracion.consecutivo
        // definicion del nombre de la entidad destinataria
        sheetFormato.getCell('C3').value = configuracion.entidadNombre
        // definicion del nombre del gestor remitente
        sheetFormato.getCell('C4').value = configuracion.nombreGestor
        // definicion de la fecha del documento
        sheetFormato.getCell('G4').value = configuracion.fechaDocumento
        // definicion del contenido del paquete de glosas
        // primero definimos un punto de partida en las ROWs del libro
        let countItems = 0
        let row = 8 // linea de encabezados
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
          sheetFormato.getCell('B' + row).value = glosa.factura // definimos el numero de factura de la glosa
          sheetFormato.getCell('C' + row).value = glosa.fecha // definimos la fecha del tramite
          sheetFormato.getCell('D' + row).value = glosa.valor // definimos el valor del tramite
          sheetFormato.getCell('E' + row).value = glosa.valoraceptado // definimos el valor aceptado del tramite por el gestor
          sheetFormato.getCell('F' + row).value = glosa.valornoaceptado // definimos el valor no aceptado del tramite por el gestor
          sheetFormato.getCell('G' + row).value = glosa.numerotramiteinterno // definimos el numero de tramite interno
        })
        // definimos los estilos para el contenido
        sheetFormato.getColumn(4).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00' // Formato de moneda
        sheetFormato.getColumn(5).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00' // Formato de moneda
        sheetFormato.getColumn(6).numFmt = '"$"#,##0.00;[Red]-"$"#,##0.00' // Formato de moneda
        workbook.xlsx.writeFile(pathDownload + 'temp_document.xlsx')
      }
    }).catch((err) => {
      deferred.reject(err)
    })
  })
  return deferred.promise
}
