<style scoped>
  .content{
    width: 100%;
    padding: 0px 60px;
    background-image: url('~@/assets/images/BaseTheme_Background.png');
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
  }
  .layout-text-item{
    margin: 8px 0px;
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
          <div class="layout-text-item">
            <label>Conexion: </label>
            <i-select v-model="model" style="width: 250px" clearable>
              <i-option value="localhost">localhost</i-option>
              <i-option value="localhost">remote</i-option>
            </i-select>
            <i-button>OK</i-button>
          </div>
          <div class="layout-text-item">
            <label>Conexion Selecionada: </label>
            <i-button>Cambiar conexion</i-button>
          </div>
          <Button>Asistente de Conexiones</Button>
        </div>
      </i-col>
      <i-col span="10">
        <div></div>
        <h1>Inicio de sesion</h1>
        <h2>Ingrese sus credenciales de inicio de sesion</h2>
        <Form ref="formInline" :model="formInline" :rules="ruleInline" style="width: 250px">
          <FormItem prop="user">
              <Input type="text" v-model="formInline.user" placeholder="Usuario o Identificacion">
                  <Icon type="ios-person-outline" slot="prepend"></Icon>
              </Input>
          </FormItem>
          <FormItem prop="password">
              <Input type="password" v-model="formInline.password" placeholder="Contraseña">
                  <Icon type="ios-locked-outline" slot="prepend"></Icon>
              </Input>
          </FormItem>
          <FormItem>
              <Button type="primary" @click="handleSubmit('formInline')">Iniciar sesion</Button>
              <Button>Cancelar</Button>
          </FormItem>
          <FormItem>
              <Button type="text">He olvidado mi contraseña</Button>
          </FormItem>
        </Form>
      </i-col>
    </Row>
    <div>


    </div>
    <div>


    </div>
  </div>
</template>
<script>
  export default {
    data () {
      return {
        formInline: {
          user: '',
          password: ''
        },
        ruleInline: {
          user: [
            { required: true, message: 'Please fill in the user name', trigger: 'blur' }
          ],
          password: [
            { required: true, message: 'Please fill in the password', trigger: 'blur' },
            { type: 'string', min: 6, message: 'The password length cannot be less than 6 bits', trigger: 'blur' }
          ]
        },
        model: []
      }
    },
    methods: {
      handleSubmit (name) {
        this.$refs[name].validate((valid) => {
          if (valid) {
            this.$Message.success('Success!')
          } else {
            this.$Message.error('Fail!')
          }
        })
      }
    }
  }
</script>
