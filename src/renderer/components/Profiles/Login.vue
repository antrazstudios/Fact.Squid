<style scoped>
  .content{
    width: 100%;
    min-height: 100%;
    padding: 20px;
    background-image: url('~@/assets/images/BaseTheme_Background.png');
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
<template>
  <div class="content">
    <Row :gutter="32">
      <i-col span="14">
        <h1 class="layout-text-item">BillsDelivery</h1>
        <h2 class="layout-text-item">Sencillo y poderoso</h2>
        <p class="layout-text-item">BillsDelivery es un software especializado en el seguimiento de informacion hacia las cuentas medicas, abarcando completamente las etapas de trazabilidad de recepcion, respuesta, auditoria, envio y radicacion de cuentas medicas mas las fases posteriores. Para mas informacion puedes <a href="http://www.antrazstudios.com">leer la documentacion de BillsDelivery en antrazstudios.com</a>.</p>
        <p class="layout-text-item">Hemos cambiado con el fin de ser compatibles con los tres sistemas operativos lideres del mercado, Windows10, macOS y Linux. Disfruta de las nuevas mejoras.</p>
        <Alert class="layout-text-item" type="warning" show-icon>
          IMPORTANTE
          <Icon type="bug" slot="icon"/>
          <span slot="desc">
            Nota: Esta una version ALPHA, es decir es una version del software que aun se encuentra en desarrollo, en cualquier momento algunas funcionalidades pueden desaparecer, ser cambiadas, mejoradas, o implementadas en cualquier momento, tambien es importante tener en cuenta que puede contener BUGS y/o ERRORES, es importante que nos reporte estos errores o sus opiniones que para nosostros es muy importante.
          </span>
        </Alert>
        <div>
          <div id="divConexionChange" class="layout-text-item" style="display: none">
            <h4 style="display: inline">Conexion: </h4>
            <i-select v-model="connectionSelected" style="width: 250px" clearable>
              <i-option v-for="item in connectionsList" :value="item.name" :key="item.id">{{ item.name }}</i-option>
            </i-select>
            <i-button @click="changeViewConnection('divConexionActual', 'divConexionChange', 'yes')">OK</i-button>
          </div>
          <div id="divConexionActual" class="layout-text-item">
            <h4 style="display: inline">Conexion seleccionada: </h4>
            <label style="margin: 0px 20px 0px 0px">{{ connectionSelected }}</label>
            <i-button @click="changeViewConnection('divConexionChange', 'divConexionActual')">Cambiar conexion</i-button>
          </div>
          <Button @click="ConnectionsAssitantShow()">Asistente de Conexiones</Button>
        </div>
      </i-col>
      <i-col span="10">
        <Card>
          <div>
            <div class="layout-image form-object"></div>
            <h1 class="layout-text-item form-text">Inicio de sesion</h1>
            <h2 class="layout-text-item form-text">Ingrese sus credenciales</h2>
            <Form ref="formInline" :model="formInline" :rules="ruleInline" style="width: 300px" class="layout-text-item form-object">
              <FormItem prop="user" style="margin: 20px 0px 5px 0px">
                  <Input type="text" v-model="formInline.user" placeholder="Usuario o Identificacion">
                      <Icon type="ios-person-outline" slot="prepend"></Icon>
                  </Input>
              </FormItem>
              <FormItem prop="password" style="margin: 20px 0px 5px 0px">
                  <Input type="password" v-model="formInline.password" placeholder="Contraseña">
                      <Icon type="ios-locked-outline" slot="prepend"></Icon>
                  </Input>
              </FormItem>
              <FormItem style="margin: 25px 0px 5px 0px">
                  <Button class="form-object" style="margin: 0px auto 10px auto" type="primary" @click="handleSubmit('formInline')">Iniciar sesion</Button>
                  <Button class="form-object" @click="CancelLogin()">Cancelar</Button>
              </FormItem>
              <FormItem>
                  <Button class="form-object" type="text">He olvidado mi contraseña</Button>
              </FormItem>
            </Form>
        </div>
        </Card>
      </i-col>
    </Row>
  </div>
</template>
<script>
  export default {
    name: 'login',
    created: function () {
      // let Base = require('../../App.vue')
      this.$parent.$refs.menufix.$el.style.display = 'none'
      let settings = require('../../libs/settings.js') // Instaciacion de la libreria de configuracion
      let defaultConnName = settings.getContentFromLocalKey('defaultConn')
      let i = 0
      this.connectionsList = settings.getContentFromLocalKey('connections')
      for (i; i <= this.connectionsList.length - 1; i++) {
        if (this.connectionsList[i].id === defaultConnName) {
          this.connectionSelected = this.connectionsList[i].name
        }
      }
    },
    data () {
      return {
        connectionsList: [],
        formInline: {
          user: '',
          password: ''
        },
        ruleInline: {
          user: [
            { required: true, message: 'Este campo no puede ser nulo', trigger: 'blur' }
          ],
          password: [
            { required: true, message: 'Este campo no puede ser nulo', trigger: 'blur' },
            { type: 'string', min: 8, message: 'La contraseña no puede ser menos de 8 caracteres', trigger: 'blur' }
          ]
        },
        connectionSelected: ''
      }
    },
    methods: {
      handleSubmit (name) { // Metodo de testeo --pendiente a eliminar
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.$Message.success('Success!')
            this.$router.push('/')
            console.log(document.getElementById('menufix').style.visibility = 'visible')
          } else {
            this.$Message.error('Fail!')
          }
        })
      },
      changeViewConnection (idShow, idHide, changeDefault = 'none') { // Funcion que cambia la visualizacion de los controles de cambio de conexion
        document.getElementById(idShow).style.display = ''
        document.getElementById(idHide).style.display = 'none'
        if (changeDefault === 'yes') {
          this.changeDefaultConnection()
        }
      },
      changeDefaultConnection () {
        console.log(this.connectionSelected)
        for (let i = 0; i < this.connectionsList.length; i++) {
          console.log(this.connectionsList[i].name)
          if (this.connectionsList[i].name === this.connectionSelected) {
            require('../../libs/settings.js').addContentToLocalKey('defaultConn', this.connectionsList[i].id)
          }
        }
      },
      ConnectionsAssitantShow () {
        this.$router.push('/sql/connectionsassistant')
      },
      CancelLogin () {
        console.log(require('electron').remote.getCurrentWindow().close())
      }
    }
  }
</script>
