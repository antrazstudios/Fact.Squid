<template>
  <div class="content">
    <!-- Input de almacenamiento de archivos -->
    <input type="file" style="display:none" ref="fileInput" accept="text/plain, .txt" @change="onFilePicked" multiple/>
    <!-- Contenido de la vista -->
    <Row type="flex">
      <!-- Vista lateral izq. datos de la facturas -->
      <i-col span="17">
        <!-- Visualizacion de datos -->
        <Row v-if="visibleChargeInit === false">
          <Form ref="FormRips" :label-width="130">
            <FormItem label="Ruta de Rips" :error="rutaRipsError">
              <Row type="flex" justify="end">
                <i-col span="22">
                  <Input style="width: 100%" disabled :value="rutaRips"/>
                </i-col>
                <i-col span="2">
                  <Button icon="folder" @click="onPickFile"></Button>
                </i-col> 
              </Row>
            </FormItem>
          </Form>
          <Form :label-width="130">
            <FormItem label="Numero envio" :error="numEnvioError">
              <Row type="flex">
                <i-col span="4">
                  <InputNumber v-model="numEnvio"/>
                </i-col>
                <i-col span="2">
                  <label>Entidad</label>
                </i-col>
                <i-col span="17">
                  <i-select v-model="numEntidad" filterable style="width: 100%; margin-right: 10px">
                    <i-option v-for ="item in tercerosBD" :value="item.tercero.id" :key="item.tercero.id">{{item.tercero.identificacion + ' - ' + item.nombre}}</i-option>
                  </i-select>
                </i-col>
                <i-co span="1"></i-co>
              </Row>
            </FormItem>
            <!-- <FormItem label="Entidad" :error="numEntidadError">
            </FormItem> -->
          </Form>
          <Form inline :label-width="130">
            <FormItem label="Fecha de Recepcion: ">
              <DatePicker type="date" :value="fechaRecep" :options="datepickershortcuts" placeholder="Seleccione la fecha de recepcion"></DatePicker>
            </FormItem>
            <FormItem label="Cant. Facturas" :error="cantFacturasError">
              <Input style="width: 60px" :value="facturacionDb.length" disabled/>
            </FormItem>
            <FormItem label="Valor Facturas" :error="valorFacturasError">
              <Input style="width: 180px" :value="'$ ' + valorFacturas.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')" disabled/>
            </FormItem>
          </Form>
        </Row>
        <!-- Tabla de visualizacion -->
        <Row v-if="visibleChargeInit === false" style="width: 100%">
          <i-col span="23">
            <i-table border :style="'width: 100%; height:' + $parent.maxHeightTable - 140 + 'px;'" :columns="columnsFacturas" :data="facturacionDb" size="small" :stripe="false" :height="$parent.maxHeightTable - 140"></i-table>
          </i-col>
          <i-col span="1"></i-col>
        </Row>
      </i-col>
      <!-- Vista lateral der. datos de los resultados de la validacion -->
      <i-col span="7" v-if="ripsContainer.length !== 0">
        <Card style="width: 100%; height: 100%;" dis-hover>
          <!-- Titulo y accion de impresion -->
          <Row style="margin-bottom: 0px;">
            <i-col span="21">
              <h3>RESULTADO REVISION</h3>
            </i-col>
            <i-col span="3">
              <i-button>
                <Icon type="ios-printer"></Icon>
              </i-button>
            </i-col>
          </Row>
          <!-- Filtro de resultados de validacion -->
          <Row style="margin-bottom: 5px;">
            <i-col span="24">
              <h4>Filtro resultados:</h4>
              <CheckboxGroup v-model="filtersResult">
                <Checkbox label="INFORMACION">
                  <span>Info.</span>
                </Checkbox>
                <Checkbox label="EXITOSO">
                  <span>Exitoso</span>
                </Checkbox>
                <Checkbox label="ADVERTENCIA">
                  <span>Advert.</span>
                </Checkbox>
                <Checkbox label="ERROR">
                  <span>Error</span>
                </Checkbox>
              </CheckboxGroup>
            </i-col>
          </Row>
          <!-- Visor de resultaods -->
          <Collapse accordion v-model="autoSelectFile">
            <Panel v-for="container in ripsContainer" :key="container.id" :name="container.pref" v-if="container.pref !== 'FACTURAS'">
              {{container.pref}} ::
              <Tooltip :content="container.fileName !== '' ? 'El archivo fue seleccionado y leido' : 'No selecciono este archivo'">
                <Tag :color="container.fileName !== '' ? 'green' : 'red'">
                  <Icon :type="container.fileName !== '' ? 'checkmark-circled' : 'close-circled'"></Icon>
                  {{container.fileName !== '' ? '' : 'NO EXISTE EN CARPETA RIPS'}}
                </Tag>
              </Tooltip>
              <!-- {{container.fileName !== '' ? ':' : ''}} -->
              <Tooltip v-if="container.fileName !== ''" :content="container.lines + ' lineas'" placement="right">
                <Tag color="blue">
                  <Icon type="ios-paper"></Icon>
                  {{container.lines}}
                </Tag>
              </Tooltip>
              <!-- {{container.fileName !== '' ? ':' : ''}} -->
              <Tooltip v-if="container.fileName !== ''" :content="container.errors + ' errores'" placement="right">
                <Tag :color="container.errors === 0 ? 'blue' : 'red'">
                  <Icon type="bug"></Icon>
                  {{container.errors}}
                </Tag>
              </Tooltip>
              <!-- {{container.fileName !== '' ? ':' : ''}} -->
              <Tooltip v-if="container.fileName !== ''" :content="container.stateDB.stateInfo" placement="left">
                <Tag :color="container.stateDB.stateColor">
                  {{container.stateDB.stateDB}}
                </Tag>
              </Tooltip>
              <div slot="content" style="height: 90px; overflow: auto">
                <Collapse accordion>
                  <Panel v-for="item in container.result" :key="item.id" v-if="filtersResult.indexOf(item.stateTitle) > -1">
                    {{item.stateDB}}
                    <Icon :color="item.stateColor" :type="item.stateTitle === 'EXITOSO' ? 'checkmark-circled' : item.stateTitle === 'INFORMACION' ? 'information-circled' : item.stateTitle === 'ADVERTENCIA' ? 'alert-circled' : 'close-circled'"></Icon>
                    <div slot="content">
                      {{item.stateInfo}}
                    </div>
                  </Panel>
                </Collapse>
              </div>
            </Panel>
          </Collapse>
        </Card>
      </i-col>
    </Row>
    <!-- Botones de accion final -->
    <Row v-if="visibleChargeInit === false" style="margin-top: 10px;" type="flex" justify="end">
      <i-button type="error" style="margin-right: 10px" @click="$router.go(-1)">CANCELAR</i-button>
      <i-button type="info" :disabled="!enabledConfirm" style="margin-right: 10px" @click="verificarCarga">VERIFICAR</i-button>
      <i-button type="info" :disabled="enabledConfirm" @click="confirmarCarga">CONFIRMAR</i-button>
    </Row>
    <!-- Boton de carga inicial de los RIPS -->
    <Row v-if="visibleChargeInit === true" type="flex" justify="center">
      <i-button type="dashed" @click="onPickFile">
        <div style="padding: 20px 0">
          <Icon type="ios-cloud-upload" size="52"></Icon>
          <p>Seleccione los archivos de RIPS para iniciar la carga</p>
        </div>
      </i-button>
    </Row>
  </div>
</template>
<script>
  export default {
    name: 'facturacion-recepcion',
    data () {
      return {
        filtersResult: ['ERROR', 'ADVERTENCIA'],
        render: false,
        autoSelectFile: '',
        rutaRips: '',
        rutaRipsError: '',
        ripsContainer: [],
        ripsContainerError: '',
        numEntidad: '',
        numEntidadError: '',
        numEnvio: 0,
        numEnvioError: '',
        valorFacturas: '0',
        valorFacturasError: '',
        cantFacturasError: '',
        fechaRecep: new Date(Date.now()),
        columnsFacturas: [],
        facturacionDb: [],
        files: [],
        enabledConfirm: true,
        visibleChargeInit: true,
        tercerosBD: [],
        datepickershortcuts: {
          shortcuts: [
            {
              text: 'Today',
              value () {
                return new Date()
              }
            }
          ]
        }
      }
    },
    methods: {
      onPickFile () {
        this.$refs.fileInput.click()
      },
      onFilePicked (event) {
        this.files = event.target.files
        if (this.files.length !== 0) {
          this.$parent.handleSpinShow('Cargando RIPS')
          this.createColumns()
          this.enabledConfirm = true
          this.render = false
          this.numEnvio = 0
          this.visibleChargeInit = false
          const rips = require('../../libs/rips')
          this.rutaRips = this.files[0].path.replace(this.files[0].name, '')
          this.facturacionDb = []
          this.valorFacturas = 0
          // Leemos o descodificamos los archivos
          rips.readFileRips(this.files, (data) => {
            this.ripsContainer = data
            // Validamos cada archivo
            let countcontainer = 0
            this.$parent.handleSpinShow('Validando Archivos')
            // Recorremos los envios
            this.ripsContainer.forEach(element => {
              if (element.state === true) {
                rips.decodeFileRips(element, this.ripsContainer).then((data) => {
                  element = data
                }).catch((err) => {
                  element.result.push(err)
                })
              }
              countcontainer = countcontainer + 1
              if (element.errors !== 0) {
                this.autoSelectFile = element.pref
              }
              if (countcontainer === this.ripsContainer.length) {
                this.facturacionDb = rips.generateObjects(this.ripsContainer)
                this.valorFacturas = 0
                this.facturacionDb.forEach(factura => {
                  this.valorFacturas = this.valorFacturas + factura.valorfactura
                })
                this.$parent.handleSpinHide()
              }
            })
            // Obtenemos un numero de envio, segun la ruta
            this.numEnvio = parseInt(this.rutaRips.replace(/\D/g, ''))
          }).catch((err) => {
            this.$Message.error(err)
            this.$parent.handleSpinHide()
          })
          const storage = require('../../libs/storage.js')
          this.$parent.handleSpinShow('Cargando terceros juridicos')
          storage._database_consultTerceros({ type: 'juridica' }).then((data1) => {
            this.$parent.handleSpinHide()
            this.tercerosBD = data1
          }).catch((err) => {
            this.$parent.handleSpinHide()
            this.$Message.error({
              content: err,
              duration: 8
            })
          })
        } else if (this.files.length === 0) {
          this.$Message.error('No ha seleccionado los RIPS')
          this.$parent.handleSpinHide()
        }
      },
      createColumns () {
        // limpiamos las columnas
        this.columnsFacturas = []
        // numero de la factura en RIPS
        // this.columnsFacturas.push({
        //   title: 'Numero Factura RIPS',
        //   key: 'ripsnumero',
        //   width: 200
        // })
        // numero de la factura
        this.columnsFacturas.push({
          title: 'Numero Factura Real',
          key: 'numero',
          width: 200
        })
        // fecha de la factura
        this.columnsFacturas.push({
          title: 'Fecha de la factura',
          render: (h, {row}) => {
            // return row.fecha.toLocaleDateString()
            return h('label', {}, row.fecha.toLocaleDateString())
          },
          width: 180
        })
        // regimen temporal
        this.columnsFacturas.push({
          title: 'Regimen',
          key: 'regimenRender',
          width: 180
        })
        // Valor de la factura
        this.columnsFacturas.push({
          title: 'Valor de la factura RIPS',
          render: (h, {row}) => {
            return h('label', {}, '$ ' + row.valorfactura.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,'))
          },
          align: 'right',
          width: 200
        })
        // Estado de la factura
        this.columnsFacturas.push({
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
      verificarCarga () {
        // Se realiza confirmacion de la seleccion de una entidad
        if (this.numEntidad === '' || this.numEntidad === 0 || this.numEntidad === null) {
          this.numEntidadError = 'Es Neceserario seleccionar un tercero valido para asociar esta carga'
        } else {
          this.numEntidadError = ''
          // Se realiza confirmacion del ingreso del numero de envio
          if (this.numEnvio === '' || this.numEnvio === 0 || this.numEnvio === null) {
            this.numEnvioError = 'El numero de envio no puede ser nulo o estar vacio'
          } else {
            this.numEnvioError = ''
            // Se realiza confirmacion de la ruta de los rips
            if (this.rutaRips === '' || this.rutaRips === '' || this.rutaRips === null) {
              this.rutaRipsError = 'Debe seleccionar una ruta de ubicacion para los RIPS'
              this.cantFacturasError = 'PATH==Null;;Invalid INT'
              this.valorFacturasError = 'Cualquier valor es invalido sin una ruta de RIPS'
            } else {
              this.rutaRipsError = ''
              this.cantFacturasError = ''
              this.valorFacturasError = ''
              // Se realiza confirmacion del contenido de las facturas
              if (this.facturacionDb.length === 0) {
                this.rutaRipsError = 'No se han cargado facturas suficientes para realizar un cargue'
              } else {
                this.rutaRipsError = ''
                this.$parent.handleSpinShow('Verificando la existencia de los datos en la BD')
                // Contador de registros terminados en BD
                let countFactsRegBd = 0
                let countFactsNegativa = 0
                let storage = require('../../libs/storage')
                let conn = storage.getActualConnection()
                conn.connect((err) => {
                  if (err) {
                    console.log(err)
                    this.$Message.error(err)
                  }
                })
                // verificar si existe el envio en la BD
                storage.verifyDocumento({
                  consecutivo: this.numEnvio,
                  connection: conn
                }).then((result) => {
                  if (result.state === true) {
                    this.numEnvioError = 'Este envio ya existe en la base de datos'
                    this.$parent.handleSpinHide()
                    conn.end()
                  } else {
                    // verificar si existen las facturas
                    this.facturacionDb.forEach(factura => {
                      storage.verifyFactura({
                        numero: factura.numero,
                        connection: conn
                      }).then((result) => {
                        countFactsRegBd++
                        factura.idtercero = this.numEntidad
                        factura.stateDB = result.state
                        if (result.state === true) {
                          countFactsNegativa++
                        }
                        if (countFactsRegBd === this.facturacionDb.length) {
                          this.$parent.handleSpinHide()
                          conn.end()
                          if (countFactsNegativa !== 0) {
                            this.enabledConfirm = true
                          } else {
                            this.enabledConfirm = false
                          }
                        }
                      }).catch((err) => {
                        this.$parent.handleSpinHide()
                        conn.end()
                        console.log(err)
                        this.$Message.err(err)
                      })
                    })
                  }
                }).catch((err) => {
                  this.$parent.handleSpinHide()
                  conn.end()
                  console.log(err)
                  this.$Message.err(err)
                })
              }
            }
          }
        }
      },
      confirmarCarga () {
        // Se realiza confirmacion del ingreso del numero de envio
        if (this.numEnvio === '' || this.numEnvio === 0 || this.numEnvio === null) {
          this.numEnvioError = 'El numero de envio no puede ser nulo o estar vacio'
        } else {
          this.numEnvioError = ''
          // Se realiza confirmacion de la ruta de los rips
          if (this.rutaRips === '' || this.rutaRips === '' || this.rutaRips === null) {
            this.rutaRipsError = 'Debe seleccionar una ruta de ubicacion para los RIPS'
            this.cantFacturasError = 'PATH==Null;;Invalid INT'
            this.valorFacturasError = 'Cualquier valor es invalido sin una ruta de RIPS'
          } else {
            this.rutaRipsError = ''
            this.cantFacturasError = ''
            this.valorFacturasError = ''
            // Se realiza confirmacion del contenido de las facturas
            if (this.facturacionDb.length === 0) {
              this.rutaRipsError = 'No se han cargado facturas suficientes para realizar un cargue'
            } else {
              this.rutaRipsError = ''
              this.$parent.handleSpinShow('Escribiendo datos en el servidor', 'progress', 0)
              // instanciamos las librerias necesarias
              let miscelanius = require('../../libs/miscelanius')
              let storage = require('../../libs/storage')
              let settings = require('../../libs/settings')
              // creamos un archivo .zip de todo lo que contiene la carpeta de RIPS
              // creamos la coleccion a enviarse a zipear
              let zipContent = []
              // contenidos soportados, por ahora soporta text/plain para archivos txt y application/pdf para los certificados de cargue
              let accept = [
                'text/plain', 'application/pdf'
              ]
              // Contador de archivos Aceptados
              let countfilesAccept = 0
              // Contador de archivos leidos
              let countfilesReaders = 0
              // Contador de registros terminados en BD
              let countFactsRegBd = 0
              // Progreso de la funcion
              let countPercent = 0
              // recorremos los archivos en la carpeta
              for (let i = 0; i < this.files.length; i++) {
                // sumamos al contador
                const archivoRIPS = this.files[i]
                // Seleccionamos los archivos que pueden ser aceptados
                if (accept.indexOf(archivoRIPS.type) > -1) {
                  // añadimos 1 al contador de archivos aceptados
                  countfilesAccept++
                  // leemos el archivo
                  let fileReader = new FileReader()
                  // evento que se ejecuta cuando la lectura es efectiva
                  fileReader.addEventListener('load', () => {
                    // añadimos 1 al contador de archivos leidos
                    countfilesReaders++
                    // añadimos el nombre y el contenido al zipContent para comprimir
                    zipContent.push({
                      name: archivoRIPS.name,
                      content: fileReader.result
                    })
                    // Si la cantidad de archivos aceptados y leidos son iguales se comprimiran
                    if (countfilesAccept === countfilesReaders) {
                      // creamos un archivo comprimido
                      const pathDownload = require('../../libs/settings').getDocumentsPath() + 'temp'
                      miscelanius.createZipFile(zipContent, pathDownload, 'temp_compressRIPSZip.zip').then((content) => {
                        // en caso de que se haya comprimido efectivamente
                        // creamos una conexion al servidor de base de datos
                        let conn = storage.getActualConnection()
                        conn.connect()
                        // variable de almacenamiento del id del documento
                        let iddocumento
                        // se crea un documento
                        storage._database_createDocumento({
                          idtipo: 1,
                          consecutivo: this.numEnvio,
                          anexo: content.blobFile,
                          anexoformat: '.zip',
                          observacion: 'Recepcion de envio revisada y autorizada por: ' + settings.getSesionProfile().getFullName() + '-' + settings.getSesionProfile().identificacion,
                          connection: conn
                        }).then((result) => {
                          iddocumento = result.result[0][0]['key']
                          countPercent = countPercent + 10
                          this.$parent.handleSpinShow('Escribiendo datos en el servidor', 'progress', countPercent)
                          // luego se realiza la carga factura por factura
                          let step = ((100 - countPercent) / this.facturacionDb.length) / 3
                          this.facturacionDb.forEach(factura => {
                            storage._database_createFactura({
                              idtercero: factura.idtercero,
                              numero: factura.numero,
                              fecha: miscelanius.convertDateToStringSQL(factura.fecha),
                              regimen: factura.regimen,
                              valorfactura: factura.valorfactura,
                              connection: conn
                            }).then((result) => {
                              factura.id = result.result[0][0]['key']
                              countPercent = countPercent + step
                              this.$parent.handleSpinProgressUpdate(countPercent)
                              // por cada factura creada se le anexa la relacion con el documento de recepcion principal
                              storage._database_createRelationDocumentoFactura({
                                idfactura: factura.id,
                                iddocumento: iddocumento,
                                connection: conn
                              }).then((rta) => {
                                // por ultimo se cargaran las relaciones de acciones a la factura
                                countPercent = countPercent + step
                                this.$parent.handleSpinProgressUpdate(countPercent)
                                storage.createRelationFactura({
                                  idfactura: factura.id,
                                  idaccion: 1,
                                  idusuario: settings.getSesionProfile().id,
                                  connection: conn
                                }).then((rta) => {
                                  countFactsRegBd++
                                  countPercent = countPercent + step
                                  this.$parent.handleSpinProgressUpdate(countPercent)
                                  if (countFactsRegBd === this.facturacionDb.length) {
                                    this.$parent.handleSpinProgressUpdate(100, 'Carga termi')
                                    this.$Message.info('Se han creado ' + countFactsRegBd + ' factura(s) en la BD.')
                                    conn.end()
                                    this.$router.go(-1)
                                  }
                                }).catch((err) => {
                                  console.log('ERROR LOG', err)
                                  conn.end()
                                })
                              }).catch((err) => {
                                console.log('ERROR RELATION', err)
                                conn.end()
                              })
                            }).catch((err) => {
                              console.log(err)
                              this.$Message.error(err)
                              conn.end()
                            })
                          })
                        }).catch((err) => {
                          console.log(err)
                          this.$Message.error(err)
                          conn.end()
                        })
                      }).catch((err) => {
                        // mensaje de error en caso que no se haya podido comprimir
                        this.$Message.error(err)
                      })
                    }
                  })
                  // enviamos la lectura del archivo como un array de buffer
                  fileReader.readAsArrayBuffer(archivoRIPS)
                }
              }
            }
          }
        }
      },
      clearCarga () {
        this.enabledConfirm = false
        this.facturacionDb = []
        this.files = []
        this.cantFacturasError = ''
        this.valorFacturasError = ''
        this.valorFacturas = '0'
        this.numEnvioError = ''
        this.numEnvio = ''
        this.rutaRipsError = ''
        this.rutaRips = ''
        this.visibleChargeInit = true
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
