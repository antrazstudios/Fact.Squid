<template>
  <div class="content" >
    <Row type="flex" style="height: 100%" justify="center" align="middle">
      <i-col class="col-height1" span="12">
        <Row type="flex" align="middle" justify="center" style="text-align: left; padding: 60px 60px; height: 100%">
          <i-col span="22">
            <img class="img-logo2" src="../../assets/images/factsquid_iconWhite.png" alt="">
            <h1 style="margin-top: 5%">Fact.Squid hecho para ti</h1>
            <h1>hecho con cariño.</h1>
            <h3>Bienvenido(a) nuevamente, Porfavor inicia sesion para continuar</h3>
            <i-form ref="formInline" :model="formInline" :rules="ruleInline" style="margin-top: 10%;">
              <FormItem prop="user">
                <Input type="text" v-model="formInline.user" placeholder="Usuario o Identificacion"/>
              </FormItem>
              <FormItem prop="password" style="margin: 20px 0px 5px 0px">
                  <Input type="password" v-model="formInline.password" placeholder="Contraseña"/>
              </FormItem>
              <FormItem style="margin: 25px 0px 5px 0px">
                <Button class="form-object" type="primary" @click="handleSubmit('formInline')">Iniciar sesion</Button>
                <Button class="form-object" @click="CancelLogin()">Cancelar</Button>
                <Button class="form-object" type="text" @click="handleSubmit('formInline')">Recuperar contraseña</Button>
              </FormItem>
            </i-form>
            <p style="margin-top: 10%; font-size: 11px">Cuando usas <a href="http://antrazstudios.com/factsquid" >Fact.Squid</a>, tu aceptas los <a href="http://www.antrazstudios.com/termsconditions">terminos y condiciones</a> & las <a href="http://www.antrazstudios.com/privacity">politicas de privacidad</a> de <a href="http://www.antrazstudios.com">AntrazStudios</a> </p>
          </i-col>
        </Row>
      </i-col>
      <i-col class="col-height2" span="12">
        <Row type="flex" align="middle" justify="center" style="padding: 60px 60px; height: 100%">
        <i-col span="24">
          <img class="img-logo" src="../../assets/images/factsquid_iconColor.png" alt="">
          <i-button>Visitar sitio web de Fact.squid</i-button>
        </i-col>
        </Row>
      </i-col>
    </Row>
  </div>
</template>

<script>
  export default {
    name: 'login',
    created: function () {
      this.$parent.showTitleBar(false)
    },
    mounted () {
      this.heightMax = this.$parent.electronRemote.getCurrentWindow().getSize()[1]
    },
    data () {
      return {
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
        heightMax: 877
      }
    },
    methods: {
      handleSubmit (name) { // Metodo de verificacion de usuario
        // Mensaje para mostrarle al usuario
        let message = 'Esperando respuesta del servidor'
        // verificar si esta en modo desarrollador y asignar credenciales como tal
        if (this.$parent.developerMode === true) {
          this.formInline.user = 'ROOT'
          this.formInline.password = '1234567890'
          message = message + ', en modo desarrollador'
        }
        // Verificacion si esta validado el formulario de inicio de sesion
        this.$refs[name].validate((valid) => {
          // Si es valido el formulario
          if (valid) {
            this.$parent.handleSpinShow(message)
            require('../../libs/storage.js')._database_usersLoginWithNicknameAndPass({
              username: this.formInline.user,
              pass: this.formInline.password
            }).then((rta) => { // En caso de tener una respuesta positiva ejecuta el inicio de sesion
              if (rta.userConsult !== undefined) {
                // crear una sesion nueva
                require('../../libs/settings.js').createSesion(rta.userConsult, this.$parent.connectionSelected)
                // Habilitar boton de cerrado
                this.$parent.windowButtonCloseState = true
                // Mostrar el TitleBar
                this.$parent.showTitleBar(true)
                // Redirigir al inicio
                this.$parent.changePath('/')
                // Verificar la sesion
                this.$parent.verifySesion()
                // Ajustar la ventana
                this.$parent.electronRemote.getCurrentWindow().setMaximizable(true)
                this.$parent.electronRemote.getCurrentWindow().setResizable(true)
                this.$parent.electronRemote.getCurrentWindow().maximize()
              }
              this.$Message.success({
                content: 'Inicio de sesion exitoso',
                duration: 6
              })
              this.$parent.handleSpinHide()
            }).catch((rta) => { // En caso de que ocurra un error, enseña la informacion al usuario
              this.$Message.error({
                content: rta,
                duration: 8
              })
              this.$parent.handleSpinHide()
            })
          } else {
            this.$Message.error('Verifique el formulario! existen campos sin digitar adecuadamente')
          }
        })
      },
      CancelLogin () {
        require('electron').remote.getCurrentWindow().close()
      }
    }
  }
</script>

<style scoped>
  .content {
    text-align: center;
    height: max-content;
    width: 100%;
    background-image: url('../../assets/images/background-image-login.png');
    background-repeat: repeat;
  }
  .img-logo {
    width: 80%;
  }
  .img-logo2 {
    width: 50px;
    opacity: 0.3;
  }
  .col-height1 {
    height: 100%!important;
    background-color: whitesmoke!important;
  }
  .col-height2 {
    height: 100%!important;
  }
  .form-object{
    display: inline;
    margin-right: 3px;
    margin-top: 8px;
  }
</style>
