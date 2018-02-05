<template>
  <div class="content">
    <Row v-if="isEditor === false" style="margin: 0px 10px 10px 0px;">
      <i-col span="6">
        <i-button icon="arrow-left-c" type="text" @click="$router.go(-1)">Regresar</i-button>
      </i-col>
      <i-col span="12">
        <Input ref="searchInput" v-model="searchText" placeholder="Ingrese el dato a buscar" :disabled="searchState" v-on:on-enter="searchClick()">
          <span slot="prepend">Buscar: </span>
          <Tooltip slot="append" :content="searchState === false ? 'Ejecutar busqueda' : 'Cancelar busqueda' ">
            <Button ref="searchButtonRun" icon="search" @click="searchClick()" v-bind:style="{ display : searchState === false ? '' : 'none' }"></Button>
            <Button ref="searchButtonCancel" icon="close" @click="searchClick()" v-bind:style="{ display : searchState === false ? 'none' : '' }"></Button>
          </Tooltip>
        </Input>
      </i-col>
      <i-col span="6">
        <Tooltip content="Añadir nuevo contenido" style="float: right" placement="left">
          <i-button icon="plus-round" type="info" @click="createContent()"></i-button>
        </Tooltip>
      </i-col>
    </Row>
    <Row v-if="isEditor === false" style="margin-bottom: 20px">
      <i-table :columns="columnsContent" :data="dbcontent" size="small" :stripe="false" :height="$parent.maxHeightTable"></i-table>
    </Row>
    <Row v-if="isEditor === true" style="margin-bottom: 20px;">
      <div style="text-align: center">
        <h2>Editor de contenidos</h2>
      </div>
    </Row>
    <Row v-if="isEditor === true" style="margin: 0px 10px 10px 0px;" type="flex" :gutter="16">
      <i-col span="13">
        <Form ref="FormContent" :label-width="200">
          <FormItem label="Fecha de publicacion: " :required="true" prop="fechapublicacion" :error="validations.fechapublicacion.result">
            <DatePicker type="date" style="width: 100%" :value="itemEdit.date"></DatePicker>
          </FormItem>
          <FormItem label="Titulo: " :required="true" prop="titulo" :error="validations.titulo.result">
            <Input style="text-transform: uppercase; width: 100%" v-model="itemEdit.title"/>
          </FormItem>
          <FormItem label="Autor: " :required="true" prop="author" :error="validations.author.result">
            <Select style="width: 100%" v-model="itemEdit.author" @on-change="updateConfigAuthor(itemEdit.author)">
              <Option v-for="item in autores" :value="item.nombre" :key="item.id">{{item.nombre}}</Option>
            </Select>
          </FormItem>
          <FormItem label="Configuracion de Autor: " v-if="itemEdit.author !== null && itemEdit.author !== undefined && itemEdit.author !== ''" style="opacity: 0.5">
            <Row type="flex" justify="start" align="middle">
              <img style="height: 20px; margin-right: 10px" :src="itemEdit.imgsrc"/>
              <label>{{itemEdit.origin}}</label>
              <Icon style="margin-left: 10px" :type="itemEdit.origin_icon"/>
            </Row>
          </FormItem>
          <FormItem label="Descripcion: " :required="true" prop="descripcion" :error="validations.descripcion.result">
            <Input style="text-transform: uppercase; width: 100%" v-model="itemEdit.description" type="textarea" :rows="4"/>
          </FormItem>
          <FormItem label="Contenido: " :required="false">
            <Input style="text-transform: uppercase; width: 100%" v-model="itemEdit.content" type="textarea" :rows="8"/>
          </FormItem>
          <FormItem label="Link adicional: ">
            <Input style="text-transform: uppercase; width: 100%" v-model="itemEdit.link"/>
          </FormItem>
        </Form>
      </i-col>
      <i-col span="10">
        <label>Link de la imagen para el banner</label>
        <Input style="text-transform: uppercase; width: 100%; margin-top: 10px; margin-bottom: 10px;" v-model="itemEdit.banner"/>
        <img v-if="itemEdit.banner !== null" :src="itemEdit.banner" style="width: 100%">
      </i-col>
      <i-col span="1">
        <i-switch v-model="itemEdit.isOutstanding">
          <Icon type="android-star" slot="open"></Icon>
          <Icon type="android-close" slot="close"></Icon>
        </i-switch>
      </i-col>
    </Row>
    <Row v-if="isEditor === true" type="flex" align="bottom" justify="center">
      <i-button style="margin-top: 5px; margin-bottom: 10px;" type="error" @click="() => { isEditor = false }">CANCELAR</i-button>
      <i-button style="margin-top: 5px; margin-left: 10px; margin-bottom: 10px;" type="info" @click="editorType === 'editor' ? updateContentToFeed() : addContentToFeed()" >{{ editorType === 'editor' ? 'ACTUALIZAR ENTRADA' : 'CREAR ENTRADA' }}</i-button>
    </Row>
    <Modal v-model="deleteConfirmation" width="360">
      <p slot="header" style="color:#f60;text-align:center">
          <Icon type="information-circled"></Icon>
          <span>Confirmacion de eliminacion</span>
      </p>
      <div style="text-align:center">
          <p>Esta accion no se puede reversar, automaticamente despues de elimarse, no sera visible para los usuarios de su plataforma</p>
          <p>¿Estas seguro de querer eliminar este item?</p>
      </div>
      <div slot="footer">
          <Button type="error" size="large" long @click="deleteContent()">Eliminar</Button>
      </div>
    </Modal>
  </div>
</template>
<script>
  export default {
    name: 'content-editor',
    data () {
      return {
        // lista de contenidos
        dbcontent: [],
        // lista de columnas
        columnsContent: [],
        searchText: '',
        searchState: false,
        firebase: '',
        storageRef: '',
        firebaseConfig: '',
        firebaseDatabase: '',
        firebaseDatabaseRef: '',
        firebaseDbRender: null,
        firebaseCharge: true,
        deleteConfirmation: false,
        deleteToItem: null,
        isEditor: false,
        editorType: 'editor',
        itemEdit: {},
        autores: [
          {
            id: 0,
            nombre: 'AntrazStudios Colombia',
            imgsrc: 'https://firebasestorage.googleapis.com/v0/b/fact-squid.appspot.com/o/banners%2Fantraz_studios_logotipo.png?alt=media&token=6a3415e0-923a-4c04-8c91-e10e122e186c',
            origin: 'antrazstudios.com',
            origin_icon: 'ios-world'
          },
          {
            id: 1,
            nombre: 'Cootrasmar CTA',
            imgsrc: 'https://firebasestorage.googleapis.com/v0/b/fact-squid.appspot.com/o/banners%2Fcootramarcta-profile.png?alt=media&token=62a3b944-e6e3-4a15-ac4c-3929980d1b98',
            origin: 'Bucaramanga, Santander',
            origin_icon: 'ios-location'
          },
          {
            id: 2,
            nombre: 'Hospital Universitario de Santander',
            imgsrc: 'https://firebasestorage.googleapis.com/v0/b/fact-squid.appspot.com/o/banners%2Fhus-profile.jpg?alt=media&token=df9ff52d-5ad8-4f39-8db1-240a0f791d8c',
            origin: 'Bucaramanga, Santander',
            origin_icon: 'ios-medkit'
          }
        ],
        validations: {
          fechapublicacion: {
            result: '',
            rules: [
              {
                prop: 'fechapublicacion',
                typevalidation: 'content-null',
                message: 'La fecha de la publicacion no puede estar vacia',
                args: []
              }
            ]
          },
          titulo: {
            result: '',
            rules: [
              {
                prop: 'titulo',
                typevalidation: 'content-null',
                message: 'El titulo es necesario para mostrar al usuario',
                args: []
              }
            ]
          },
          author: {
            result: '',
            rules: [
              {
                prop: 'author',
                typevalidation: 'content-null',
                message: 'Es necesario que el usuario sepa quien escribio esto',
                args: []
              }
            ]
          },
          descripcion: {
            result: '',
            rules: [
              {
                prop: 'descripcion',
                typevalidation: 'content-null',
                message: 'Es necesario que describas tu titulo',
                args: []
              }
            ]
          }
        }
      }
    },
    methods: {
      createContent () {
        this.itemEdit = {
          author: '',
          banner: '',
          content: '',
          date: '',
          description: '',
          imgsrc: '',
          isOutstanding: '',
          link: '',
          origin: '',
          origin_icon: '',
          title: ''
        }
        this.editorType = 'create'
        this.isEditor = true
      },
      editContet (item) {
        this.itemEdit = item
        this.editorType = 'editor'
        this.isEditor = true
      },
      deleteContent () {
        if (this.deleteToItem !== null) {
          this.firebaseDatabase.ref('news/' + this.deleteToItem.key).remove()
          this.deleteToItem = null
          this.deleteConfirmation = false
        }
      },
      createColumns () {
        // limpiamos las columnas
        this.columnsContent = []
        // defines la columna del author
        this.columnsContent.push({
          title: 'Autor',
          render: (h, {row}) => {
            return row.author
          },
          width: 180
        })
        // definir la columna del titulo
        this.columnsContent.push({
          title: 'Titulo',
          render: (h, {row}) => {
            return h('label', {
              style: {
                width: '50px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'normal'
              }
            }, row.title)
          },
          width: 200
        })
        // definir fecha publicacion
        this.columnsContent.push({
          title: 'Fecha Publ.',
          render: (h, {row}) => {
            return row.date
          },
          width: 110
        })
        // definir un poco del contenido
        this.columnsContent.push({
          title: 'Decripcion',
          render: (h, {row}) => {
            return row.description
          }
        })
        // definir acciones
        this.columnsContent.push({
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
                      this.editContet(params.row)
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
                  content: 'Eliminar entrada',
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
                      this.deleteToItem = params.row
                      this.deleteConfirmation = true
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
      updateConfigAuthor (value) {
        this.autores.forEach(element => {
          if (element.nombre === this.itemEdit.author) {
            this.itemEdit.imgsrc = element.imgsrc
            this.itemEdit.origin = element.origin
            this.itemEdit.origin_icon = element.origin_icon
          }
        })
      },
      addContentToFeed () {
        require('../../libs/rules').validateRulesFormField(this.$refs['FormContent'], this.validations).then((rta) => {
          if (rta.resultValidation === false) {
            this.$Message.error('Aun hay campos que necesitan diligenciarse')
          } else {
            this.firebaseDatabaseRef.set({
              author: this.itemEdit.author,
              banner: this.itemEdit.banner,
              content: this.itemEdit.content,
              date: this.itemEdit.date,
              description: this.itemEdit.description,
              imgsrc: this.itemEdit.imgsrc,
              isOutstanding: this.itemEdit.isOutstanding,
              link: this.itemEdit.link,
              origin: this.itemEdit.origin,
              origin_icon: this.itemEdit.origin_icon,
              title: this.itemEdit.title
            })
            this.isEditor = false
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      updateContentToFeed () {
        require('../../libs/rules').validateRulesFormField(this.$refs['FormContent'], this.validations).then((rta) => {
          if (rta.resultValidation === false) {
            this.$Message.error('Aun hay campos que necesitan diligenciarse')
          } else {
            this.firebaseDatabase.ref('news/' + this.itemEdit.key).update({
              author: this.itemEdit.author,
              banner: this.itemEdit.banner,
              content: this.itemEdit.content,
              date: this.itemEdit.date,
              description: this.itemEdit.description,
              imgsrc: this.itemEdit.imgsrc,
              isOutstanding: this.itemEdit.isOutstanding,
              link: this.itemEdit.link,
              origin: this.itemEdit.origin,
              origin_icon: this.itemEdit.origin_icon,
              title: this.itemEdit.title
            })
            this.isEditor = false
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      }
    },
    mounted () {
      // inicializar libreria de objetos
      let objects = require('../../libs/objects')
      // inicializar libreria de firebase para obtener los datos
      this.firebase = require('firebase')
      // creacion de la configuracion de la aplicacion
      this.firebaseConfig = {
        apiKey: 'AIzaSyD0RbHghkmKo5vKPC_eKNhK-I4Yuod81ao',
        authDomain: 'fact-squid.firebaseapp.com',
        databaseURL: 'https://fact-squid.firebaseio.com',
        projectId: 'fact-squid',
        storageBucket: 'gs://fact-squid.appspot.com'
      }
      // inicializacion de la aplicacion, en caso que no se haya realizado
      if (this.firebase.apps.length === 0) {
        this.firebase.initializeApp(this.firebaseConfig)
      }
      // creacion de la base de datos
      this.firebaseDatabase = this.firebase.database()
      // creamos la referencia de la base de datos
      this.firebaseDatabaseRef = this.firebaseDatabase.ref('news')
      // obtenemos datos en cada actualizacion de contenido
      this.firebaseDatabaseRef.on('value', (snap) => {
        this.firebaseCharge = true
        // Obtenemos la lista de datos para renderizar en pantalla
        this.firebaseDbRender = snap.val()
        // limpiamos la lista de noticias para ingresar las nuevas
        this.dbcontent = []
        // recorremos la seleccion descargando los datos para mostrar
        for (const notice in this.firebaseDbRender) {
          if (this.firebaseDbRender.hasOwnProperty(notice)) {
            const element = this.firebaseDbRender[notice]
            // creamos la noticia para ingresar al feed
            let noticiaToList = objects.createNotices(notice, element.origin, element.origin_icon, element.date, element.author, element.imgsrc, element.title, element.description, element.content, element.banner, element.isOutstanding, element.link)
            // añadimos el item a la lista de noticias
            this.dbcontent.push(noticiaToList)
          }
        }
        // Ordenamos la lista de noticias
        this.dbcontent.sort(function (a, b) {
          if (a.isOutstanding === true && b.isOutstanding === false) {
            return -1
          }
          if (a.isOutstanding === false && b.isOutstanding === true) {
            return 1
          }
          return 0
        })
        this.firebaseCharge = false
      })
      this.createColumns()
    }
  }
</script>
<style>
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
</style>