<template>
  <div class="content">
    <!-- Titulo del WebComponent -->
    <h2 style="text-align: center; margin-bottom: 20px;">Editor de Contactos</h2>
    <!-- Editor de Contactos -->
    <Row>
      <Form ref="FormContacto" :label-width="130">
        <FormItem prop="nombre" label="Nombre Contacto: " :required="true" :error="validations.nombre.result">
          <Input type="text" v-model="contactoEdit.nombre"/>
        </FormItem>
        <FormItem prop="cargo" label="Cargo: " :required="true" :error="validations.cargo.result">
          <Input type="text" v-model="contactoEdit.cargo"/>
        </FormItem>
      </Form>
    </Row>
    <Row v-if="contactoEdit.id !== 0" :gutter="6">
      <!-- Tabla de Telefonos -->
      <i-col span="12">
        <i-table border v-if="showstelefonosEdit === false" size="small" :columns="telefonosColumnas" :data="telefonos" :stripe="false" :height="240" :loading="telefonosLoading">
          <div slot="footer" style="text-align: center;">
            <i-button @click="createTelefono">Agregar telefono</i-button>
          </div>
          <div slot="loading" style="text-align: center;">
            <div class="modal-contenedor--img"></div>
            <label class="modal-contenedor--label">Cargando telefonos</label>
          </div>
        </i-table>
        <!-- Editor de telefonos -->
        <div v-if="showstelefonosEdit === true" style="padding: 20px; border-color: #DDDEE1;  border-width: 1px; border-style: solid;">
          <edit-telefonos-component :editTelefono="telefonosEdit"></edit-telefonos-component>
        </div>
      </i-col>
      <!-- Tabla de emails -->
      <i-col span="12">
        <i-table border v-if="showsemailsEdit === false" size="small" :columns="emailsColumnas" :data="emails" :stripe="false" :height="240" :loading="emailsLoading">
          <div slot="footer" style="text-align: center;">
            <i-button @click="createEmail">Agregar Emails</i-button>
          </div>
          <div slot="loading" style="text-align: center;">
            <div class="modal-contenedor--img"></div>
            <label class="modal-contenedor--label">Cargando emails</label>
          </div>
        </i-table>
        <!-- Editor de Emails -->
        <div v-if="showsemailsEdit === true" style="padding: 20px; border-color: #DDDEE1; border-width: 1px; border-style: solid;">
          <edit-emails-component :editEmails="emailsEdit"></edit-emails-component>
        </div>
      </i-col>
    </Row>
    <!-- Botones de accion -->
    <Row type="flex" align="bottom" justify="center">
      <i-col>
        <i-button style="margin-top: 10px" type="error" @click="() => { this.$parent.$parent.editContactosShow = false }">CANCELAR</i-button>
        <i-button style="margin-top: 10px" type="info" @click="contactoEdit.id === 0 ? createContacto() : updateContacto()">{{ contactoEdit.id === 0 ? 'CREAR' : 'ACTUALIZAR' }}</i-button>
      </i-col>
    </Row>
  </div>
</template>
<script>
  import EditTelefonosComponent from './editorTelefonos'
  import EditEmailsComponent from './editorEmails'
  export default {
    name: 'contactos-editor',
    components: { EditTelefonosComponent, EditEmailsComponent },
    props: [ 'contactoEdit' ],
    data () {
      return {
        validations: {
          nombre: {
            result: '',
            rules: [
              {
                prop: 'nombre',
                typevalidation: 'content-null',
                message: 'Este campo es obligatorio',
                args: ''
              }
            ]
          },
          cargo: {
            result: '',
            rules: [
              {
                prop: 'cargo',
                typevalidation: 'content-null',
                message: 'Este campo es obligatorio',
                args: ''
              }
            ]
          }
        },
        telefonos: [],
        telefonosColumnas: [],
        telefonosEdit: '',
        telefonosLoading: false,
        showstelefonosEdit: false,
        emails: [],
        emailsColumnas: [],
        emailsEdit: '',
        emailsLoading: false,
        showsemailsEdit: false
      }
    },
    mounted () {
      this.createColumns()
      this.getContactoInfo()
    },
    methods: {
      createContacto () {
        const rules = require('../../libs/rules')
        rules.validateRulesFormField(this.$refs.FormContacto, this.validations).then((rta) => {
          if (rta.resultValidation === true) {
            const storage = require('../../libs/storage')
            storage._database_createContacto({
              idDireccion: this.contactoEdit.iddireccion,
              nombre: this.contactoEdit.nombre,
              cargo: this.contactoEdit.cargo
            }).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.getDireccionInfo()
              this.$parent.$parent.editContactosShow = false
            }).catch((err) => {
              this.$Message.error(err)
            })
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      updateContacto () {
        const rules = require('../../libs/rules')
        rules.validateRulesFormField(this.$refs.FormContacto, this.validations).then((rta) => {
          if (rta.resultValidation === true) {
            const storage = require('../../libs/storage')
            storage._database_updateContacto({
              idContacto: this.contactoEdit.id,
              nombre: this.contactoEdit.nombre,
              cargo: this.contactoEdit.cargo
            }).then((rta) => {
              this.$Message.info(rta.message)
              this.$parent.$parent.getDireccionInfo()
              this.$parent.$parent.editContactosShow = false
            }).catch((err) => {
              this.$Message.error(err)
            })
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      getContactoInfo () {
        this.telefonosLoading = true
        this.emailsLoading = true
        let storage = require('../../libs/storage')
        storage._database_getContactoInfo(this.contactoEdit.id).then((rta) => {
          this.telefonos = rta.telefonos
          this.emails = rta.mails
          this.telefonosLoading = false
          this.emailsLoading = false
        }).catch((err) => {
          this.$Message.error(err)
          this.telefonosLoading = false
          this.emailsLoading = false
        })
      },
      createColumns () {
        // limpiamos las columnas
        this.telefonosColumnas = []
        // creacion de la columna que muestra el numero de telefono
        this.telefonosColumnas.push({
          title: 'Numero',
          render: (h, {row}) => {
            return h('label', {}, row.numero)
          }
        })
        // creacion de la columna que muestra la extension si existe
        this.telefonosColumnas.push({
          title: 'Extension',
          render: (h, {row}) => {
            return h('label', {}, row.ext === 0 ? '<< sin-extension >>' : row.ext)
          }
        })
        // creacion de la columna de acciones
        this.telefonosColumnas.push({
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
                      this.editTelefono(params.row)
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
                      this.removeTelefono(params.row)
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
        // limpiamos las columnas de emails
        this.emailsColumnas = []
        // creacion de la columna que muestra la direccion
        this.emailsColumnas.push({
          title: 'Correo',
          render: (h, {row}) => {
            return h('label', {}, row.mail)
          }
        })
        // creacion de la columna que muestra si es la direccion default
        this.emailsColumnas.push({
          title: 'Default',
          width: 100,
          render: (h, {row}) => {
            return h('label', {}, row.isdefault === 1 ? 'SI' : 'NO')
          }
        })
        // creacion de la columna de acciones
        this.emailsColumnas.push({
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
                      this.editEmail(params.row)
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
                      this.removeEmail(params.row)
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
      },
      removeTelefono (row) {
        this.$Modal.confirm({
          title: 'Confirmacion eliminacion',
          content: '¿Esta seguro de querer eliminar este horario?, Esta accion no puede deshacerse',
          okText: 'Si, eliminar',
          cancelText: 'No',
          closable: true,
          onOk: () => {
            let storage = require('../../libs/storage')
            storage._database_removeTelefono(row.id).then((rta) => {
              this.$Message.info(rta.message)
              this.getContactoInfo()
            }).catch((err) => {
              this.$Message.error(err)
            })
          }
        })
      },
      removeEmail (row) {
        this.$Modal.confirm({
          title: 'Confirmacion eliminacion',
          content: '¿Esta seguro de querer eliminar este horario?, Esta accion no puede deshacerse',
          okText: 'Si, eliminar',
          cancelText: 'No',
          closable: true,
          onOk: () => {
            let storage = require('../../libs/storage')
            storage._database_removeEmail(row.id).then((rta) => {
              this.$Message.info(rta.message)
              this.getContactoInfo()
            }).catch((err) => {
              this.$Message.error(err)
            })
          }
        })
      },
      editTelefono (row) {
        this.telefonosEdit = row
        this.showstelefonosEdit = true
      },
      editEmail (row) {
        this.emailsEdit = row
        this.showsemailsEdit = true
      },
      createTelefono () {
        const objects = require('../../libs/objects')
        this.telefonosEdit = objects.createContactoTelefono(0, 0, '', 0, this.contactoEdit.id)
        this.showstelefonosEdit = true
      },
      createEmail () {
        const objects = require('../../libs/objects')
        this.emailsEdit = objects.createContactoEmail(0, '', 0, this.contactoEdit.id)
        this.showsemailsEdit = true
      }
    }
  }
</script>
<style>
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
    background-image: url("~@/assets/images/ajax-loader.gif");
    background-size: contain;
  }
  .modal-contenedor--label{
    display: block;
    margin: 4%;
    text-align: center;
    color: rgba(41, 41, 41, 0.6);
  }
</style>