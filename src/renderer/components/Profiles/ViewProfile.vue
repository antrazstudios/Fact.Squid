<template>
  <div style="height: 100%; text-align: center;">
    <h1 style="opacity: 0.6; margin-top: 1%">Edicion del Perfil</h1>
    <Row type="flex" style="height: 100%" justify="center">
      <!-- Columna Izquierda -->
      <i-col class="col-height1" span="12">
        <Row type="flex" align="middle" justify="center" style="padding: 20px 60px; height: 100%">
          <i-col span="22">
            <!-- Imagen de perfil -->
            <img class="img-logo2" :src="actualProfile.imagenperfil" alt="">
            <!-- Informacion del perfil -->
            <h2>Nickname: {{ actualProfile.username }}</h2>
            <h3>Cargo: {{ actualProfile.cargo }}</h3>
            <h4>Oficina: {{ actualProfile.oficina }}</h4>
            <!-- Informacion Inicial -->
            <i-form ref="formInline" :model="actualProfile" style="margin-top: 5%;">
              <FormItem label="Primer nombre:" prop="primernombre" style="margin: 10px 0px 0px 0px">
                <Input type="text" placeholder="Ingrese su primer nombre" v-model="actualProfile.primernombre"/>
              </FormItem>
              <FormItem label="Segundo nombre:" prop="segundonombre" style="margin: 10px 0px 0px 0px">
                <Input type="text" placeholder="Ingrese su segundo nombre" v-model="actualProfile.segundonombre"/>
              </FormItem>
              <FormItem label="Primer apellido:" prop="primerapellido" style="margin: 10px 0px 0px 0px">
                <Input type="text" placeholder="Ingrese su primer apellido" v-model="actualProfile.primerapellido"/>
              </FormItem>
              <FormItem label="Segundo apellido:" prop="segundoapellido" style="margin: 10px 0px 0px 0px">
                <Input type="text" placeholder="Ingrese su segundo apellido" v-model="actualProfile.segundoapellido"/>
              </FormItem>
              <FormItem label="Fecha de nacimiento:" prop="fechanacimiento" style="margin: 10px 0px 0px 0px">
                <DatePicker type="date" placeholder="Seleccione su fecha de nacimiento" v-model="actualProfile.fechanacimiento"></DatePicker>
              </FormItem>
            </i-form>
            <h4 style="text-align: left; margin-top: 3%; margin-bottom: 1%;">Informacion de permisos: </h4>
            <!-- Informacion de permisos -->
            <Collapse v-if="actualProfile.permissions.length !== 0" style="text-align: left">
              <panel v-for="permission in actualProfile.permissions" :key="permission.id">
                {{ permission.name }}
                <p slot="content">{{ permission.description }}</p>
              </panel>
            </Collapse>
            <Card v-if="actualProfile.permissions.length === 0" style="text-align: left" dis-hover>
              <div style="text-align: center"><img src="../../assets/images/emoji-72x72/1f62e.png"/></div>
              <h2>No posees permisos para nada</h2>
              <p style="margin-top: 20px;">Esto puede deberse a varias cosas:</p>
              <p style="margin-top: 20px;">⌾ Que no tengas acceso a internet</p>
              <p>⌾ Que el administrador del sistema haya olvidado asignarte algun rol</p>
              <p>⌾ Que sea un usuario de prueba o estes en un servidor de pruebas</p>
              <h4 style="margin-top: 20px;">Todo esto puede ser posible, pero si el problema persiste, contacta el administrador del sistema.</h4>
            </Card>
            <!-- Boton de confirmacion -->
            <Button class="form-object" @click="updateDataProfile()">Guardar cambios</Button>
          </i-col>
        </Row>
      </i-col>
      <!-- Columna Derecha -->
      <i-col class="col-height1" span="12" style="padding: 20px 60px; height: 100%">
        <h2 style="margin-bottom: 15px">Informacion adicional:</h2>
        <!-- Informacion adicional -->
        <Collapse style="text-align: left" accordion>
          <!-- Informacion de entidad -->
          <panel name="1">
            INFORMACION DE ENTIDAD: {{ actualProfile.entidad.nombre }}
            <div slot="content">
              <div style="text-align: center">
                <img class="img-logo2" :src="actualProfile.entidad.logo" alt="">
              </div>
              <i-form :model="actualProfile.entidad">
                <FormItem label="Identificacion">
                  <Input type="text" v-model="actualProfile.entidad.identificacion" disabled/>
                </FormItem>
                <FormItem label="Nombre">
                  <Input type="text" v-model="actualProfile.entidad.nombre" disabled/>
                </FormItem>
                <FormItem label="Identificacion representante legal">
                  <Input type="text" v-model="actualProfile.entidad.representantecc" disabled/>
                </FormItem>
                <FormItem label="Representante legal">
                  <Input type="text" v-model="actualProfile.entidad.representantenombre" disabled/>
                </FormItem>
                <FormItem label="Direccion">
                  <Input type="text" v-model="actualProfile.entidad.direccion" disabled/>
                </FormItem>
                <FormItem label="Telefono">
                  <Input type="text" v-model="actualProfile.entidad.telefono" disabled/>
                </FormItem>
              </i-form>
            </div>
          </panel>
          <!-- Informacion de operador -->
          <panel name="2">
            INFORMACION DE OPERADOR: {{ actualProfile.operador.nombre }}
            <div slot="content">
              <div style="text-align: center">
                <img class="img-logo2" :src="actualProfile.operador.logo" alt="">
              </div>
              <i-form :model="actualProfile.operador">
                <FormItem label="Identificacion">
                  <Input type="text" v-model="actualProfile.operador.identificacion" disabled/>
                </FormItem>
                <FormItem label="Nombre">
                  <Input type="text" v-model="actualProfile.operador.nombre" disabled/>
                </FormItem>
                <FormItem label="Identificacion representante legal">
                  <Input type="text" v-model="actualProfile.operador.representantecc" disabled/>
                </FormItem>
                <FormItem label="Representante legal">
                  <Input type="text" v-model="actualProfile.operador.representantenombre" disabled/>
                </FormItem>
                <FormItem label="Direccion">
                  <Input type="text" v-model="actualProfile.operador.direccion" disabled/>
                </FormItem>
                <FormItem label="Telefono">
                  <Input type="text" v-model="actualProfile.operador.telefono" disabled/>
                </FormItem>
              </i-form>
            </div>
          </panel>
          <!-- Informacion de gestor -->
          <panel name="3">
            INFORMACION DE GESTOR:
            <div slot="content">
              <!-- En caso de existir informacion muestra tarjetas -->
              <Card v-if="actualProfile.gestor.length !== 0" v-for="gestor in actualProfile.gestor" :key="gestor.id" style="margin-bottom: 10px" dis-hover>
                <p>CODIGO DE GESTOR: {{ gestor.codigo }}</p>
                <img :src="gestor.firma">
              </Card>
              <!-- Si no existe informacion muestra un mensaje -->
              <div style="text-align: center;" v-if="actualProfile.gestor.length === 0">
                <img src="../../assets/images/emoji/1f61f.png" alt="">
                <p>No hay items de gestores para este usuario</p>
              </div>
            </div>
          </panel>
        </Collapse>
        <hr>
        <!-- Informacion de Preguntas de seguridad -->
        <h2 style="margin-bottom: 15px">Preguntas de Seguridad:</h2>
        <!-- En caso que no tenga asociada ninguna pregunta de seguridad -->
        <Card dis-hover v-if="securityQuestions.length === 0">
          <div style="text-align: left">
            <div style="text-align: center">
              <img src="../../assets/images/emoji-72x72/1f62d.png" style="display: inline">
              <img src="../../assets/images/emoji-72x72/1f510.png" style="display: inline">
            </div>
            <h2>No has especificado ninguna pregunta de seguridad</h2>
            <p>
              Si no especificas una pregunta de seguridad no nos ayudas a hacer mas segura tu cuenta, y aunque creas que esto no es importante, 
              piensa en que alguien puede entrar en tu cuenta y hacer cosas incorrectas en tu nombre (lo cual puede tener consecuencias en tu empresa), 
              ademas que te servira para reestablecer tu contraseña en caso de que la olvides.
            </p>
          </div>
        </Card>
        <!-- En caso de tener preguntas de seguridad asociadas -->
        <i-table v-if="securityQuestions.length !== 0" :columns="columnsQuestions" :data="securityQuestions" size="small" :stripe="false"></i-table>
        <!-- Formulario de ingreso de preguntas de seguridad -->
        <Card dis-hover v-if="selectableQuestions.length !== 0" style="text-align: left; margin-top: 10px">
          <h4>Agregar una nueva pregunta de seguridad</h4>
          <i-form ref="formSecurity" :model="actualQuestion" style="margin-top: 10px;">
            <FormItem label="Pregunta de seguridad:" prop="question" style="margin: 0px 0px 0px 0px" :error="rulesQuestion.question.result">
              <i-select v-model="actualQuestion.question">
                <i-option v-for="item in selectableQuestions" :key="item.id" :value="item.id.toString()">{{ item.question }}</i-option>
              </i-select>
            </FormItem>
            <FormItem label="Respuesta:" prop="response" style="margin: 15px 0px 0px 0px" :error="rulesQuestion.response.result">
              <Input type="text" placeholder="Ingrese la respuesta" v-model="actualQuestion.response"/>
            </FormItem>
          </i-form>
          <div style="text-align: right">
            <i-button style="margin-top: 10px" @click="createSecurityQuestion()">Confirmar</i-button>
          </div>
        </Card>
        <!-- En caso que no existan preguntas para agregar -->
        <div class="slides-end" v-if="selectableQuestions.length === 0">
          <img src="../../assets/images/emoji/1f44d.png" alt="">
          <p>No tienes mas preguntas por agregar</p>
        </div>
      </i-col>
    </Row>
    <p style="margin-top: 1%; margin-bottom: 5%; font-size: 11px">Cuando usas <a href="http://antrazstudios.com/factsquid" >Fact.Squid</a>, tu aceptas los <a href="http://www.antrazstudios.com/termsconditions">terminos y condiciones</a> & las <a href="http://www.antrazstudios.com/privacity">politicas de privacidad</a> de <a href="http://www.antrazstudios.com">AntrazStudios</a> </p>
  </div>
</template>
<script>
  export default {
    name: 'view-profile',
    data () {
      return {
        actualProfile: require('../../libs/objects').createUserToken(0, '', '', '', '', '', '', '', '', '', '', '', false, [], {}, {}, {}, []),
        rulesProfile: {
          primernombre: {
            result: '',
            rules: [
              {
                prop: 'primernombre',
                typevalidation: 'content-null',
                message: 'Debe especificar al menos un nombre',
                args: ''
              }
            ]
          },
          primerapellido: {
            result: '',
            rules: [
              {
                prop: 'primerapellido',
                typevalidation: 'content-null',
                message: 'Debe especificar al menor un apellido',
                args: ''
              }
            ]
          },
          fechanacimiento: {
            result: '',
            rules: [
              {
                prop: 'fechanacimiento',
                typevalidation: 'content-null',
                message: 'Debes especificar tu fecha de nacimiento',
                args: ''
              }
            ]
          }
        },
        rulesQuestion: {
          question: {
            result: '',
            rules: [
              {
                prop: 'question',
                typevalidation: 'content-null',
                message: 'Debe seleccionar al menos una pregunta para continuar',
                args: ''
              }
            ]
          },
          response: {
            result: '',
            rules: [
              {
                prop: 'response',
                typevalidation: 'content-null',
                message: 'No ha especificado una respuesta valida para la pregunta',
                args: ''
              }
            ]
          }
        },
        columnsQuestions: [],
        securityQuestions: [],
        selectableQuestions: [],
        actualQuestion: {
          question: '',
          response: ''
        }
      }
    },
    mounted () {
      this.createdColumns()
      this.verifyProfile()
      this.getSecurityQuestions()
    },
    methods: {
      createdColumns () {
        // Preguntas
        this.columnsQuestions.push({
          title: 'Pregunta',
          key: 'question'
        })
        // Accion de eliminar
        this.columnsQuestions.push({
          title: 'Accion',
          width: 90,
          align: 'center',
          render: (h, params) => {
            return h('i-button', {
              props: {
                type: 'error',
                size: 'small',
                shape: 'circle'
              },
              style: {
                marginRight: '5px'
              },
              on: {
                click: () => {
                  this.deleteSecurityQuestion(params.row)
                }
              }
            }, [
              h('Icon', {
                props: {
                  type: 'trash-a'
                }
              })
            ])
          }
        })
      },
      verifyProfile () {
        let settings = require('../../libs/settings')
        this.actualProfile = settings.getSesionProfile()
      },
      getSecurityQuestions () {
        // Obtener todas las preguntas de seguridad creadas por el usuario
        let storage = require('../../libs/storage')
        // llamamos al proceso
        this.$parent.handleSpinShow()
        storage._database_getSecurityQuestions(this.actualProfile.username).then((data) => {
          this.securityQuestions = data // asignamos los datos obtenidos
          // descargar las opciones disponibles de pregunta de seguridad
          storage._database_getAllSecurityQuestions().then((data2) => {
            this.selectableQuestions = []
            for (let i = 0; i < data2.length; i++) {
              const question = data2[i]
              let coincidense = 0
              for (let j = 0; j < this.securityQuestions.length; j++) {
                const response = this.securityQuestions[j]
                if (question.question === response.question) {
                  coincidense++
                }
              }
              if (coincidense === 0) {
                this.selectableQuestions.push(question)
              }
            }
            this.$parent.handleSpinHide()
          }).catch((err) => {
            this.$Message.error(err)
            this.$parent.handleSpinHide()
          })
        }).catch((err) => {
          this.$Message.error(err)
          this.$parent.handleSpinHide()
        })
      },
      createSecurityQuestion () {
        let rules = require('../../libs/rules')
        rules.validateRulesFormField(this.$refs['formSecurity'], this.rulesQuestion).then((rta) => {
          this.rulesQuestion = rta.rules
          if (rta.resultValidation === false) {
            this.$Message.error('Hay campos que necesitan revisarse para continuar')
          } else {
            this.$parent.handleSpinShow()
            let storage = require('../../libs/storage')
            storage._database_createSecurityQuestionsInUser({
              iduser: this.actualProfile.id,
              idquestion: this.actualQuestion.question,
              answer: this.actualQuestion.response
            }).then((rta) => {
              this.$Message.success(rta)
              this.actualQuestion.question = ''
              this.actualQuestion.response = ''
              this.$parent.handleSpinHide()
              this.getSecurityQuestions()
            }).catch((err) => {
              this.$Message.error(err)
              this.$parent.handleSpinHide()
            })
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      deleteSecurityQuestion (item) {
        this.$Modal.confirm({
          title: 'Confirmacion de eliminacion',
          content: '¿Esta seguro de querer eliminar esta pregunta de seguridad?',
          okText: 'Si, eliminar',
          cancelText: 'No',
          closable: false,
          onOk: () => {
            this.$parent.handleSpinShow()
            const storage = require('../../libs/storage')
            storage._database_deleteSecurityQuestionsInUser(item.id).then((rta) => {
              this.$Message.success('Registro eliminado')
              this.$parent.handleSpinHide()
              this.getSecurityQuestions()
            }).catch((err) => {
              this.$Message.error(err)
              this.$parent.handleSpinHide()
            })
          }
        })
      },
      updateDataProfile () {
        require('../../libs/rules').validateRulesFormField(this.$refs['formInline'], this.rulesProfile).then((rta) => {
          this.rulesProfile = rta.rules
          if (rta.resultValidation === false) {
            this.$Message.error('Hay campos que necesitan revisarse para continuar')
          } else {
            this.$parent.handleSpinShow('Escribiendo datos')
            let storage = require('../../libs/storage')
            storage._database_updateProfileBasicInformation({
              iduser: this.actualProfile.id,
              primernombre: this.actualProfile.primernombre,
              segundonombre: this.actualProfile.segundonombre,
              primerapellido: this.actualProfile.primerapellido,
              segundoapellido: this.actualProfile.segundoapellido,
              fechanacimiento: this.actualProfile.fechanacimiento
            }).then((rta) => {
              this.$Message.success(rta)
              this.$parent.handleSpinHide()
            }).catch((err) => {
              this.$Message.error(err)
            })
          }
        }).catch((err) => {
          console.log(err)
          this.$Message.error(err)
        })
      }
    }
  }
</script>
<style scoped>
  .img-logo {
    display: inline;
    width: 100px;
    opacity: 0.8;
    border-radius: 50%;
  }
  .img-logo2 {
    width: 200px;
    opacity: 0.8;
    border-radius: 50%;
  }
  .col-height1 {
    height: 100%!important;
  }
  .form-object{
    display: inline;
    margin-right: 3px;
    margin-top: 20px;
  }
    hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #ebe5e5;
    margin: 1em 0;
    padding: 0;
  }
  .slides-end{
    text-align: center;
    font-weight: bold;
    font-size: 14px;
    padding: 10px;
    margin-top: 20px;
    margin-bottom: 30px;
    margin-left: 10px;
    margin-right: 10px;
    background-color: rgba(219, 219, 219, 0.5);
    border-radius: 5px;
  }
</style>
