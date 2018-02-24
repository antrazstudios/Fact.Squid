<template>
  <div class="content">
    <input type="file" style="display:none" ref="fileInput" accept="application/vnd.ms-excel, .xlsx" @change="onFilePicked"/>
    <Row v-if="visibleChargeInit === false">
      <Form ref="FormGlosas" :label-width="180">
        <FormItem label="Gestor de Glosa" :error="gestorError">
          <Input disabled :value="gestor"/>
        </FormItem>
        <FormItem label="Entidad Planilla" :error="entidadesConmError">
          <Input disabled :value="glosas.nit"/>
        </FormItem>
        <FormItem label="Entidades Conmutadas" :error="entidadesConmError">
          <Input disabled :value="entidadesConm"/>
        </FormItem>
        <FormItem label="Fecha de Documento: " :error="fechaDocumentoError">
          <DatePicker type="date" :value="glosas.fechaDocumento"></DatePicker>
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
      <i-button type="info" :disabled="!enabledConfirm" style="margin-right: 10px" >VERIFICAR</i-button>
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
        gestor: '',
        gestorError: '',
        entidadesConm: '',
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
      onPickFile () {
        this.$refs.fileInput.click()
      },
      onFilePicked (event) {
        this.files = event.target.files
        if (this.files.length !== 0) {
          this.$parent.handleSpinShow('Leyendo GLOSA')
          this.enabledConfirm = true
          this.visibleChargeInit = false
          // instanciamos el lector de archivos xls y xlsx
          var Excel = require('exceljs')
          var workbook = new Excel.Workbook()
          workbook.xlsx.readFile(this.files[0].path).then(() => {
            let miscelanius = require('../../libs/miscelanius')
            miscelanius.decodeXLSXGlosas(workbook).then((resolve) => {
              this.glosas = resolve
              this.glosas.facturas.forEach(factura => {
                this.totalvalorglosas = this.totalvalorglosas + factura.valor
                this.totalaceptado = this.totalaceptado + factura.valoraceptado
                this.totalnoaceptado = this.totalnoaceptado + factura.valornoaceptado
              })
              this.createdColumns()
              this.$parent.handleSpinHide()
              this.$Message.info('Glosa importada')
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
                this.glosas.facturas.forEach(glosa => {
                  storage.verifyFacturaTercero({
                    numero: glosa.factura,
                    connection: connection
                  }).then((rta) => {
                    countFacturas++
                    console.log(rta)
                    if (countFacturas === this.glosas.facturas.lenght) {
                      connection.end()
                    }
                  })
                })
              }).catch((err) => {
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
          width: 180
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
          width: 200,
          align: 'center'
        })
        this.columnsGlosas.push({
          title: 'ESTADO',
          render: (h, params) => {
            return h('Tag', {
              props: {
                color: params.row.stateDB === 'SINVERIFICAR' ? 'blue' : params.row.stateDB === false ? 'green' : 'red'
              }
            }, params.row.stateDB === 'SINVERIFICAR' ? 'SIN VERIFICAR' : params.row.stateDB === false ? 'LISTA PARA GRABAR GLOSA' : 'NO EXISTE FACTURA')
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
      }// ,
      // verificarCarga () {
      // }
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