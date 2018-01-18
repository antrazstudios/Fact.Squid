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
    <Row :gutter="6">
      <!-- Tabla de Telefonos -->
      <i-col span="12">
        <i-table size="small" :columns="telefonosColumnas" :data="telefonos" :stripe="false" :height="240" :loading="telefonosLoading">
          <div slot="footer" style="text-align: center;">
            <i-button>Agregar telefono</i-button>
          </div>
          <div slot="loading" style="text-align: center;">
            <div class="modal-contenedor--img"></div>
            <label class="modal-contenedor--label">Cargando telefonos</label>
          </div>
        </i-table>
      </i-col>
      <!-- Tabla de emails -->
      <i-col span="12">
        <i-table size="small" :columns="emailsColumnas" :data="emails" :stripe="false" :height="240" :loading="emailsLoading">
          <div slot="footer" style="text-align: center;">
            <i-button>Agregar Emails</i-button>
          </div>
          <div slot="loading" style="text-align: center;">
            <div class="modal-contenedor--img"></div>
            <label class="modal-contenedor--label">Cargando emails</label>
          </div>
        </i-table>
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
  export default {
    name: 'contactos-editor',
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
        emails: [],
        emailsColumnas: [],
        emailsEdit: '',
        emailsLoading: false
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
          console.log(rta)
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
            return row.numero
          }
        })
        // creacion de la columna que muestra la extension si existe
        this.telefonosColumnas.push({
          title: 'Extension',
          render: (h, {row}) => {
            return row.ext === 0 ? '<< sin-extension >>' : row.ext
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
          title: 'Direccion',
          render: (h, {row}) => {
            return row.mail
          }
        })
        // creacion de la columna que muestra si es la direccion default
        this.emailsColumnas.push({
          title: 'Default',
          width: 80,
          render: (h, {row}) => {
            return row.isdefault === 1 ? 'SI' : 'NO'
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
        let storage = require('../../libs/storage')
        storage._database_removeTelefono(row.id).then((rta) => {
          this.$Message.info(rta.message)
          this.getContactoInfo()
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      removeEmail (row) {
        let storage = require('../../libs/storage')
        storage._database_removeEmail(row.id).then((rta) => {
          this.$Message.info(rta.message)
          this.getContactoInfo()
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      editTelefono (row) {

      },
      editEmail (row) {

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
    background-image: url("~@/assets/images/loading.gif");
    background-size: contain;
  }
  .modal-contenedor--label{
    display: block;
    margin: 4%;
    text-align: center;
    color: rgba(41, 41, 41, 0.6);
  }
</style>