<template>
  <div class="content">
    <input type="file" style="display:none" ref="fileInput" accept="application/vnd.ms-excel, .xlsx" @change="onFilePicked"/>
    <Row v-if="visibleChargeInit === false">
      <Form ref="FormGlosas" :label-width="180">
        <FormItem label="Gestor de Glosa" :error="gestorError">
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
    </Row>
    <Row v-if="visibleChargeInit === false" style="width: 100%">
      <i-table border :style="'width: 100%; height:' + $parent.maxHeightTable - 280 + 'px'" :columns="columnsGlosas" :data="glosas.facturas" size="small" :stripe="false" :height="$parent.maxHeightTable - 280"></i-table>
    </Row>
    <Row v-if="visibleChargeInit === true" type="flex" justify="space-around">
      <i-col span="4">
        <i-button type="dashed" @click="onPickFile">
          <div style="padding: 20px 0">
              <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
              <p>Seleccione la plantilla para importar los datos de la Glosa</p>
          </div>
        </i-button>
      </i-col>
      <i-col span="4">
        <i-button type="dashed" @click="downloadFile">
          <div style="padding: 20px 0">
              <Icon type="ios-cloud-download" size="52" style="color: #3399ff"></Icon>
              <p>Descargar plantilla de datos para glosa</p>
          </div>
        </i-button>
      </i-col>
    </Row>
    <Row v-if="visibleChargeInit === false" type="flex" justify="end">
      <Form inline :label-width="130" style="margin-top: 15px;">
        <FormItem label="Cant. Glosas">
          <Input :value="glosas.facturas.length" disabled/>
        </FormItem>
        <FormItem label="Valor Glosas">
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
    <Row v-if="visibleChargeInit === false" style="margin-top: 10px;" type="flex" justify="end">
      <i-button type="error" style="margin-right: 10px" @click="$router.go(-1)">CANCELAR</i-button>
      <i-button type="info" :disabled="!enabledConfirm" @click="verificarCarga()" style="margin-right: 10px" >VERIFICAR</i-button>
      <i-button type="info" :disabled="enabledConfirm" >CONFIRMAR</i-button>
    </Row>
  </div>
</template>
<script>
  import path from 'path'
  export default {
    name: 'glosas-recepcion',
    data () {
      return {
        dialog: require('electron').remote.dialog,
        numGestor: '',
        nitError: '',
        gestor: '',
        gestorError: '',
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
          this.$parent.handleSpinShow('Leyendo GLOSA')
          this.enabledConfirm = true
          this.visibleChargeInit = false
          this.entidadesConm = []
          // instanciamos el lector de archivos xls y xlsx
          var Excel = require('exceljs')
          var workbook = new Excel.Workbook()
          workbook.xlsx.readFile(this.files[0].path).then(() => {
            let miscelanius = require('../../libs/miscelanius')
            miscelanius.decodeXLSXGlosas(workbook).then((resolve) => {
              console.log(resolve)
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
          this.$Message.error('No ha seleccionado una plantilla de GLOSA')
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
            return params.row.fecha.toLocaleDateString()
          },
          width: 130
        })
        // Creamos columna valor de la glosa
        this.columnsGlosas.push({
          title: 'Valor Glosa',
          render: (h, params) => {
            return '$' + params.row.valor.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
          },
          width: 200,
          align: 'right'
        })
        // Creamos columna valor aceptado de la glosa
        this.columnsGlosas.push({
          title: 'Valor Aceptado',
          render: (h, params) => {
            return '$' + params.row.valoraceptado.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
          },
          width: 200,
          align: 'right'
        })
        // Creamos columna valor no aceptado de la glosa
        this.columnsGlosas.push({
          title: 'Valor No Aceptado',
          render: (h, params) => {
            return '$' + params.row.valornoaceptado.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
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
            // return h('Tooltip', {
            //   props: {
            //     content: params.row.stateInfo
            //   }
            // }, h('Tag', {
            //   props: {
            //     color: params.row.stateColor
            //   }
            // }, params.row.stateDB)
            // )
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
            fs.createReadStream(path.join(__static, '/FORMAT_GLOSA.xlsx')).pipe(fs.createWriteStream(filename + '.xlsx'))
            this.$Message.info('Documento almacenado en: ' + filename + '.xlsx')
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
                  if (rta === false) {
                    glosa.stateDB = '!FACTURA'
                    countFactNeg++
                  } else {
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
        this.$parent.handleSpinShow('Escribiendo datos en el servidor')
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
