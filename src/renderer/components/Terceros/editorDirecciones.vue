<template>
  <div class="content">
    <!-- Titulo del WebComponent -->
    <transition enter-active-class="animated slideInDown" :duration="{ enter: 1000 }">
      <h2 v-if="editContactosShow === false && editHorariosShow === false" style="text-align: center; margin-bottom: 20px;">Editor de Direcciones</h2>
    </transition>
    <!-- Contenido del WebComponent -->
    <!-- Editor de Horarios -->
    <Row>
      <transition enter-active-class="animated slideInDown" :duration="{ enter: 1000 }" >
        <div class="extern-contenedor--components" v-if="editHorariosShow === true">
          <i-button shape="circle" size="small" icon="close-round" @click="() => { this.editHorariosShow = !this.editHorariosShow }"></i-button>
          <edit-horarios-component style="margin-left: 20px" :horarioEdit="horarioSelect"></edit-horarios-component>
        </div>
      </transition>
    </Row>
    <!-- Editor de Contactos -->
    <Row>
      <transition enter-active-class="animated slideInDown" :duration="{ enter: 1000 }" >
        <div class="extern-contenedor--components-sub" v-if="editContactosShow === true">
          <i-button shape="circle" size="small" icon="close-round" @click="() => { this.editContactosShow = !this.editContactosShow }"></i-button>
          <edit-contactos-component :contactoEdit="contactoSelect"></edit-contactos-component>
        </div>
      </transition>
    </Row>
    <!-- Editor de Direccion -->
    <transition enter-active-class="animated slideInDown" :duration="{ enter: 1000 }">
      <Row type="flex" :gutter="16" v-if="editContactosShow === false && editHorariosShow === false">
        <i-col span="12">
          <Form ref="FormDireccion" :label-width="130">
            <!-- Tipo de Direccion -->
            <FormItem prop="tipodireccion" label="Tipo de Direccion: " :required="true" :error="validations.tipodireccion.result">
              <Select v-model="selectIdTipoDireccion" v-on:on-change="updateTipoDireccion()">
                <Option v-for="item in tiposDirecciones" :value="item.id" :key="item.id">{{item.nombre}}</Option>
              </Select>
            </FormItem>
            <!-- Dependencia de la Direccion en caso que aplique -->
            <FormItem v-if="selectTipoDireccion.reqdependencia === 1" prop="dependenciadireccion" label="Dependencia: " :required="true" :error="validations.dependenciadireccion !== undefined ? validations.dependenciadireccion.result : ''">
              <Input style="text-transform:uppercase" type="text" v-model="direccionEdit.dependencia"/>
            </FormItem>
            <!-- Componente de Ciudad-Departamento-Ciudad -->
            <edit-direccion-component ref="editordireccion" :direccionTags="direccionEdit.direccionjson" :selections="{ pais: this.direccionEdit.ciudad.departamento.pais.id, departamento: this.direccionEdit.ciudad.departamento.id, ciudad: this.direccionEdit.ciudad.id }"></edit-direccion-component>
          </Form>
        </i-col>
        <i-col span="12">
          <Alert type="warning" show-icon>Geolocalizacion de tercero desactivada, el servicio de Geolocalizacion se encuentra desactivado directamente desde el servidor de AntrazStudios.</Alert>
        </i-col>
      </Row>
    </transition>
    <!-- Tablas de informacion adicional -->
    <transition enter-active-class="animated slideInDown" :duration="{ enter: 1000 }">
      <Row v-if="editContactosShow === false && editHorariosShow === false" type="flex" :gutter="16">
        <!-- Tabla de Contactos -->
        <i-col v-if="direccionEdit.id !== 0" span="12">
          <i-table size="small" :columns="contactosColumns" :data="contactos" :stripe="false" :height="240" :loading="contactosIsLoading">
            <div slot="footer" style="text-align: center;">
              <i-button @click="createContacto">Agregar Contacto</i-button>
            </div>
            <div slot="loading" style="text-align: center;">
              <div class="modal-contenedor--img"></div>
              <label class="modal-contenedor--label">Cargando contactos</label>
            </div>
          </i-table>
        </i-col>
        <!-- Tabla de Horarios -->
        <i-col v-if="direccionEdit.id !== 0" span="12">
          <i-table v-if="selectTipoDireccion.reqhorario === 1" size="small" :columns="horariosColumns" :data="horarios" :stripe="false" :height="240" :loading="horariosIsLoading">
            <div slot="footer" style="text-align: center;">
              <i-button @click="createHorario">Agregar Horario</i-button>
            </div>
            <div slot="loading" style="text-align: center;">
              <div class="modal-contenedor--img"></div>
              <label class="modal-contenedor--label">Cargando horarios</label>
            </div>
          </i-table>
          <Alert v-if="selectTipoDireccion.reqhorario !== 1" type="warning" show-icon>Este tipo de Direccion no require el uso de horarios para el envio de documentacion</Alert>
        </i-col>
      </Row>
    </transition>
    <!-- Botones de accion -->
    <transition enter-active-class="animated slideInDown" :duration="{ enter: 1000 }">
      <Row v-if="editContactosShow === false && editHorariosShow === false" type="flex" align="bottom" justify="center">
        <i-col>
          <i-button style="margin-top: 10px" type="error" @click="() => { this.$parent.$parent.editorDirecciones = false }">CANCELAR</i-button>
          <i-button style="margin-top: 10px" type="info" @click="direccionEdit.id === 0 ? createDireccion() : updateDireccion()">{{ direccionEdit.id === 0 ? 'CREAR' : 'ACTUALIZAR' }}</i-button>
        </i-col>
      </Row>
    </transition>
  </div>
</template>

<script>
  import EditDireccionComponent from '../miscelanius/editDireccionComponent'
  import EditHorariosComponent from './editorHorario'
  import EditContactosComponent from './editorContactos'
  export default {
    name: 'direcciones-editor',
    components: { EditDireccionComponent, EditHorariosComponent, EditContactosComponent },
    props: ['direccionEdit', 'actionsCallback', 'idTercero'],
    data () {
      return {
        id: 0,
        selectIdTipoDireccion: '',
        selectTipoDireccion: '',
        tiposDirecciones: [],
        editHorariosShow: false,
        editContactosShow: false,
        horarioSelect: require('../../libs/objects').createHorario(0, this.direccionEdit.id, 1, 30, '08:00:00', '16:00:00'),
        horarios: [],
        horariosColumns: [],
        horariosIsLoading: false,
        contactoSelect: require('../../libs/objects').createContacto(0, this.direccionEdit.id, '', '', 1),
        contactos: [],
        contactosColumns: [],
        contactosIsLoading: false,
        validations: {
          tipodireccion: { result: '' },
          dependenciadireccion: undefined
        }
      }
    },
    mounted () {
      this.createColumns()
      if (this.direccionEdit.id !== 0) {
        this.getDireccionInfo()
        this.getTiposDireccion(() => {
          this.selectIdTipoDireccion = this.direccionEdit.tipodireccion.id
        })
      } else {
        this.getTiposDireccion()
      }
    },
    methods: {
      getDireccionInfo () {
        let storage = require('../../libs/storage')
        this.horariosIsLoading = true
        this.contactosIsLoading = true
        storage._database_getDireccionHorariosContactos(this.direccionEdit.id).then((rta) => {
          this.contactos = rta.contactos
          this.horarios = rta.horarios
        }).catch((err) => {
          this.$Message.error(err)
        })
        this.horariosIsLoading = false
        this.contactosIsLoading = false
      },
      getTiposDireccion (_callback = null) {
        let storage = require('../../libs/storage')
        storage._database_consultTiposDirecciones().then((rta) => {
          this.tiposDirecciones = rta
          if (_callback !== null) {
            _callback()
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      updateTipoDireccion () {
        // buscar id seleccionada en la lista de id
        for (let i = 0; i < this.tiposDirecciones.length; i++) {
          const tipoDireccion = this.tiposDirecciones[i]
          if (tipoDireccion.id === this.selectIdTipoDireccion) {
            this.selectTipoDireccion = tipoDireccion
          }
        }
      },
      createRules () {
        this.validations = { tiposdireccion: { result: '' }, dependenciadireccion: undefined }
        this.validations.tipodireccion = {
          result: '',
          rules: [
            {
              prop: 'tipodireccion',
              typevalidation: 'content-null',
              message: 'Debes elegir un tipo de Direccion como minimo',
              args: ''
            }
          ]
        }
        if (this.selectTipoDireccion.reqdependencia === 1) {
          this.validations.dependenciadireccion = {
            result: '',
            rules: [
              {
                prop: 'dependenciadireccion',
                typevalidation: 'content-null',
                message: 'El tipo de direccion seleccionado, requiere dependencia',
                args: ''
              }
            ]
          }
        }
      },
      createDireccion () {
        const rules = require('../../libs/rules')
        this.createRules()
        rules.validateRulesFormField(this.$refs.FormDireccion, this.validations).then((rta) => {
          this.validations = rta.rules
          if (rta.resultValidation === false || this.$refs.editordireccion._component_validate() === false) {
            this.$Message.error('Aun hay campos obligatorios por diligenciar')
          } else {
            let dataCreate = {
              idTercero: this.idTercero,
              idTipoDireccion: this.selectIdTipoDireccion,
              dependencia: this.direccionEdit.dependencia,
              direccion: this.$refs.editordireccion._component_getdireccionText(),
              direcciontagsjson: JSON.stringify(this.$refs.editordireccion._component_getdireccionTags()),
              idCiudad: this.$refs.editordireccion._component_getciudad().id,
              webString: ''
            }
            this.$parent.$parent.$parent.handleSpinShow('Creando direccion') // pendiente de mejorar
            require('../../libs/storage')._database_createDireccion(dataCreate).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.getTerceroInfo()
              this.$parent.$parent.editorDirecciones = false // pendiente de mejorar
            }).catch((err) => {
              this.$parent.$parent.$parent.handleSpinHide() // pendiente de mejorar
              this.$Message.error(err)
            })
          }
        })
      },
      updateDireccion () {
        const rules = require('../../libs/rules')
        this.createRules()
        rules.validateRulesFormField(this.$refs.FormDireccion, this.validations).then((rta) => {
          this.validations = rta.rules
          if (rta.resultValidation === false || this.$refs.editordireccion._component_validate() === false) {
            this.$Message.error('aun hay campos obligatorios por diligenciar')
          } else {
            let dataCreate = {
              idDireccion: this.direccionEdit.id,
              idTipoDireccion: this.selectIdTipoDireccion,
              dependencia: this.direccionEdit.dependencia,
              direccion: this.$refs.editordireccion._component_getdireccionText(),
              direcciontagsjson: JSON.stringify(this.$refs.editordireccion._component_getdireccionTags()),
              idCiudad: this.$refs.editordireccion._component_getciudad().id,
              webString: ''
            }
            this.$parent.$parent.$parent.handleSpinShow('Actualizando direccion') // pendiente de mejorar
            require('../../libs/storage')._database_updateDireccion(dataCreate).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.getTerceroInfo()
              this.$parent.$parent.editorDirecciones = false // pendiente de mejorar
            }).catch((err) => {
              this.$parent.$parent.$parent.handleSpinHide() // pendiente de mejorar
              this.$Message.error(err)
            })
          }
        })
      },
      createColumns () {
        // Creacion de columnas para tabla de horarios
        this.horariosColumns = []
        this.horariosColumns.push({
          title: 'Periodo Dias',
          render: (h, {row}) => {
            return row.diainicio + ' - ' + row.diafinal
          }
        })
        this.horariosColumns.push({
          title: 'Periodo en Tiempo',
          render: (h, {row}) => {
            return 'Desde ' + row.horainicio + ' hasta ' + row.horafinal
          }
        })
        this.horariosColumns.push({
          title: 'Acciones',
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
                      this.updateHorario(params.row)
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
                  content: 'Eliminar',
                  placement: 'bottom'
                }
              }, [
                h('i-button', {
                  props: {
                    type: 'error',
                    size: 'small',
                    shape: 'circle',
                    disabled: !require('../../libs/settings.js').getSesionProfile().verifyPermission('ROOT')
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.removeHorario(params.row)
                    }
                  }
                }, [
                  h('Icon', {
                    props: {
                      type: 'trash-b'
                    }
                  })
                ])
              ])
            ])
          }
        })
        // Creacion de columnas para tabla de contactos
        this.contactosColumns = []
        this.contactosColumns.push({
          title: 'Nombre',
          render: (h, {row}) => {
            return row.nombre
          }
        })
        this.contactosColumns.push({
          title: 'Cargo',
          render: (h, {row}) => {
            return row.cargo
          }
        })
        if (require('../../libs/settings.js').getSesionProfile().verifyPermission('ROOT') === true) {
          this.contactosColumns.push({
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
        this.contactosColumns.push({
          title: 'Acciones',
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
                      this.updateContacto(params.row)
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
                  content: 'Cambiar Estado',
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
                      this.updateContactoState(params.row)
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
      updateContactoState (item) {
        console.log(item)
        this.$parent.$parent.$parent.handleSpinShow('Actualizando Contacto')
        const storage = require('../../libs/storage')
        storage._database_updateContactoState({
          idContacto: item.id,
          state: !item.isactive
        }).then((rta) => {
          this.$Message.info(rta.message)
          this.$parent.$parent.$parent.handleSpinHide()
          this.getDireccionInfo()
        }).catch((err) => {
          this.$Message.error(err)
          this.$parent.$parent.$parent.handleSpinHide()
        })
      },
      createContacto () {
        this.contactoSelect = require('../../libs/objects').createContacto(0, this.direccionEdit.id, '', '', 1)
        this.editContactosShow = true
      },
      updateContacto (item) {
        this.contactoSelect = item
        this.editContactosShow = true
      },
      removeHorario (item) {
        this.$Modal.confirm({
          title: 'Confirmacion eliminacion',
          content: '¿Esta seguro de querer eliminar este horario?, Esta accion no puede deshacerse',
          okText: 'Si, eliminar',
          cancelText: 'No',
          closable: true,
          onOk: () => {
            this.$parent.$parent.$parent.handleSpinShow('Actualizando Contacto')
            const storage = require('../../libs/storage')
            storage._database_removeHorario(item.id).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.$parent.handleSpinHide()
              this.getDireccionInfo()
            }).catch((err) => {
              this.$Message.error(err)
              this.$parent.$parent.$parent.handleSpinHide()
            })
          }
        })
      },
      createHorario () {
        this.horarioSelect = require('../../libs/objects').createHorario(0, this.direccionEdit.id, 1, 30, '08:00:00', '16:00:00')
        this.editHorariosShow = true
      },
      updateHorario (item) {
        this.horarioSelect = item
        this.editHorariosShow = true
      }
    }
  }
</script>

<style lang="css" scoped>
  .content{
    position: relative;
    width: 100%;
    min-height: 100%;
    user-select: none;
    margin-top: 20px;
  }
  .modal-contenedor--img{
    display: block;
    margin: auto;
    width: 30px;
    height: 30px;
    /* background-image: url("~@/assets/images/ajax-loader.gif"); */
    background-image: url("~@/assets/images/loading.gif");
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
    margin-bottom: 20px;
    padding-top: 20px;
    padding-left: 20px;
    padding-right: 20px;
    margin-left: 20%;
    margin-right: 20%;
  }
  .extern-contenedor--components-sub{
    border-style: solid;
    border-width: 1px;
    border-radius: 8px;
    border-color: #DDDEE1;
    background-color: white;
    margin-bottom: 20px;
    padding-top: 20px;
    padding-left: 20px;
    padding-right: 20px;
  }
</style>
