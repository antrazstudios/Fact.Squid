import fs from 'fs'
(function () {
  const {desktopCapturer} = require('electron')

  module.exports = {
    /**
     * Crea una instantanea de la pantalla utilizando desktopCapturer de Electron y lo almacena en una ubicacion especifica y un formato especifico
     * @param pathSave {String} Ubicacion para almacenar la captura
     * @param callback {Function} Accion a realizarse cuando el proceso ha finalizado
     * @param imageFormat {String} Formato para generar la imagen ('image/jpg' or 'image/png')
     * @returns {string} La ubicacion del archivo almacenado
     **/
    fullscreenScreenshot (pathSave, callback, imageFormat) {
      var _this = this
      this.callback = callback
      imageFormat = imageFormat || 'image/jpeg'
      this.handleStream = (stream) => {
        // Create hidden video tag
        var video = document.createElement('video')
        video.style.cssText = 'position:absolute;top:-10000px;left:-10000px;'
        // Event connected to stream
        video.onloadedmetadata = function () {
          // Set video ORIGINAL height (screenshot)
          video.style.height = this.videoHeight + 'px' // videoHeight
          video.style.width = this.videoWidth + 'px' // videoWidth

          // Create canvas
          var canvas = document.createElement('canvas')
          canvas.width = this.videoWidth
          canvas.height = this.videoHeight
          var ctx = canvas.getContext('2d')
          // Draw video on canvas
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          // Create a File with data
          let ext = '.' + imageFormat.replace('image/', '')
          let base64Data = canvas.toDataURL(imageFormat).replace(/^data:image\/png;base64,/, '')
          let capturePath = pathSave + Date.now() + ext
          require('fs').writeFile(capturePath, base64Data, 'base64', (err) => {
            if (err) console.log(err)
            if (_this.callback) {
              // Save screenshot to base64
              _this.callback(capturePath)
            } else {
              console.log('Need callback!')
            }
          })
          // Remove hidden video tag
          video.remove()
          try {
            // Destroy connect to stream
            stream.getTracks()[0].stop()
          } catch (e) {}
        }
        video.src = URL.createObjectURL(stream)
        document.body.appendChild(video)
      }

      this.handleError = function (e) {
        console.log(e)
      }

      // Filter only screen type
      desktopCapturer.getSources({types: ['screen']}, (error, sources) => {
        if (error) throw error
        // console.log(sources);
        for (let i = 0; i < sources.length; ++i) {
          console.log(sources)
          // Filter: main screen
          if (sources[i].name === 'Entire screen') {
            navigator.webkitGetUserMedia({
              audio: false,
              video: {
                mandatory: {
                  chromeMediaSource: 'desktop',
                  chromeMediaSourceId: sources[i].id,
                  minWidth: 1280,
                  maxWidth: 4000,
                  minHeight: 720,
                  maxHeight: 4000
                }
              }
            }, this.handleStream, this.handleError)
            return
          }
        }
      })
    },
    Car (make, model, year) {
      fs.writeSync()
      this.make = make
      this.model = model
      this.year = year
    }
  }
}())
