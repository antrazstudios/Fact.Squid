<template>
  <div class="content">
    <Row type="flex" style="margin: 0px 20px 10px 0px;">
      <i-col span="6">
        <i-button icon="arrow-left-c" type="text" @click="returnView()">Regresar</i-button>
      </i-col>
      <i-col span="18">
        <!-- <Input ref="searchInput" v-model="searchText" placeholder="Ingrese el dato a buscar">
          <span slot="prepend">Buscar: </span>
          <Tooltip slot="append" content="Ejecutar busqueda">
            <Button ref="searchButtonRun" icon="search" @click="searchClick()"></Button>
            <Button ref="searchButtonCancel" icon="close" @click="searchClick()" style="display: none"></Button>
          </Tooltip>
        </Input> -->
        <h2>Registro de eventos del sistema</h2>
      </i-col>
      <i-col span="6">
        <!-- <Tooltip content="Añadir nueva conexion" style="float: right" placement="left">
          <i-button icon="plus-round" type="info" @click="createNew()"></i-button>
        </Tooltip> -->
      </i-col>
    </Row>
    <i-table border :loading="loadingLogs" ref="connTable" stripe :height="$parent.maxHeightTable" :columns="columnsLogs" :data="dataLogs" size="small"></i-table>
    <!-- <Row>
      <Card ref="connEditor" style="margin: 20px 0px; display: none" dis-hover>
        <div slot="title">
          <p style="display: inline-table">Formulario de Edicion: </p>
          <Tag type="border" style="display: inline-table">{{formType}}</Tag>
        </div>
        <div slot="extra" style="margin: 0">
          <i-button slot="extra" @click="saveClick()">Guardar</i-button>
          <i-button slot="extra" @click="cancelClick()">Cancelar</i-button>
        </div>
        <div>
          <Form class="form-object" ref="connectionEdit" :model="connectionEdit" :rules="ruleInline" :label-width="150">
            <FormItem prop="name" label="Nombre del perfil">
              <Input type="text" v-model="connectionEdit.name"></Input>
            </FormItem>
            <FormItem prop="host" label="Direccion del servidor">
              <Input type="text" v-model="connectionEdit.host"></Input>
            </FormItem>
            <FormItem prop="port" label="Numero del puerto">
              <Input type="text" v-model="connectionEdit.port"></Input>
            </FormItem>
            <FormItem prop="database" label="Nombre de la BD">
              <Input type="text" v-model="connectionEdit.database"></Input>
            </FormItem>
            <FormItem prop="usd" label="Usuario en BD">
              <Input type="text" v-model="connectionEdit.usd"></Input>
            </FormItem>
            <FormItem prop="pwd" label="Contraseña">
              <Input type="password" v-model="connectionEdit.pwd"></Input>
            </FormItem>
          </Form>
        </div>
      </Card>
    </Row> -->
  </div>
</template>
<script>
  import logDetails from './logDetails.vue'
  export default {
    name: 'settings-log',
    components: { logDetails },
    data () {
      return {
        columnsLogs: [],
        dataLogs: [],
        loadingLogs: true,
        settings: require('../../libs/settings')
      }
    },
    mounted () {
      this.readLocalData()
    },
    methods: {
      /**
       * Lee los datos locales del LOG del sistema
       */
      readLocalData () {
        this.loadingLogs = true
        // Verificamos la existencia de la carpeta de Logs
        const fs = require('fs')
        const pathLogs = this.settings.getDocumentsPath() + 'logs'
        fs.stat(pathLogs, (err, stats) => {
          if (err) {
            console.log(err)
            this.loadingLogs = false
            this.$Message.error({
              content: 'No existen datos en el Log del sistema para mostrar.',
              duration: 8
            })
          }
          this.readLogFilesCollection(pathLogs, (content) => {
            this.dataLogs = this.decodeLogFiles(content)
            this.createColumns()
            this.loadingLogs = false
          }, (err) => {
            console.log(err)
            this.loadingLogs = false
          })
        })
      },
      /**
       * Lee los archivos de una carpeta especifica en donde se almacene los datos locales dle LOG
       * @param dirname {String} Directorio o carpeta que contiene los archivos
       * @param onEnd {Function} Funcion a ejecutarse en caso que la lectura sea exitosa
       * @param onError {Function} Funcion a ejecutarse en caso que la lectura presente un error
       */
      readLogFilesCollection (dirname, onEnd, onError) {
        const fs = require('fs')
        fs.readdir(dirname, function (err, filenames) {
          if (err) {
            onError(err)
          } else {
            let count = 0
            let readCount = 0
            let data = ''
            // evaluar cuantos archivos estan para lectura
            filenames.forEach(filename => {
              if (filename.indexOf('.log') > -1) {
                count++
              }
            })
            filenames.forEach(function (filename) {
              if (filename.indexOf('.log') > -1) {
                fs.readFile(dirname + '/' + filename, 'utf-8', function (err, content) {
                  if (err) {
                    onError(err)
                  } else {
                    data = content + data
                    readCount++
                    if (readCount === count) {
                      onEnd(data)
                    }
                  }
                })
              }
            })
          }
        })
      },
      /**
       * Decodifica en objetos una cadena de texto que cumpla con la estructura del archivo LOG
       * @param obj {String} Cadena con saltos de linea que cumple con la estructura del archivo LOG
       */
      decodeLogFiles (obj) {
        const objects = require('../../libs/objects') // objetos
        // Matriz a devolver
        let data = []
        // Creamos una matriz con las lineas del obj
        let tempmatriz = obj.split('\n')
        for (let i = 0; i < tempmatriz.length; i++) {
          const linea = tempmatriz[i]
          if (linea.length !== 0) {
            // Variables de almacenamiento
            let datetime, level, category, nickname, conn, capturePath, description
            let firtsposition = 0
            let lastposition = 0
            lastposition = linea.indexOf(']', firtsposition) // Obtenemos la posicion del primer ]
            datetime = linea.substring(firtsposition + 1, lastposition) // Extraemos lo que contiene el primer []
            firtsposition = lastposition + 2
            lastposition = linea.indexOf(']', firtsposition) // Obtenemos la posicion del segundo ]
            level = linea.substring(firtsposition + 1, lastposition) // Extraemos lo que contiene el segundo []
            firtsposition = lastposition + 2
            lastposition = linea.indexOf(' ', firtsposition) // Obtenemos la posicion del segundo ]
            category = linea.substring(firtsposition, lastposition) // Extraemos la categoria separada por espacios
            firtsposition = lastposition + 3
            lastposition = linea.indexOf(']', firtsposition) // Obtenemos la posicion del tercer ]
            nickname = linea.substring(firtsposition + 1, lastposition) // Extraemos lo que contiene el tercer []
            firtsposition = lastposition + 2
            lastposition = linea.indexOf(']', firtsposition) // Obtenemos la posicion del tercer ]
            conn = linea.substring(firtsposition + 1, lastposition) // Extraemos lo que contiene el tercer []
            firtsposition = lastposition + 2
            lastposition = linea.indexOf(']', firtsposition) // Obtenemos la posicion del tercer ]
            capturePath = linea.substring(firtsposition + 1, lastposition) // Extraemos lo que contiene el tercer []
            firtsposition = lastposition + 2
            description = linea.substring(firtsposition, linea.length) // Extraemos lo que contiene el tercer []
            // finalmente creamos los objetos
            data.push(objects.createLogs(new Date(datetime), level, category, nickname, conn, capturePath, description))
          }
        }
        let dataInv = []
        let items = data.length - 1
        while (items > -1) {
          dataInv.push(data[items])
          items = items - 1
        }
        return dataInv
      },
      /**
       * Crea las columnas del objeto tabla
       */
      createColumns () {
        this.columnsLogs = []
        // Detalles del suceso
        this.columnsLogs.push({
          type: 'expand',
          width: 50,
          render: (h, params) => {
            return h(logDetails, {
              props: {
                row: params.row
              }
            })
          }
        })
        // Creamos la columna de Fecha
        this.columnsLogs.push({
          title: 'Fecha suceso',
          render: (h, {row}) => {
            return h('label', {}, row.datetime.toLocaleDateString())
          },
          width: 180
        })
        // Creamos la columna del nivel
        this.columnsLogs.push({
          title: 'Nivel',
          render: (h, {row}) => {
            return h('Tag', {
              props: {
                color: row.level === 'INFO' ? '#2980b9' : row.level === 'WARN' ? '#f39c12' : row.level === 'ERROR' ? '#e74c3c' : row.level === 'FATAL' ? '#c0392b' : row.level === 'TRACE' ? '#16a085' : '#8e44ad'
              }
            }, row.level)
          },
          filters: [
            {
              label: 'DEBUG',
              value: 1
            },
            {
              label: 'INFO',
              value: 2
            },
            {
              label: 'WARN',
              value: 3
            },
            {
              label: 'ERROR',
              value: 4
            },
            {
              label: 'FATAL',
              value: 5
            },
            {
              label: 'TRACE',
              value: 6
            }
          ],
          filterMultiple: true,
          filterValueinArray (value, row) {
            if (value === 1) {
              return row.level === 'DEBUG'
            } else if (value === 2) {
              return row.level === 'INFO'
            } else if (value === 3) {
              return row.level === 'WARN'
            } else if (value === 4) {
              return row.level === 'ERROR'
            } else if (value === 5) {
              return row.level === 'FATAL'
            } else if (value === 6) {
              return row.level === 'TRACE'
            }
          },
          width: 100
        })
        // Creamos la columna de la categoria
        this.columnsLogs.push({
          title: 'Categoria',
          render: (h, {row}) => {
            // return row.fecha.toLocaleDateString()
            return h('label', {}, row.category)
          },
          width: 150
        })
        // Cremos la Columna del nickname
        this.columnsLogs.push({
          title: 'Usuario',
          render: (h, {row}) => {
            // return row.fecha.toLocaleDateString()
            return h('label', {}, row.nickname)
          },
          filters: this.createFiltersNickname(),
          filterMultiple: true,
          filterValueinArray (value, row) {
            if (value === row.nickname) {
              return true
            } else {
              return false
            }
          },
          width: 150
        })
        // Cremos la Columna del conexion
        this.columnsLogs.push({
          title: 'Conexion al Servidor',
          render: (h, {row}) => {
            let connMatrix = row.conn.split('::')
            let objects = []
            connMatrix.forEach(element => {
              objects.push(h('Tag', {}, element))
            })
            return h('div', {
              style: {
                display: 'inline'
              }
            }, objects)
          }
        })
      },
      createFiltersNickname () {
        let filterNick = []
        this.dataLogs.forEach(element => {
          let coincidence = 0
          filterNick.forEach(nicks => {
            if (nicks.label === element.nickname) {
              coincidence = 1
            }
          })
          if (coincidence === 0) {
            filterNick.push({
              label: element.nickname,
              value: element.nickname
            })
          }
        })
        return filterNick
      },
      returnView () {
        this.$parent.returnPath()
      }
    }
  }
</script>
<style scoped>
.content{
    width: 100%;
    min-height: 100%;
    padding: 20px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
  }
  .layout-text-item{
    margin: 8px 0px;
  }
  .form-text{
    text-align: center;
  }
  .form-object{
    margin-left: auto;
    margin-right: auto;
    display: block;
  }
</style>
