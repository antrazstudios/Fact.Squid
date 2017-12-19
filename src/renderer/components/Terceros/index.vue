<template>
  <div class="content">
    <Row style="margin: 0px 20px 10px 0px;">
      <i-col span="6">
        <i-button icon="arrow-left-c" type="text" @click="$router.go(-1)">Regresar</i-button>
      </i-col>
      <i-col span="12">
        <Input ref="searchInput" v-model="searchText" placeholder="Ingrese el dato a buscar" :disabled="searchState">
          <span slot="prepend">Buscar: </span>
          <Tooltip slot="append" :content="searchState === false ? 'Ejecutar busqueda' : 'Cancelar busqueda' ">
            <Button ref="searchButtonRun" icon="search" @click="searchClick()" v-bind:style="{ display : searchState === false ? '' : 'none' }"></Button>
            <Button ref="searchButtonCancel" icon="close" @click="searchClick()" v-bind:style="{ display : searchState === false ? 'none' : '' }"></Button>
          </Tooltip>
        </Input>
      </i-col>
      <i-col span="6">
        <Tooltip content="Añadir nuevo tercero" style="float: right" placement="left">
          <i-button icon="plus-round" type="info" @click="createNew()"></i-button>
        </Tooltip>
        <i-switch style="float: right; margin-top: 5px; margin-right: 10px" v-model="switchTercero" @on-change="changeConsult">
          <Icon slot="open" type="briefcase"></Icon>
          <Icon slot="close" type="ios-body"></Icon>
        </i-switch>
      </i-col>
    </Row>
    <Row style="margin-bottom: 20px">
      <i-table ref="connTable" stripe :columns="columnsTerceros" :data="tercerosPages" size="small" :stripe="false" :height="$parent.maxHeightTable"></i-table>
      <div style="margin-top: 10px;overflow: hidden">
        <div style="float: right;">
          <Page :total="totalPages * 10" @on-change="changePages" ></Page>
        </div>
    </div>
    </Row>
  </div>
</template>
<script>
export default {
  name: 'terceros',
  data: () => ({
    // Tipo de datos a mostrar
    switchTercero: true,
    // Cantidad de paginas de la tabla
    totalPages: 10,
    // lista de terceros
    tercerosJur: [],
    tercerosNat: [],
    tercerosPages: [],
    // lista de columnas
    columnsTerceros: [],
    searchText: '',
    searchState: false
  }),
  mounted () {
    // do something after mounting vue instance
    this.loadTerceros()
  },
  methods: {
    changeConsult () {
      // Limpiamos la matriz de columnas
      this.columnsTerceros = []
      // Cargamos los items genericos
      // Item de tipo de identificacion
      this.columnsTerceros.push({
        title: 'Tipo Id.',
        render: (h, {row}) => {
          return row.tercero.tipoidentificacion.nombre
        },
        width: 100
      })
      // Numero de identificacion
      this.columnsTerceros.push({
        title: 'N. Identificacion',
        render: (h, {row}) => {
          return row.tercero.identificacion
        },
        width: 150
      })
      // Nombre segun tipo de Tercero
      if (this.switchTercero === true) {
        this.columnsTerceros.push({
          title: 'Razon Social',
          key: 'nombre'
        })
      } else {
        this.columnsTerceros.push({
          title: 'Nombres y apellidos',
          render: (h, {row}) => {
            return row.getFullName()
          }
        })
      }
      // Estado del item
      this.columnsTerceros.push({
        title: 'Estado',
        render: (h, {row}) => {
          return h('div', {}, [
            h('Icon', {
              props: {
                color: row.tercero.active === 1
                  ? '#27ae60'
                  : '#c0392b',
                type: row.tercero.active === 1
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
            }, row.tercero.active === 1 ? 'Activo' : 'Inactivo')
          ])
        },
        width: 100
      })
      // Botones de accion
      this.columnsTerceros.push({
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
                  shape: 'circle'
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
      this.getTotalPages()
      this.changePages(1)
    },
    getTotalPages () {
      this.totalPages = this.switchTercero === true ? Math.ceil(this.tercerosJur.length / 100) : Math.ceil(this.tercerosNat.length / 100)
    },
    loadTerceros () {
      this.$parent.handleSpinShow('Consultado terceros')
      const storage = require('../../libs/storage.js')
      storage._consultTerceros({ type: 'juridica' }).then((data1) => {
        this.tercerosJur = data1
        storage._consultTerceros({ type: 'natural' }).then((data2) => {
          this.tercerosNat = data2
          this.changeConsult()
          this.$parent.handleSpinHide()
        }).catch((message) => {
          this.$parent.handleSpinHide()
          this.$Message.error({
            content: message,
            duration: 8
          })
        })
      }).catch((message) => {
        this.$parent.handleSpinHide()
        this.$Message.error({
          content: message,
          duration: 8
        })
      })
    },
    searchClick () {
      if (this.searchText !== '') {
        if (this.searchState === false) {
          if (this.switchTercero === true) {
            this.tercerosJur = require('../../libs/miscelanius.js').filterMethod(this.tercerosJur, this.columnsTerceros, this.searchText)
          } else {
            this.tercerosNat = require('../../libs/miscelanius.js').filterMethod(this.tercerosNat, this.columnsTerceros, this.searchText)
          }
          this.searchState = true
          this.changeConsult()
        } else {
          this.loadTerceros()
          this.searchState = false
          this.searchText = ''
        }
      }
    },
    changePages (num) {
      this.tercerosPages = []
      for (let i = (num * 100) - 100; i < num * 100; i++) {
        if (this.switchTercero === true) {
          if (this.tercerosJur[i]) {
            this.tercerosPages.push(this.tercerosJur[i])
          }
        } else {
          if (this.tercerosNat[i]) {
            this.tercerosPages.push(this.tercerosNat[i])
          }
        }
      }
    },
    changeState (row) {
      let name = this.switchTercero === true ? row.nombre : row.getFullName()
      this.$parent.handleSpinShow('Cambiando el estado del tercero: ' + name)
      const storage = require('../../libs/storage.js')
      storage._changeStateTerceros({ id: row.tercero.id, state: row.tercero.active === 1 ? 0 : 1 }).then((message) => {
        this.$Message.success(message + '(' + name + ')')
        row.tercero.active = row.tercero.active === 1 ? 0 : 1
        this.$parent.handleSpinHide()
      }).catch((err) => {
        this.$Message.error(err)
        this.$parent.handleSpinHide()
      })
    },
    selectRow (row) {
      console.log(row)
    }
  }
}
</script>
<style lang="css" scoped>
  .content{
    width: 100%;
    min-height: 100%;
    padding: 20px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
  }
  .layout-text-item{
    margin: 8px 0px;
  }
  .form-text{
    text-align: center;
  }
  .form-object{
    margin-left: auto;
    margin-right: auto;
    display: block;
  }
  .layout-image{
    background-image: url('~@/assets/images/login_form.gif');
    background-size: contain;
    background-repeat: no-repeat;
    background-position: center;
    min-width: 150px;
    min-height: 150px;
  }
</style>
