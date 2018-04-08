<template>
  <div class="content">
    <!-- fileInput para leer el archivo de glosas -->
    <input type="file" style="display:none" ref="fileInput" accept="application/vnd.ms-excel, .xlsx" @change="onFilePicked"/>
    <!-- Primer Row, formulario de informacion de la plantilla -->
    <Row v-if="visibleChargeInit === false" :gutter="16">
      <i-col span="23">
        <!-- Formulario de informacion -->
        <Form ref="FormGlosas" :label-width="180">
          <FormItem :label="textDisplay1" :error="gestorError">
            <Input disabled :value="gestor"/>
          </FormItem>
          <FormItem label="Entidad Planilla" :error="nitError">
            <Input disabled :value="glosas.nit"/>
          </FormItem>
          <FormItem label="Entidades Conmutadas" :error="entidadesConmError">
            <Tag v-for="entidade in entidadesConm" :key="entidade.key">{{entidade}}</Tag>
          </FormItem>
          <FormItem label="Fecha de Documento: " :error="fechaDocumentoError">
            <DatePicker type="date" :value="glosas.fechaDocumento" @on-change="handleChange"></DatePicker>
          </FormItem>
        </Form>
      </i-col>
      <i-col span="1">
        <!-- Boton para previsualizar el documento generado -->
        <i-button v-if="pathTempDocument !== ''" type="info" @click="previewDocument">
          <Icon type="document"/>
        </i-button>
      </i-col>
    </Row>
    <!-- Segundo Row, muestra la tabla de las glosas -->
    <Row v-if="visibleChargeInit === false" style="width: 100%">
      <i-table border :style="'width: 100%; height:' + $parent.maxHeightTable - 280 + 'px'" :columns="columnsGlosas" :data="glosas.facturas" size="small" :stripe="false" :height="$parent.maxHeightTable - 280"></i-table>
    </Row>
    <!-- Tercer Row, botones inicialesde carga -->
    <Row v-if="visibleChargeInit === true" type="flex" justify="space-around">
      <i-col span="4">
        <!-- Cargar plantilla de informacion de Glosa o Devolucion -->
        <i-button type="dashed" @click="onPickFile">
          <div style="padding: 20px 0">
              <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
              <p>{{ textDisplay2 }}</p>
          </div>
        </i-button>
      </i-col>
      <i-col span="4">
        <!-- Descargar plantilla para cargar Glosa o Devolucion -->
        <i-button type="dashed" @click="downloadFile">
          <div style="padding: 20px 0">
              <Icon type="ios-cloud-download" size="52" style="color: #3399ff"></Icon>
              <p>{{ textDisplay3 }}</p>
          </div>
        </i-button>
      </i-col>
    </Row>
    <!-- Cuarto Row, informacion de totales del formulario -->
    <Row v-if="visibleChargeInit === false" type="flex" justify="end">
      <Form inline :label-width="130" style="margin-top: 15px;">
        <FormItem :label="textDisplay4">
          <Input :value="glosas.facturas.length" disabled/>
        </FormItem>
        <FormItem :label="textDisplay5">
          <Input :value="'$ ' + totalvalorglosas.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')" disabled/>
        </FormItem>
        <FormItem label="Valor Aceptado">
          <Input :value="'$ ' + totalaceptado.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')" disabled/>
        </FormItem>
        <FormItem label="Valor No Aceptado">
          <Input :value="'$ ' + totalnoaceptado.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')" disabled/>
        </FormItem>
      </Form>
    </Row>
    <!-- Quinto Row, botones de accion -->
    <Row v-if="visibleChargeInit === false" style="margin-top: 10px;" type="flex" justify="end">
      <i-button type="error" style="margin-right: 10px" @click="$router.go(-1)">CANCELAR</i-button>
      <i-button type="info" :disabled="!enabledConfirm" @click="verificarCarga()" style="margin-right: 10px" >VERIFICAR</i-button>
      <i-button type="info" :disabled="enabledConfirm" @click="confirmarCarga()">CONFIRMAR</i-button>
    </Row>
  </div>
</template>
<script>
  import path from 'path'
  export default {
    name: 'glosas-recepcion',
    data () {
      return {
        typeRender: '', // Puede ser 0 -> GLOSAS EN GENERAL; 1 -> DEVOLUCIONES EN GENERAL
        textDisplay1: '', // Puede ser 'Gestor de Glosa', 'Gestor de Devolucion'
        textDisplay2: '', // Muestra el mensaje de carga de Glosa o Devolucion
        textDisplay3: '', // Muestra el mensaje de descarga de Glosa o Devolucion
        textDisplay4: '', // Muestra Cant. de Glosa o Devolucion
        textDisplay5: '', // Muestra Valor de Glosa o Devolucion
        dialog: require('electron').remote.dialog,
        numGestor: '',
        nitError: '',
        gestor: '',
        gestorError: '',
        pathTempDocument: '',
        firmaGestor: null,
        entidadesConm: [],
        entidadesConmError: '',
        fechaDocumentoError: '',
        pathtodownload: '',
        visibleChargeInit: true,
        enabledConfirm: false,
        totalvalorglosas: 0,
        totalaceptado: 0,
        totalnoaceptado: 0,
        glosas: {
          documentoGestor: '',
          fechaDocumento: '',
          tipoDocumento: '',
          nit: '',
          facturas: []
        },
        columnsGlosas: []
      }
    },
    mounted () {
      this.typeRender = this.$route.query.type
      if (this.typeRender === 0) {
        this.textDisplay1 = 'Gestor de Glosas'
        this.textDisplay2 = 'Cargar plantilla de informacion de las Glosas'
        this.textDisplay3 = 'Descargar plantilla de informacion de Glosas'
        this.textDisplay4 = 'Cant. de Glosas'
        this.textDisplay5 = 'Valor de Glosas'
      } else if (this.typeRender === 1) {
        this.textDisplay1 = 'Gestor de Devoluciones'
        this.textDisplay2 = 'Cargar plantilla de informacion de las Devoluciones'
        this.textDisplay3 = 'Descargar plantilla de informacion de Devoluciones'
        this.textDisplay4 = 'Cant. de Devoluciones'
        this.textDisplay5 = 'Valor de Devoluciones'
      }
    },
    methods: {
      handleChange (date) {
        this.glosas.fechaDocumento = new Date(date)
      },
      onPickFile () {
        this.$refs.fileInput.click()
      },
      onFilePicked (event) {
        this.files = event.target.files
        if (this.files.length !== 0) {
          this.$parent.handleSpinShow(this.typeRender === 0 ? 'Leyendo GLOSA' : 'Leyendo DEVOLUCION')
          this.enabledConfirm = true
          this.visibleChargeInit = false
          this.entidadesConm = []
          // instanciamos el lector de archivos xls y xlsx
          var Excel = require('exceljs')
          var workbook = new Excel.Workbook()
          workbook.xlsx.readFile(this.files[0].path).then(() => {
            let miscelanius = require('../../libs/miscelanius')
            miscelanius.deleteTempfiles()
            miscelanius.decodeXLSXGlosas(workbook).then((resolve) => {
              this.glosas = resolve
              this.glosas.facturas.forEach(factura => {
                this.totalvalorglosas = this.totalvalorglosas + factura.valor
                this.totalaceptado = this.totalaceptado + factura.valoraceptado
                this.totalnoaceptado = this.totalnoaceptado + factura.valornoaceptado
              })
              this.createdColumns()
              this.$parent.handleSpinShow('Verificando datos en el servidor')
              this.$Message.info('Archivo de glosas leido')
              // Proceso de verificacion de datos importados
              const storage = require('../../libs/storage')
              // llamar a la funcion de verificacion del usuario
              storage._database_runQuery({
                query: 'call consultGestorDatos(' + this.glosas.documentoGestor + ');'
              }).then((rta) => {
                // Retornamos los datos del gestor verificados
                this.numGestor = rta.result[0][0].tb_gestores_codigo
                this.gestor = 'GESTOR Nº' + rta.result[0][0].tb_gestores_codigo + ' - ' + rta.result[0][0].tb_users_primernombre + ' ' + rta.result[0][0].tb_users_segundonombre + ' ' + rta.result[0][0].tb_users_primerapellido + ' ' + rta.result[0][0].tb_users_segundoapellido
                this.firmaGestor = rta.result[0][0].tb_gestores_fd
                // creamos una bandera para establecer el limite de la conexion
                let countFacturas = 0
                // creamos una conexion temporal para ejecutar esta consulta por bloques
                let connection = storage.getActualConnection()
                connection.connect((err) => {
                  if (err) {
                    console.log(err)
                    this.$Message.error(err)
                  }
                })
                // Verificamos el tercero al que pertenece cada factura y los conmutamos
                if (this.glosas.facturas.length === 0) {
                  this.$Message.error('No ha cargado facturas en la plantilla')
                  this.$parent.handleSpinHide()
                  this.visibleChargeInit = true
                } else {
                  this.glosas.facturas.forEach(glosa => {
                    storage.verifyFacturaTercero({
                      numero: glosa.factura,
                      connection: connection
                    }).then((rta) => {
                      countFacturas++
                      if (rta.result[0].length === 0) {
                        glosa.changeStateDB('!FACTURA')
                      } else {
                        // definimos la fecha de cada factura
                        glosa.fechafactura = rta.result[0][0].tb_facturacion_fecha
                        // definimos el valor Original de la factura
                        glosa.valorOriginal = rta.result[0][0].tb_facturacion_valorfactura
                        // creamos un objeto temporal
                        let objectEntidad = rta.result[0][0].tb_terceros_numerodocumento + '-' + rta.result[0][0].tb_tercerosjuridicas_razonsocial
                        // En caso que el objeto no exista en la matriz se agrega
                        if (this.entidadesConm.indexOf(objectEntidad) === -1) {
                          this.entidadesConm.push(objectEntidad)
                        }
                        // Verificamos que la fecha del tramite sea mayor que la fecha de la factura
                        if (glosa.fechafactura >= glosa.fecha) {
                          glosa.changeStateDB('GLOSA>FACTURA')
                        } else {
                          // Verificamos que el valor del tramite sea menor que el valor de la factura
                          if (glosa.valorOriginal < glosa.valor) {
                            glosa.changeStateDB('GLOSA>VALOR')
                          } else {
                            // Verificamos que el nit sea igual al suministrado por el gestor
                            if (this.glosas.nit === rta.result[0][0].tb_terceros_numerodocumento) {
                              glosa.changeStateDB('SIN_VERIFICAR')
                            } else {
                              glosa.changeStateDB('!NIT')
                            }
                          }
                        }
                      }
                      // Verificamos si ha terminado de verificar para terminar la conexion
                      if (countFacturas === this.glosas.facturas.length) {
                        connection.end()
                        this.$parent.handleSpinHide()
                        if (this.entidadesConm.length === 0) {
                          this.entidadesConmError = 'Las facturas son inverificables, puede ser que no esten cargadas o creadas en el sistema'
                        } else {
                          this.entidadesConmError = ''
                        }
                      }
                    })
                  })
                }
              }).catch((err) => {
                this.$parent.handleSpinHide()
                this.$Message.error(err)
                console.log(err)
              })
            }).catch((err) => {
              this.$parent.handleSpinHide()
              this.$Message.error('Error al leer la plantilla: ' + err)
            })
          })
        } else if (this.files.length === 0) {
          this.$Message.error(this.typeRender === 0 ? 'No ha seleccionado una plantilla de GLOSA' : 'No ha seleccionado una plantilla de DEVOLUCION')
        }
      },
      createdColumns () {
        // limpiamos las columnas
        this.columnsGlosas = []
        // Creamos columna de numero de factura
        this.columnsGlosas.push({
          title: 'Numero Factura',
          key: 'factura',
          width: 200
        })
        // Creamos columna fecha de tramite
        this.columnsGlosas.push({
          title: 'Fecha Tramite',
          render: (h, params) => {
            return h('label', {}, params.row.fecha.toLocaleDateString())
          },
          width: 140
        })
        // Creamos columna valor de la glosa
        this.columnsGlosas.push({
          title: this.typeRender === 0 ? 'Valor Glosa' : 'Valor Devolucion',
          render: (h, params) => {
            return h('label', {}, '$' + params.row.valor.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'))
          },
          width: 200,
          align: 'right'
        })
        // Creamos columna valor aceptado de la glosa
        this.columnsGlosas.push({
          title: 'Valor Aceptado',
          render: (h, params) => {
            return h('label', {}, '$' + params.row.valoraceptado.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'))
          },
          width: 200,
          align: 'right'
        })
        // Creamos columna valor no aceptado de la glosa
        this.columnsGlosas.push({
          title: 'Valor No Aceptado',
          render: (h, params) => {
            return h('label', {}, '$' + params.row.valornoaceptado.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'))
          },
          width: 200,
          align: 'right'
        })
        // Creamos columna del numero del tramite
        this.columnsGlosas.push({
          title: 'Numero tramite',
          key: 'numerotramiteinterno',
          width: 150,
          align: 'center'
        })
        this.columnsGlosas.push({
          title: 'ESTADO',
          render: (h, params) => {
            return h('Tag', {
              props: {
                color: params.row.stateColor,
                title: params.row.stateInfo
              }
            }, params.row.stateDB)
          }
        })
      },
      downloadFile () {
        this.dialog.showSaveDialog(
          {
            title: 'Seleccione el destino de la plantilla',
            buttonLabel: 'Guardar aqui'
          },
          (filename) => {
            const fs = require('fs')
            fs.createReadStream(path.join(__static, this.typeRender === 0 ? '/FORMAT_GLOSA.xlsx' : '/FORMAT_DEVOLUCION.xlsx')).pipe(fs.createWriteStream(filename + '.xlsx'))
            this.$Message.info('Plantilla almacenado en: ' + filename + '.xlsx')
          }
        )
      },
      verificarCarga () {
        this.$parent.handleSpinShow('Verificando informacion de facturas')
        // Verificacion de la validez de los datos sin estan listos para ser cargados
        // Verificacion de que se halla seleccionado un gestor de glosa
        if (this.numGestor === '' || this.numGestor === null || this.numGestor === undefined) {
          this.gestorError = 'No ha especificado un numero de identificacion del gestor en la Plantilla.'
          this.$Message.error('Tiene algunos errores en la plantilla, verifiquelos, aplique correcciones e intentelo de nuevo.')
          this.$parent.handleSpinHide()
        } else {
          // Verificamos que se haya especificado un nit
          if (this.glosas.nit === '' || this.glosas.nit === null || this.glosas.nit === undefined) {
            this.nitError = 'No ha especificado un nit de entidad en la Plantilla'
            this.$Message.error('Tiene algunos errores en la plantilla, verifiquelos, aplique correcciones e intentelo de nuevo.')
            this.$parent.handleSpinHide()
            // Verificamos que la fecha del documento ni de ninguna de las glosas supere la fecha de recepcion de la factura
          } else {
            // Verificamos la validacion de las facturas
            var BreakException = {
              error: 'OK'
            }
            // Verificamos los resultados de validacion inicial
            try {
              this.glosas.facturas.forEach(glosa => {
                // Verificamos que la fecha del documento no sea inferior a ninguna de la de los tramites
                if (glosa.fecha > this.glosas.fechaDocumento) {
                  this.fechaDocumentoError = 'Fecha inferior a la fecha de: ' + glosa.numerotramiteinterno
                  BreakException.error = 'DATE'
                  BreakException.in = glosa.numerotramiteinterno
                  throw BreakException
                }
                // se revisan los datos de la verificacion inicial
                if (glosa.stateDB !== 'SIN VERIFICAR') {
                  this.$Message.error('Hay tramites que no pasaron la validacion inicial --' + glosa.numerotramiteinterno + '--')
                  BreakException.error = 'VALIDATION'
                  BreakException.in = glosa.numerotramiteinterno
                  throw BreakException
                }
              })
            } catch (e) {
              this.$parent.handleSpinHide()
              if (e !== BreakException) throw e
            }
            // Verificamos resultado
            if (BreakException.error === 'OK') {
              // Creamos una conexion para realizar la verificacion de los datos
              const storage = require('../../libs/storage')
              let conn = storage.getActualConnection()
              let countFact = 0
              let countFactNeg = 0
              // recorremos las facturas nuevamente para
              this.glosas.facturas.forEach(glosa => {
                storage.verifyFactura({
                  numero: glosa.factura,
                  connection: conn
                }).then((rta) => {
                  countFact++
                  if (rta.state === false) {
                    glosa.stateDB = '!FACTURA'
                    countFactNeg++
                  } else {
                    glosa.idfactura = rta.content.idtb_facturacion
                    glosa.changeStateDB('OK')
                  }
                  if (countFact === this.glosas.facturas.length) {
                    if (countFactNeg === 0) {
                      this.enabledConfirm = false
                      this.$parent.handleSpinHide()
                    } else {
                      this.$Message.error('Algunas facturas no existen en la BD')
                      this.$parent.handleSpinHide()
                    }
                  }
                }).catch((err) => {
                  this.$Message.error(err)
                  console.error(err)
                  this.$parent.handleSpinHide()
                })
              })
            }
          }
        }
      },
      confirmarCarga () {
        // this.$parent.handleSpinShow('Escribiendo datos en el servidor')
        // creamos una conexion constante para hacer registros en bloques
        const storage = require('../../libs/storage')
        const miscelanius = require('../../libs/miscelanius')
        const conexiones = storage.getActualConnection()
        let consecutivo, formatoBuffer, logoEncabezadoBuffer
        // Establecemos conexion
        conexiones.connect((err) => {
          if (err) {
            this.$Message.error(err)
          }
        })
        // generamos un nuevo consecutivo y lo obtenemos
        storage._database_generaConsecutivoDocumento({
          iddocumento: 2,
          parameters: [
            {
              param: '#MANAGER',
              content: this.numGestor
            },
            {
              param: '#YEAR',
              content: new Date(Date.now()).getFullYear()
            }
          ]
        }).then((rta) => {
          consecutivo = rta.consecutivo // obtenemos el consecutivo generado
          formatoBuffer = rta.formato // el formato
          logoEncabezadoBuffer = rta.encabezado // y el logo del encabezado
          // Despues de haber obtenido el consecutivo y el formato, creamos el documento de manera local
          miscelanius.createDocumento({
            consecutivo: consecutivo,
            entidadNombre: this.entidadesConm[0].substr(this.entidadesConm[0].indexOf('-') + 1, this.entidadesConm[0].length),
            nombreGestor: this.gestor.substr(this.gestor.indexOf('-') + 2, this.gestor.length),
            numeroGestor: this.gestor.substr(0, this.gestor.indexOf(' -')),
            fechaDocumento: this.glosas.fechaDocumento,
            contenido: this.glosas.facturas,
            formato: formatoBuffer,
            encabezadoImg: logoEncabezadoBuffer,
            firmaImg: this.firmaGestor,
            tipo: this.glosas.tipoDocumento
          }).then((rta) => {
            // almacenamos el path temporal para abrir una vista previa del documento
            this.pathTempDocument = rta
            // Creamos el documento en el sistema
            storage._database_createDocumento({
              idtipo: 2
            })
          }).catch((err) => {
            console.log('ERROR GENERANDO DOCUMENTO', err)
            this.$parent.handleSpinHide()
            this.$Message.error(err)
            conexiones.end()
          })
        }).catch((err) => {
          console.log('ERROR GENERANDO CONSECUTIVO', err)
          this.$parent.handleSpinHide()
          this.$Message.error(err)
          conexiones.end()
        })
        // this.glosas.facturas.forEach(factura => {
        //   // procedemos a generar un nuevo consecutivo
        //
        // })
      },
      previewDocument () {
        const {shell} = require('electron')
        shell.openExternal(this.pathTempDocument)
      }
    }
  }
</script>
<style>
  .content{
    width: 100%;
    /* position: relative; */
    padding: 10px;
    margin-bottom: 30px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
    overflow-x: hidden;
  }
</style>
