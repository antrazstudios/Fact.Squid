<template>
  <Row type="flex" style="height: 100%" justify="center" align="middle">
    <i-col class="col-height1" span="12">
        <Row type="flex" align="middle" justify="center" style="text-align: left; padding: 60px 60px; height: 100%">
          <i-col span="22" style="text-align: center">
            <img class="img-logo2" src="../../assets/images/factsquid_iconWhite.png" alt="">
            <h1 style="margin-top:3%">Cambio o recuperacion de contraseña</h1>
            <h3></h3>
            <i-form ref="formInline" :model="formData" :rules="rulesData" style="margin-top: 10%;">
              <FormItem v-if="type === 'withpassword'" prop="passwordActual" :error="rulesData.passwordActual.result">
                <Input type="password" v-model="formData.passwordActual" placeholder="Ingrese la contraseña actual"/>
              </FormItem>
              <FormItem prop="passwordNew1" style="margin: 15px 0px 5px 0px" :error="rulesData.passwordNew1.result">
                <Input type="password" v-model="formData.passwordNew1" placeholder="Ingrese la nueva contraseña"/>
              </FormItem>
              <FormItem prop="passwordNew2" style="margin: 20px 0px 5px 0px" :error="rulesData.passwordNew2.result">
                  <Input type="password" v-model="formData.passwordNew2" placeholder="Confirme la nueva contraseña"/>
              </FormItem>
              <FormItem style="margin: 25px 0px 5px 0px">
                <Button class="form-object" type="primary" @click="executeChangePass()">Confirmar cambio</Button>
                <Button class="form-object" @click="cancelChangePass()" >Cancelar</Button>
              </FormItem>
            </i-form>
            <p style="margin-top: 10%; font-size: 11px">Cuando usas <a href="http://antrazstudios.com/factsquid" >Fact.Squid</a>, tu aceptas los <a href="http://www.antrazstudios.com/termsconditions">terminos y condiciones</a> & las <a href="http://www.antrazstudios.com/privacity">politicas de privacidad</a> de <a href="http://www.antrazstudios.com">AntrazStudios</a> </p>
          </i-col>
        </Row>
      </i-col>
  </Row>
</template>
<script>
  export default {
    name: 'changepassword',
    data () {
      return {
        type: 'withpassword',
        nickname: '',
        formData: {
          passwordActual: '',
          passwordNew1: '',
          passwordNew2: ''
        },
        rulesData: {
          passwordActual: { result: '' },
          passwordNew1: { result: '' },
          passwordNew2: { result: '' }
        }
      }
    },
    mounted () {
      this.getUserPass()
    },
    methods: {
      getUserPass () {
        // obtenemos la informacion enviada por el query
        this.type = this.$route.query.type
        this.nickname = this.$route.query.username
      },
      executeChangePass () {
        // crear reglas de validacion
        this.createdRules()
        // Se realiza la validacion del formulario
        require('../../libs/rules').validateRulesFormField(this.$refs['formInline'], this.rulesData).then((rta) => {
          console.log(rta)
          this.rulesData = rta.rules
          if (rta.resultValidation === true) {
            this.$parent.handleSpinShow('Verificando datos y cambiando contraseña')
            require('../../libs/storage.js')._database_changePassword({
              comparation: this.type === 'withpassword' ? this.formData.passwordActual : 'n/a',
              nickname: this.nickname,
              newpassword: this.formData.passwordNew1
            }).then((rta) => {
              this.$parent.handleSpinHide()
              if (rta.type === 'error') {
                this.$Message.error('Respuesta del servidor: ==> ' + rta.message)
              } else {
                this.$Message.success('La contraseña ha sido actualizada')
                this.cancelChangePass()
              }
            }).catch((err) => {
              this.$Message.error('Ha ocurrido un error: ' + err)
            })
          } else {
            this.$Message.error('Tiene algunos campos por revisar en el formulario')
          }
        }).catch((err) => {
          this.$Message.error(err)
        })
      },
      cancelChangePass () {
        this.$parent.returnPath()
      },
      createdRules () {
        if (this.type === 'withpassword') {
          this.rulesData = {
            passwordActual: {
              result: '',
              rules: [
                {
                  prop: 'passwordActual',
                  typevalidation: 'content-null',
                  message: 'Es necesario especificar la contraseña actual',
                  args: ''
                }
              ]
            },
            passwordNew1: {
              result: '',
              rules: [
                {
                  prop: 'passwordNew1',
                  typevalidation: 'content-null',
                  message: 'Es necesario especificar la nueva contraseña',
                  args: ''
                }
              ]
            },
            passwordNew2: {
              result: '',
              rules: [
                {
                  prop: 'passwordNew2',
                  typevalidation: 'content-null',
                  message: 'Es necesario confirmar la nueva contraseña',
                  args: ''
                },
                {
                  prop: 'passwordNew2',
                  typevalidation: 'comparation',
                  message: 'Las contraseñas nuevas no coinciden',
                  args: {
                    valc: this.formData.passwordNew1,
                    type: 'equals'
                  }
                }
              ]
            }
          }
        } else {
          this.rulesData = {
            passwordNew1: {
              result: '',
              rules: [
                {
                  prop: 'passwordNew1',
                  typevalidation: 'content-null',
                  message: 'Es necesario especificar la nueva contraseña',
                  args: ''
                }
              ]
            },
            passwordNew2: {
              result: '',
              rules: [
                {
                  prop: 'passwordNew2',
                  typevalidation: 'content-null',
                  message: 'Es necesario confirmar la nueva contraseña',
                  args: ''
                },
                {
                  prop: 'passwordNew2',
                  typevalidation: 'comparation',
                  message: 'Las contraseñas nuevas no coinciden',
                  args: {
                    comparation: {
                      valc: this.formData.passwordNew1,
                      type: 'equals'
                    }
                  }
                }
              ]
            }
          }
        }
      }
    }
  }
</script>
<style scoped>
  .img-logo2 {
    width: 50px;
    opacity: 0.3;
  }
  .col-height1 {
    height: 100%!important;
  }
  .form-object{
    display: inline;
    margin-right: 3px;
    margin-top: 8px;
  }
</style>
