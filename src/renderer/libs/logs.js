const log4js = require('log4js') // log4js es la libreria que maneja los archivos de Log de eventos del sistema
const sett = require('./settings') // Libreria settings necesaria para algunas verificaciones
const fs = require('fs') // fs es una constante global para el manejo de archivos

/**
 * Crea la configuracion de almacenamiento de archivos de Log de eventos para la libreria log4js
 */
exports.createLogEventConfig = () => {
  log4js.configure(
    {
      appenders: {
        history: {
          type: 'dateFile',
          filename: sett.getDocumentsPath() + 'logs/logfile-production.log',
          maxLogSize: 10485760,
          backups: 30
        }
      },
      categories: {
        default: {
          appenders: ['history'],
          level: 'ALL'
        }
      }
    }
  )
}

/**
 * Inserta un nuevo evento en el archivo de eventos del sistema o LogEventFile con la libreria log4js
 * @param {string} message Es el contenido que llevara el evento, se utiliza para especificar informacion del evento
 * @param {string} level El nivel del evento que puede ser 'info', 'debug', 'warn', 'error', 'fatal', 'trace'
 */
exports.updateLogEventContent = (message, level = 'info') => {
  if (sett.getContentFromLocalKey('developerMode') !== 1) {
    // revisamos la existencia de la carpeta de /logs en el path general de Documentos
    fs.stat(sett.getDocumentsPath() + 'logs', (err, stats) => {
      // en caso de no existir la carpeta o generar un error se crea la carpeta /logs
      if (err) {
        console.log(err) // impresion del error en depuracion
        fs.mkdirSync(sett.getDocumentsPath() + 'logs') // creacion de la carpeta
      }
    })
    // Obtenemos el Logger desde la libreria, ya creado anteriormente
    const logger = log4js.getLogger()
    // Obtenemos el perfil de la sesion actual
    let user // variable de almacenamiento del perfil actual
    // Intentamos obtener el perfil actual
    try {
      user = sett.getSesionProfile().username
      // en caso de no obtenerlo guardamos en la variable 'NOT-LOGGED' para saber que no existia una sesion
    } catch (error) {
      user = 'NOT-LOGGED'
    }
    let connData // variable de almacenamiento de datos de conexion
    // Obtenemos la conexion actual
    let connName = sett.getConnectionName()
    const conn = sett.getConnectionbyId(sett.getKeyConnectionbyName(connName))
    // Evaluamos el valor de la const conn si es undefined enviamos 'NOT-CONN'
    if (conn === undefined) {
      connData = 'NOT-CONN'
    } else {
      connData = conn.host + '::' + conn.port + '::' + conn.database
    }
    let messageReady // variable de almacenamiento para el mensaje final
    let capturePath = 'NOT' // en caso que no haya que hacer captura
    // Definimos si es necesario hacer captura en el caso necesario se realiza de lo contrario enviamos los datos al archivo sin captura
    if (level === 'error' || level === 'fatal') {
      // creamos la constante con la libreria de la captura
      const capturer = require('./capturer')
      // realizamos la Captura
      let path = sett.getDocumentsPath() + 'logs/logfile-capture-'
      capturer.fullscreenScreenshot(path, (data) => {
        capturePath = data
        // creamos el message para almacenar
        messageReady = '[' + user + '] [' + connData + '] [' + capturePath + '] ' + message
        // realizamos el almacenamiento de la informacion
        logger[level](messageReady)
      }, 'image/png')
    } else {
      messageReady = '[' + user + '] [' + connData + '] [' + capturePath + '] ' + message
      // realizamos el almacenamiento de la informacion
      logger[level](messageReady)
    }
  }
}
