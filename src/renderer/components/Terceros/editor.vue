<template>
  <div class="content">
    <Row type="flex" align="middle">
      <!-- Informacion basica del tercero -->
      <i-col span="12">
        <Form :label-width="130">
          <!-- Tipo de tercero -->
          <FormItem label="Tipo de Tercero: ">
            <RadioGroup v-model="tipoTercero">
              <Radio label="natural">
                <Icon type="ios-person"/>
                <span>Natural</span>
              </Radio>
              <Radio label="juridico">
                <Icon type="briefcase"/>
                <span>Juridico</span>
              </Radio>
            </RadioGroup>
          </FormItem>
          <!-- Item de tipo de identificacion -->
          <FormItem label="Tipo de identificacion">
            <Select style="width: 470px">
              <Option v-for="item in tiposidentificacion" :value="item.id" :key="item.id">{{item.nombre}} ({{item.descripcion}})</Option>
            </Select>
          </FormItem>
          <!-- Item de numero de identificacion -->
          <FormItem label="# de identificacion">
            <Input style="width: 470px"/>
          </FormItem>
          <!-- Nombres o razon social segun corresponda -->
          <!-- Natural -->
          <FormItem v-if="tipoTercero === 'natural'" label="Nombre Tercero">
            <Input placeholder="Primer Nombre" style="width: 115px"/>
            <Input placeholder="Segundo Nombre" style="width: 115px"/>
            <Input placeholder="Primer Apellido" style="width: 115px"/>
            <Input placeholder="Segundo Apellido" style="width: 115px"/>
          </FormItem>
          <!-- Juridico -->
          <FormItem v-if="tipoTercero === 'juridico'" label="Nombre Tercero">
            <Input placeholder="Razon social" style="width: 470px"/>
          </FormItem>
          <FormItem v-if="tipoTercero === 'juridico'" label="Representante legal">
            <Input placeholder="Nombre completo" style="width: 470px"/>
          </FormItem>
        </Form>
      </i-col>
      <!-- Geolocalizacion -->
      <i-col span="12">
        <Alert type="warning" show-icon>Geolocalizacion de tercero desactivada, el servicio de Geolocalizacion se encuentra desactivado directamente desde el servidor de AntrazStudios.</Alert>
      </i-col>
    </Row>
    <!-- Tabla de direcciones -->
    <Row>
      <i-table size="small" :columns="direccionesColumns" :data="direccionesEdit" :stripe="false" :height="300"></i-table>
    </Row>
    <!-- Botones de accion -->
    <Row class="buttons-action">
      <i-button type="error">CANCELAR</i-button>
      <i-button type="info">CREAR</i-button>
    </Row>
  </div>
</template>

<script>
  export default {
    name: 'terceros-editor',
    data () {
      return {
        tipoTercero: '',
        terceroEdit: '',
        direccionesEdit: [],
        direccionesColumns: [],
        tiposidentificacion: [
          {
            id: 1,
            nombre: 'CC',
            descripcion: 'Cedula de Ciudadania'
          },
          {
            id: 2,
            nombre: 'NIT',
            descripcion: 'Numero de identificacion T.'
          }
        ]
      }
    },
    mounted () {
      this.getTerceroInfo()
    },
    methods: {
      getTerceroInfo () {
        if (this.$route.query.id !== 0) {
          let storage = require('../../libs/storage.js')
          storage._database_getTerceroDireccionesbyID({ id: this.$route.query.id, type: this.$route.query.type }).then((rta) => {
            this.terceroEdit = rta.tercero
            this.direccionesEdit = rta.direcciones
            this.createColumns()
          }).catch((err) => {
            this.$Message.error(err)
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
                      this.selectRow(params.row)
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
                      this.changeState(params.row)
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
      }
    }
  }
</script>

<style lang="css" scoped>
  .content{
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
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 100%;
    text-align: center;
  }
  .labels-form{
    margin-right: 20px;
  }
</style>