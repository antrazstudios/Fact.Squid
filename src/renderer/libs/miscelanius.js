
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
  return dateWork.getFullYear() + '-' + dateWork.getMonth() + '-' + dateWork.getDate()
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
