<template>
  <div class="content">
    <input type="file" style="display:none" ref="fileInput" accept="text/plain, .txt" @change="onFilePicked" multiple/>
    <Row v-if="visibleChargeInit === false">
      <Form ref="FormRips" :label-width="130">
        <FormItem label="Ruta de Rips" :error="rutaRipsError">
          <Input disabled :value="rutaRips">
            <Button slot="append" icon="folder" @click="onPickFile"></Button>
          </Input>
        </FormItem>
      </Form>
      <Form inline :label-width="130">
        <FormItem label="Numero envio" :error="numEnvioError">
          <InputNumber type="" v-model="numEnvio"/>
        </FormItem>
        <FormItem label="Entidad" :error="numEntidadError">
          <i-select v-model="numEntidad" filterable style="width: 500px">
            <i-option v-for ="item in tercerosBD" :value="item.tercero.id" :key="item.tercero.id">{{item.tercero.identificacion + ' - ' + item.nombre}}</i-option>
          </i-select>
        </FormItem>
      </Form>
      <Form inline :label-width="130">
        <FormItem label="Fecha de Recepcion: ">
          <DatePicker type="date" :value="fechaRecep"></DatePicker>
        </FormItem>
        <FormItem label="Cant. Facturas" :error="cantFacturasError">
          <Input :value="facturacionDb.length" disabled/>
        </FormItem>
        <FormItem label="Valor Facturas" :error="valorFacturasError">
          <Input :value="'$ ' + valorFacturas.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')" disabled/>
        </FormItem>
      </Form>
    </Row>
    <Row v-if="visibleChargeInit === false" style="width: 100%">
      <i-table :style="'width: 100%; height:' + $parent.maxHeightTable - 140 + 'px'" :columns="columnsFacturas" :data="facturacionDb" size="small" :stripe="false" :height="$parent.maxHeightTable - 140"></i-table>
    </Row>
    <Row v-if="visibleChargeInit === false" style="margin-top: 10px;" type="flex" justify="end">
      <i-button type="error" style="margin-right: 10px" @click="$router.go(-1)">CANCELAR</i-button>
      <i-button type="info" :disabled="!enabledConfirm" style="margin-right: 10px" @click="verificarCarga">VERIFICAR</i-button>
      <i-button type="info" :disabled="enabledConfirm" @click="confirmarCarga">CONFIRMAR</i-button>
    </Row>
    <Row v-if="visibleChargeInit === true" type="flex" justify="center">
      <i-button type="dashed" @click="onPickFile">
        <div style="padding: 20px 0">
            <Icon type="ios-cloud-upload" size="52" style="color: #3399ff"></Icon>
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
        rutaRips: '',
        rutaRipsError: '',
        numEntidad: '',
        numEntidadError: '',
        numEnvio: 0,
        numEnvioError: '',
        valorFacturas: '0',
        valorFacturasError: '',
        cantFacturasError: '',
        fechaRecep: Date.now(),
        columnsFacturas: [],
        facturacionDb: [],
        files: [],
        enabledConfirm: true,
        visibleChargeInit: true,
        tercerosBD: []
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
          this.enabledConfirm = true
          this.numEnvio = 0
          this.visibleChargeInit = false
          const miscelanius = require('../../libs/miscelanius')
          const objects = require('../../libs/objects')
          this.rutaRips = this.files[0].path.replace(this.files[0].name, '')
          this.facturacionDb = []
          this.valorFacturas = 0
          for (let i = 0; i < this.files.length; i++) {
            const archivoRIPS = this.files[i]
            if (archivoRIPS.name.substr(0, 2) === 'AF') {
              miscelanius.readFileRips(archivoRIPS, (collection) => {
                collection.forEach(element => {
                  this.facturacionDb.push(objects.createFacturas(0, element.numeroFactura, element.numeroFacturaReal, element.fechaExpedicionFactura, 'SIN ESPECIFICAR', element.valorPagar))
                  this.valorFacturas = this.valorFacturas + element.valorPagar
                })
                this.numEnvio = parseInt(this.rutaRips.replace(/\D/g, ''))
                this.createColumns()
                this.$parent.handleSpinHide()
                this.$Message.info('Facturas cargadas exitosamente')
              })
            }
          }
          for (let i = 0; i < this.files.length; i++) {
            const archivoRIPS = this.files[i]
            if (archivoRIPS.name.substr(0, 2) === 'US') {
              miscelanius.readFileRips(archivoRIPS, (collection) => {
                let count = 0
                let newCollection = []
                collection.forEach(element => {
                  newCollection.push(objects.createFacturas(this.facturacionDb[count].id, this.facturacionDb[count].ripsnumero, this.facturacionDb[count].numero, this.facturacionDb[count].fecha, element.tipoUsuario, this.facturacionDb[count].valorfactura))
                  count++
                })
                this.facturacionDb = newCollection
                this.$Message.info('Regimen de facturas en RIPS evaluados')
              })
            }
          }
          const storage = require('../../libs/storage.js')
          storage._database_consultTerceros({ type: 'juridica' }).then((data1) => {
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
        }
      },
      createColumns () {
        // limpiamos las columnas
        this.columnsFacturas = []
        // numero de la factura en RIPS
        this.columnsFacturas.push({
          title: 'Numero Factura RIPS',
          key: 'ripsnumero',
          width: 200
        })
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
            return row.fecha.toLocaleDateString()
          }
        })
        // regimen temporal
        this.columnsFacturas.push({
          title: 'Regimen',
          key: 'regimenRender'
        })
        // Valor de la factura
        this.columnsFacturas.push({
          title: 'Valor de la factura RIPS',
          render: (h, {row}) => {
            return '$ ' + row.valorfactura.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,')
          },
          align: 'right'
        })
        // Estado de la factura
        this.columnsFacturas.push({
          title: 'ESTADO',
          render: (h, params) => {
            return h('Tag', {
              props: {
                color: params.row.stateDB === 'SINVERIFICAR' ? 'blue' : params.row.stateDB === false ? 'green' : 'red'
              }
            }, params.row.stateDB === 'SINVERIFICAR' ? 'SIN VERIFICAR' : params.row.stateDB === false ? 'LISTA PARA CREAR' : 'YA EXISTE')
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
                  if (result === true) {
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
                        factura.stateDB = result
                        if (result === true) {
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
              this.$parent.handleSpinShow('Escribiendo datos en el servidor')
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
                      miscelanius.createaZipFile(zipContent).then((content) => {
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
                          // luego se realiza la carga factura por factura
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
                              // por cada factura creada se le anexa la relacion con el documento de recepcion principal
                              storage._database_createRelationDocumentoFactura({
                                idfactura: factura.id,
                                iddocumento: iddocumento,
                                connection: conn
                              }).then((rta) => {
                                // por ultimo se cargaran las relaciones de acciones a la factura
                                storage.createRelationFactura({
                                  idfactura: factura.id,
                                  idaccion: 1,
                                  idusuario: settings.getSesionProfile().id,
                                  connection: conn
                                }).then((rta) => {
                                  countFactsRegBd++
                                  if (countFactsRegBd === this.facturacionDb.length) {
                                    this.$parent.handleSpinHide()
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