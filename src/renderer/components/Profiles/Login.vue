<template>
  <div class="content" >
    <Row type="flex" style="height: 100%" justify="center" align="middle">
      <i-col class="col-height1" span="12">
        <Row type="flex" align="middle" justify="center" style="text-align: left; padding: 60px 60px; height: 100%">
          <i-col span="22">
            <img class="img-logo2" src="../../assets/images/factsquid_iconWhite.png" alt="">
            <h1 style="margin-top:3%">Fact.Squid hecho para ti</h1>
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
                <Button class="form-object" type="primary" @click="SubmitLogin('formInline')">Iniciar sesion</Button>
                <Button class="form-object" @click="CancelLogin()">Cancelar</Button>
                <Button class="form-object" type="text" @click="RecoveryPassword('formInline')">Recuperar contraseña</Button>
              </FormItem>
            </i-form>
            <p style="margin-top: 10%; font-size: 11px">Cuando usas <a href="http://antrazstudios.com/factsquid" >Fact.Squid</a>, tu aceptas los <a href="http://www.antrazstudios.com/termsconditions">terminos y condiciones</a> & las <a href="http://www.antrazstudios.com/privacity">politicas de privacidad</a> de <a href="http://www.antrazstudios.com">AntrazStudios</a> </p>
          </i-col>
        </Row>
      </i-col>
      <i-col class="col-height2" span="12">
        <Row type="flex" align="middle" justify="center" style="padding: 60px 60px; height: 100%">
          <i-col span="24">
            <Carousel autoplay :autoplay-speed="10000" dots="none">
              <CarouselItem v-for="item in carouselItems" :key="item.id">
                <div class="carousel-item-theme">
                  <img style="width: 280px" :src="item.imgPATH">
                  <h2>{{ item.title }}</h2>
                  <span style="text-align: justify!important;">{{ item.message }}</span>
                </div>
              </CarouselItem>
            </Carousel>
          </i-col>
        </Row>
      </i-col>
    </Row>
    <Modal v-model="showSecurityQuestions" :ok-text="'Enviar respuesta'" :cancel-text="'CANCELAR'" :title="'RESPONDE UNA DE LAS PREGUNTAS DE SEGURIDAD'" @on-ok="GoToRecoveryPassword()" :mask-closable="false">
      <div>
        <h4 style="display: inline">Pregunta: </h4>
        <i-select v-model="securitySelected" clereable>
          <i-option v-for="item in securityQuestions" :value="item.answer" :key="item.id">{{ item.question }}</i-option>
        </i-select>
        <h4 style="display: inline; margin-top: 10px">Respuesta: </h4>
        <i-input v-model="securityResponse"></i-input>
      </div>
    </Modal>
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
        ruleInline: {},
        carouselItems: [
          {
            id: 0,
            title: '¿Mi informacion esta a salvo?',
            message: 'Por supuesto, puedes consultar nuestras politicas de seguridad en cualquier momento en: http://www.antrazstudios.com/privacy y saber claramente como manipulamos la informacion que te pertenece.',
            imgPATH: '/static/images/safebox.png'
          },
          {
            id: 1,
            title: '¡Somos pioneros en tracking medico!',
            message: 'Somos el primer software colombiano que realmente hace tracking de una cuenta medica como debe ser. Tenemos muchisisisisimas ideas para seguir implementando funciones a Fact.Squid.',
            imgPATH: '/static/images/goal.png'
          },
          {
            id: 2,
            title: 'Notificaciones en Tiempo real',
            message: 'Ahora las notificaciones del sistema, funcionan en tiempo real, cada suceso que ocurra con tus documentos te sera notificado directamente a ti de inmediato, tanto aqui como en nuestra aplicacion movil',
            imgPATH: '/static/images/megaphone.png'
          },
          {
            id: 3,
            title: '¿Aplicacion movil de Fact.Squid?',
            message: 'Si, estamos ya en pruebas de una aplicacion movil de Fact.Squid para que tengas acceso a tus documentos y prueba de entrega en cualquier parte, tan solo con un click.',
            imgPATH: '/static/images/android.png'
          }
        ],
        heightMax: 877,
        securityQuestions: [],
        securitySelected: '',
        securityResponse: '',
        showSecurityQuestions: false
      }
    },
    methods: {
      SubmitLogin (name) { // Metodo de verificacion de usuario
        // Creacion de las normas de validacion
        this.createdRules()
        // Mensaje para mostrarle al usuario
        let message = 'Esperando respuesta del servidor'
        // verificar si esta en modo desarrollador y asignar credenciales como tal
        if (this.$parent.developerMode === true) {
          if (this.formInline.user === '' & this.formInline.password === '') {
            this.formInline.user = 'ROOT'
            this.formInline.password = '1234567890'
          }
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
                this.$parent.handleSpinShow()
                // crear una sesion nueva
                require('../../libs/settings.js').createSesion(rta.userConsult, this.$parent.connectionSelected)
                // Redirigir al inicio
                this.$parent.changePath('/')
                // Habilitar boton de cerrado
                this.$parent.windowButtonCloseState = true
                // Mostrar el TitleBar
                this.$parent.showTitleBar(true)
                // Ajustar la ventana
                this.$parent.electronRemote.getCurrentWindow().setMaximizable(true)
                this.$parent.electronRemote.getCurrentWindow().setResizable(true)
                this.$parent.electronRemote.getCurrentWindow().maximize()
                // Verificar la sesion
                this.$parent.verifySesion()
              } else {
                this.$parent.handleSpinHide()
              }
              this.$Message.success({
                content: 'Inicio de sesion exitoso',
                duration: 6
              })
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
      },
      RecoveryPassword (name) {
        // Se generan las reglas
        this.createdRules('passwordchange')
        // Verficiacion si esta validado el formulario de inicio de sesion
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.$parent.handleSpinShow('Estableciendo su informacion segura')
            require('../../libs/storage.js')._database_getSecurityQuestions(this.formInline.user).then((rta) => { // En caso de tener una respuesta positiva ejecuta el inicio de sesion
              // enviamos las preguntas y respuestas a la propiedad indicada
              this.securityQuestions = rta
              console.log(this.securityQuestions)
              this.$parent.handleSpinHide()
              // evualuamos la cantidad de preguntas existentes.
              if (this.securityQuestions.length === 0) {
                this.$Message.error('No es posible realizar una recuperacion de cuenta, si no ha creado preguntas de seguridad')
              } else {
                this.showSecurityQuestions = true
              }
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
      GoToRecoveryPassword () {
        this.securityResponse = this.securityResponse.toUpperCase()
        if (this.securityResponse === this.securitySelected) {
          this.$Message.warning('Por favor especifique una nueva contraseña')
          this.$parent.changePath('changepassword', {
            username: this.formInline.user,
            type: 'direct'
          })
        } else {
          this.$Message.error('La respuesta no coincide con la almacenada en el servidor')
        }
      },
      createdRules (type = 'login') { // Tambien recibe 'passwordchange'
        if (type === 'passwordchange') {
          this.ruleInline = {
            user: [
              { required: true, message: 'No ha especificado un usuario.', trigger: 'blur' }
            ]
          }
        } else {
          this.ruleInline = {
            user: [
              { required: true, message: 'No ha especificado un usuario.', trigger: 'blur' }
            ],
            password: [
              { required: true, message: 'Es necesaria una contraseña para continuar', trigger: 'blur' },
              { type: 'string', min: 8, message: 'La contraseña no puede ser menos de 8 caracteres', trigger: 'blur' }
            ]
          }
        }
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
  .carousel-item-theme {
    background-color: white;
    opacity: 0.9;
    border-radius: 8px;
    padding: 20px;
    border: 1px solid #c1f1e9;
    box-shadow: 0.5px 0.5px 1px #c1f1e9;
    height: 490px;
  }
</style>
