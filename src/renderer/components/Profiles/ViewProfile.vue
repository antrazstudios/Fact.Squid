<template>
  <div style="height: 100%; text-align: center;">
    <h1 style="opacity: 0.6; margin-top: 1%">Edicion del Perfil</h1>
    <Row type="flex" style="height: 100%" justify="center" align="middle">
      <i-col class="col-height1" span="12">
        <Row type="flex" align="middle" justify="center" style="padding: 20px 60px; height: 100%">
          <i-col span="22">
            <img class="img-logo2" :src="actualProfile.imagenperfil" alt="">
            <h2>Nickname: {{ actualProfile.username }}</h2>
            <h3>Cargo: {{ actualProfile.cargo }}</h3>
            <h4>Oficina: {{ actualProfile.oficina }}</h4>
            <i-form ref="formInline" :model="actualProfile" :rules="rulesProfile" style="margin-top: 5%;">
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
          </i-col>
        </Row>
      </i-col>
      <i-col class="col-height1" span="12">
        <h2>Informacion adicional:</h2>
        <h3>Entidad:</h3>
        <img class="img-logo2" :src="actualProfile.entidad.logo" alt="">
        <Collapse>
          <panel>
            {{ actualProfile.entidad.nombre }}
          </panel>
          <div slot="content">
            
          </div>
        </Collapse>
      </i-col>
    </Row>
    <Button class="form-object" type="primary" @click="executeChangePass()">Guardar cambios</Button>
    <Button class="form-object" @click="cancelChangePass()" >Cancelar</Button>
    <p style="margin-top: 1%; margin-bottom: 5%; font-size: 11px">Cuando usas <a href="http://antrazstudios.com/factsquid" >Fact.Squid</a>, tu aceptas los <a href="http://www.antrazstudios.com/termsconditions">terminos y condiciones</a> & las <a href="http://www.antrazstudios.com/privacity">politicas de privacidad</a> de <a href="http://www.antrazstudios.com">AntrazStudios</a> </p>
  </div>
</template>
<script>
  export default {
    name: 'view-profile',
    data () {
      return {
        actualProfile: {},
        rulesProfile: {}
      }
    },
    mounted () {
      this.verifyProfile()
    },
    methods: {
      verifyProfile () {
        let settings = require('../../libs/settings')
        this.actualProfile = settings.getSesionProfile()
        console.log(this.actualProfile)
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
    margin-top: 5px;
  }
</style>
