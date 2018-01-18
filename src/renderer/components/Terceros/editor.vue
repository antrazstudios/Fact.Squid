<template>
  <div class="content">
    <!-- Editor de Direcciones -->
    <Row v-bind:style="{ opacity : editorDirecciones === true ? 1 : 0.1 }" >
      <transition enter-active-class="animated slideInDown" :duration="{ enter: 1000 }">
        <div class="extern-contenedor--components" v-if="editorDirecciones === true">
          <i-button shape="circle" size="small" icon="close-round" @click="() => { this.editorDirecciones = !this.editorDirecciones }"></i-button>
          <editor-direcciones ref="editorDireccion" style="margin-top: -13px; margin-left: 20px" :direccionEdit="selectDireccionesEdit" :idTercero="terceroEdit.tercero.id"></editor-direcciones>
        </div>
      </transition>
    </Row>
    <transition enter-active-class="animated fadeInDown" :duration="{ enter: 1000 }">
      <Row v-if="!editorDirecciones">
        <!-- Formulario de datos basicos -->
        <Row type="flex" align="middle" >
          <!-- Informacion basica del tercero -->
          <i-col span="12">
            <Form ref="FormTercero" :label-width="130">
              <!-- Tipo de tercero -->
              <FormItem prop="tipostercero" label="Tipo de Tercero: " :error="validations.tipostercero.result">
                <RadioGroup v-model="tipoTercero">
                  <Radio label="natural" :disabled="$route.query.id === 0 ? false : true">
                    <Icon type="ios-person"/>
                    <span>Natural</span>
                  </Radio>
                  <Radio label="juridico" :disabled="$route.query.id === 0 ? false : true">
                    <Icon type="briefcase"/>
                    <span>Juridico</span>
                  </Radio>
                </RadioGroup>
              </FormItem>
              <!-- Item de tipo de identificacion -->
              <FormItem prop="tiposidentificacion" label="Tipo de identificacion" :required="true" :error="validations.tiposidentificacion.result">
                <Select style="width: 470px" v-model="terceroEdit.tercero.tipoidentificacion.id">
                  <Option v-for="item in tiposidentificacion" :value="item.id" :key="item.id">{{item.nombre}} ({{item.descripcion}})</Option>
                </Select>
              </FormItem>
              <!-- Item de numero de identificacion -->
              <FormItem prop="identificacion" label="# de identificacion" :required="true" :error="validations.identificacion.result">
                <Input style="text-transform: uppercase; width: 470px" v-model="terceroEdit.tercero.identificacion"/>
              </FormItem>
              <!-- Nombres o razon social segun corresponda -->
              <!-- Natural -->
              <FormItem :prop="tipoTercero === 'natural' ? 'nombre' : ''" v-if="tipoTercero === 'natural'" label="Nombre Tercero" :required="true" :error="validations.nombre.result">
                <Input placeholder="Primer Nombre" style="text-transform: uppercase; width: 115px" v-model="terceroEdit.primernombre"/>
                <Input placeholder="Segundo Nombre" style="text-transform: uppercase; width: 115px" v-model="terceroEdit.segundonombre"/>
                <Input placeholder="Primer Apellido" style="text-transform: uppercase; width: 115px" v-model="terceroEdit.primerapellido"/>
                <Input placeholder="Segundo Apellido" style="text-transform: uppercase; width: 115px" v-model="terceroEdit.segundoapellido"/>
              </FormItem>
              <!-- Juridico -->
              <FormItem :prop="tipoTercero === 'juridico' ? 'nombre' : ''" v-if="tipoTercero === 'juridico'" label="Nombre Tercero" :required="true" :error="validations.nombre.result">
                <Input placeholder="Razon social" style="text-transform: uppercase; width: 470px" v-model="terceroEdit.nombre"/>
              </FormItem>
              <FormItem v-if="tipoTercero === 'juridico'" label="Representante legal">
                <Input placeholder="Nombre completo" style="text-transform: uppercase; width: 470px" v-model="terceroEdit.representantelegal"/>
              </FormItem>
            </Form>
          </i-col>
          <!-- Geolocalizacion -->
          <i-col span="12">
            <Alert type="warning" show-icon>Geolocalizacion de tercero desactivada, el servicio de Geolocalizacion se encuentra desactivado directamente desde el servidor de AntrazStudios.</Alert>
          </i-col>
        </Row>
        <!-- Tabla de direcciones -->
        <Row v-if="this.$route.query.id !== 0" style="enable: false;">
          <i-table size="small" :columns="direccionesColumns" :data="direccionesEdit" :stripe="false" :height="300" :loading="isTableLoading">
            <div slot="footer" style="text-align: center;">
              <i-button @click="newDireccion()">Agregar direccion</i-button>
            </div>
            <div slot="loading" style="text-align: center;">
              <div class="modal-contenedor--img"></div>
              <label class="modal-contenedor--label">Cargando datos</label>
            </div>
          </i-table>
        </Row>
        <!-- Botones de accion -->
        <Row type="flex" align="bottom" justify="end">
          <i-col>
            <i-button style="margin-top: 50px" type="error" @click="() => { $router.go(-1) }">CANCELAR</i-button>
            <i-button style="margin-top: 50px" type="info" @click="$route.query.id === 0 ? createTercero() : updateTercero()">{{ $route.query.id === 0 ? 'CREAR' : 'ACTUALIZAR' }}</i-button>
          </i-col>
        </Row>
      </Row>
    </transition>
  </div>
</template>

<script>
  import EditorDirecciones from './editorDirecciones'
  export default {
    name: 'terceros-editor',
    components: { EditorDirecciones },
    data () {
      return {
        isTableLoading: false,
        editorDirecciones: false,
        tipoTercero: '',
        terceroEdit: require('../../libs/objects.js').createTercerosJuridica('', '', '', require('../../libs/objects.js').createTerceros('', require('../../libs/objects.js').createTiposIdentificacion('', '', ''), '', true)),
        direccionesEdit: [],
        selectDireccionesEdit: '',
        direccionesColumns: [],
        tiposidentificacion: [],
        validations: {
          tipostercero: { result: '' },
          tiposidentificacion: { result: '' },
          identificacion: { result: '' },
          nombre: { result: '' }
        }
      }
    },
    mounted () {
      this.getTiposIdentificacion()
      this.getTerceroInfo()
      // require('../../libs/miscelanius.js').addRulesFormField(this.$refs['FormTercero'], 'identificacion', { required: true, message: 'Este campo es obligatorio', trigger: 'blur' })
    },
    methods: {
      createRules () {
        this.validations = { tipostercero: '', tiposidentificacion: '', identificacion: '', nombre: '' }
        this.validations.tipostercero = {
          result: '',
          rules: [
            {
              prop: 'tipostercero',
              typevalidation: 'content-null',
              message: 'Debes elegir un tipo de tercero como minimo',
              args: ''
            }
          ]
        }
        this.validations.tiposidentificacion = {
          result: '',
          rules: [
            {
              prop: 'tiposidentificacion',
              typevalidation: 'content-null',
              message: 'Debes elegir un tipo de identificacion como minimo',
              args: ''
            }
          ]
        }
        this.validations.identificacion = {
          result: '',
          rules: [
            {
              prop: 'identificacion',
              typevalidation: 'content-null',
              message: 'El campo de identificacion no puede estar vacio',
              args: ''
            }
          ]
        }
        if (this.tipoTercero === 'juridico') {
          this.validations.nombre = {
            result: '',
            rules: [
              {
                prop: 'nombre',
                typevalidation: 'content-null',
                message: 'El campo de nombre no puede estar vacio',
                args: ''
              }
            ]
          }
        } else if (this.tipoTercero === 'natural') {
          this.validations.nombre = {
            result: '',
            rules: [
              {
                prop: 'nombre',
                typevalidation: 'content-null',
                message: 'El campo de nombre recibe como minimo el primer nombre y el primer apellido',
                args: {
                  children: [ 0, 2 ]
                }
              }
            ]
          }
        }
      },
      getTiposIdentificacion () {
        this.$parent.handleSpinShow('Cargando Configuracion')
        let storage = require('../../libs/storage.js')
        storage._database_consultTiposIdentificacion().then((rta) => {
          this.tiposidentificacion = rta
          this.$parent.handleSpinHide()
        }).catch((err) => {
          this.$Message.error(err)
          this.$parent.handleSpinHide()
        })
      },
      getTerceroInfo () {
        if (this.$route.query.id !== 0) {
          this.$parent.handleSpinShow('Cargando Tercero')
          let storage = require('../../libs/storage.js')
          this.isTableLoading = true
          storage._database_getTerceroDireccionesbyID({ id: this.$route.query.id, type: this.$route.query.type }).then((rta) => {
            this.terceroEdit = rta.tercero
            this.direccionesEdit = rta.direcciones
            this.createColumns()
            if (this.$route.query.type === 0) {
              this.tipoTercero = 'juridico'
            } else {
              this.tipoTercero = 'natural'
            }
            this.$parent.handleSpinHide()
            this.isTableLoading = false
          }).catch((err) => {
            console.log('Error de consulta', err)
            this.$Message.error(err)
            this.$parent.handleSpinHide()
          })
        }
      },
      createColumns () {
        this.direccionesColumns = []
        // Creacion de la columna del id
        if (require('../../libs/settings.js').getSesionProfile().verifyPermission('ROOT') === true) {
          this.direccionesColumns.push({
            title: 'Key',
            render: (h, {row}) => {
              return row.id
            },
            width: 80
          })
        }
        // Creacion de la columna del tipo de direccion
        this.direccionesColumns.push({
          title: 'Tipo',
          render: (h, {row}) => {
            return h('Tag', {}, row.tipodireccion.nombre)
          },
          width: 200
        })
        // Creacion de la columna de Requerimiento de Dependencia
        this.direccionesColumns.push({
          title: 'Req. Dependencia',
          render: (h, {row}) => {
            return h('Tag', {
              props: {
                type: 'dot',
                color: row.tipodireccion.reqdependencia === 1 ? 'green' : 'red'
              }
            }, row.tipodireccion.reqdependencia === 1 ? 'SI' : 'NO')
          },
          width: 150
        })
        // Creacion de la columna de Requerimiento de Horario
        this.direccionesColumns.push({
          title: 'Req. Horarios',
          render: (h, {row}) => {
            return h('Tag', {
              props: {
                color: row.tipodireccion.reqhorario === 1 ? 'green' : 'red'
              }
            }, row.tipodireccion.reqhorario === 1 ? 'REQUIERE' : 'NO REQUIERE')
          },
          width: 200
        })
        // Creacion de la columna de Direccion
        this.direccionesColumns.push({
          title: 'Direccion',
          render: (h, {row}) => {
            return row.direccion + ', ' + row.ciudad.nombre + ' - ' + row.ciudad.departamento.nombre + ' - ' + row.ciudad.departamento.pais.nombre
          }
        })
        // Creacion de la columna de Estado
        if (require('../../libs/settings.js').getSesionProfile().verifyPermission('ROOT') === true) {
          this.direccionesColumns.push({
            title: 'Estado',
            render: (h, {row}) => {
              return h('div', {}, [
                h('Icon', {
                  props: {
                    color: row.isactive === 1
                      ? '#27ae60'
                      : '#c0392b',
                    type: row.isactive === 1
                      ? 'checkmark-circled'
                      : 'close-circled'
                  },
                  style: {
                    marginRight: '5px'
                  }
                }),
                h('label', {
                  style: {
                    marginLeft: '5px'
                  }
                }, row.isactive === 1 ? 'Activo' : 'Inactivo')
              ])
            },
            width: 100
          })
        }
        // Creacion de la columna de botones
        this.direccionesColumns.push({
          title: 'Actions',
          key: 'actions',
          width: 150,
          align: 'center',
          render: (h, params) => {
            return h('div', [
              h('Tooltip', {
                props: {
                  content: 'Editar',
                  placement: 'left'
                }
              }, [
                h('i-button', {
                  props: {
                    type: 'info',
                    size: 'small',
                    shape: 'circle'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      // Cambiar el estado del editor
                      this.updateDireccion(params.row)
                    }
                  }
                }, [
                  h('Icon', {
                    props: {
                      type: 'edit'
                    }
                  })
                ])
              ]),
              h('Tooltip', {
                props: {
                  content: 'Cambiar estado',
                  placement: 'bottom'
                }
              }, [
                h('i-button', {
                  props: {
                    type: 'warning',
                    size: 'small',
                    shape: 'circle',
                    disabled: !require('../../libs/settings.js').getSesionProfile().verifyPermission('ROOT')
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.updateDireccionState(params.row)
                    }
                  }
                }, [
                  h('Icon', {
                    props: {
                      type: 'ios-loop-strong'
                    }
                  })
                ])
              ])
            ])
          }
        })
      },
      updateTercero () {
        this.createRules()
        require('../../libs/rules').validateRulesFormField(this.$refs['FormTercero'], this.validations).then((rta) => {
          this.validations = rta.rules
          // En caso de que la validacion no pase mostrar el error
          if (rta.resultValidation === false) {
            this.$Message.error('Aun hay campos que necesitan diligenciarse')
          // En caso de que la validacion pase continuar con el proceso de almacenamiento
          } else {
            this.$parent.handleSpinShow('Almacenando cambios')
            require('../../libs/storage')._database_updateTercerobyID({
              idTercero: this.terceroEdit.tercero.id,
              idHerencia: this.terceroEdit.id,
              idTipoDocumento: this.terceroEdit.tercero.tipoidentificacion.id,
              typeT: this.tipoTercero === 'juridico' ? 0 : 1,
              numerodocumento: this.terceroEdit.tercero.identificacion,
              datonombre1: this.tipoTercero === 'juridico' ? this.terceroEdit.nombre : this.terceroEdit.primernombre,
              datonombre2: this.tipoTercero === 'juridico' ? this.terceroEdit.razonsocial : this.terceroEdit.segundonombre,
              datonombre3: this.tipoTercero === 'natural' ? this.terceroEdit.primerapellido : '',
              datonombre4: this.tipoTercero === 'natural' ? this.terceroEdit.segundoapellido : ''
            }).then((rta) => {
              this.$parent.handleSpinHide()
              this.$Message.info(rta)
            }).catch((err) => {
              this.$parent.handleSpinHide()
              this.$Message.error(err)
              console.log('error de actualizacion de usuario', err)
            })
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      createTercero () {
        this.createRules()
        require('../../libs/rules').validateRulesFormField(this.$refs['FormTercero'], this.validations).then((rta) => {
          this.validations = rta.rules
          if (rta.resultValidation === false) {
            this.$Message.error('Aun hay campos que necesitan diligenciarse')
          } else {
            this.$parent.handleSpinShow('Creando Tercero')
            require('../../libs/storage')._database_createTercero({
              typeT: this.tipoTercero === 'juridico' ? 0 : 1,
              idTipoDocumento: this.terceroEdit.tercero.tipoidentificacion.id,
              numerodocumento: this.terceroEdit.tercero.identificacion,
              datonombre1: this.tipoTercero === 'juridico' ? this.terceroEdit.nombre : this.terceroEdit.primernombre,
              datonombre2: this.tipoTercero === 'juridico' ? this.terceroEdit.razonsocial : this.terceroEdit.segundonombre,
              datonombre3: this.tipoTercero === 'natural' ? this.terceroEdit.primerapellido : '',
              datonombre4: this.tipoTercero === 'natural' ? this.terceroEdit.segundoapellido : ''
            }).then((rta) => {
              this.$Message.info(rta)
              this.$parent.handleSpinHide()
              this.$parent.returnPath()
            }).catch((err) => {
              this.$Message.error(err)
              this.$parent.handleSpinHide()
            })
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      newDireccion () {
        const objects = require('../../libs/objects')
        this.selectDireccionesEdit = objects.createDireccion(0, objects.createTipoDireccion(0, '', '', '', ''), '', '', '[]', objects.createCiudad('', '', objects.createDepartamento('', '', objects.createPais('', ''))), '', '')
        this.editorDirecciones = !this.editorDirecciones
      },
      updateDireccionState (item) {
        this.$parent.handleSpinShow('Actualizando direccion')
        const storage = require('../../libs/storage')
        storage._database_updateDireccionState({
          idDireccion: item.id,
          state: !item.isactive
        }).then((rta) => {
          this.$Message.info(rta.message)
          this.$parent.handleSpinHide()
          this.getTerceroInfo()
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      updateDireccion (item) {
        this.selectDireccionesEdit = item
        this.editorDirecciones = !this.editorDirecciones
      }
    }
  }
</script>

<style lang="css" scoped>
  .content{
    overflow-x: hidden;
    position: relative;
    width: 100%;
    padding: 20px;
    min-height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
  }
  .buttons-action{
    top: 30px;
    right: 25px;
    width: 100%;
    text-align: right;
  }
  .labels-form{
    margin-right: 20px;
  }
  .modal-contenedor--img{
      display: block;
      margin: auto;
      width: 30px;
      height: 30px;
      /* background-image: url("~@/assets/images/ajax-loader.gif"); */
      background-image: url("~@/assets/images/ajax-loader.gif");
      background-size: contain;
  }
  .modal-contenedor--label{
      display: block;
      margin: 4%;
      text-align: center;
      color: rgba(41, 41, 41, 0.6);
  }
  .extern-contenedor--components{
    border-style: solid;
    border-width: 1px;
    border-radius: 8px;
    border-color: #DDDEE1;
    background-color: white;
    padding-top: 20px;
    padding-left: 20px;
    padding-right: 20px;
  }
</style>