<template lang="html">
  <div class="content">
    <!-- Area de accesos directos -->
    <i-col span="4">
      <Card class="slides">
        <h3>Accesos Directos</h3>
        <hr/>
        <Row v-if="list_shortcuts.length !== 0 || list_shortcuts.length !== null">
          <ButtonGroup vertical style="width: 100%;">
            <i-button v-for="shortcut in list_shortcuts" :key="shortcut.key" type="ghost" style="text-align: left;">
              <Icon v-if="shortcut.icon_type !== 'profileimage'" :type="shortcut.icon_type"/>
              <img v-if="shortcut.icon_type === 'profileimage'" :src="$parent.actualProfile.imagenperfil" style="width: 12px;"/>
              <label>{{shortcut.title}}</label>
            </i-button>
          </ButtonGroup>
        </Row>
        <Row v-else-if="list_shortcuts.length === 0 || list_shortcuts.length === null">
        </Row>
      </Card>
    </i-col>
    <!-- Area del Feed -->
    <i-col span="14">
      <!-- En caso que existan noticias en el feed -->
      <div v-if="list_notice.length !== 0 || list_notice.length !== null">
        <Row v-for="notice in list_notice" :key="notice.key">
          <Card class="slides">
            <Row>
              <i-col span="2">
                <Avatar :src="notice.imgsrc"/>
              </i-col>
              <i-col span="8">
                <h4>{{notice.author}}</h4>
                <h4>{{notice.date}}</h4>
              </i-col>
              <i-col span="14">
                <Row>
                  <div class="slides-origin">
                    <label class="slides-text--origin">{{notice.origin}}</label>
                    <Icon class="slides-text--origin" :type="notice.origin_icon"></Icon>
                    <div v-if="notice.isOutstanding === true" class="slides-star slides-origin">
                      <Icon type="android-star" color="white"></Icon>
                    </div>
                    <i-button v-if="notice.link !== null" type="ghost" style="margin: 5px;" @click="clickMoreInfo(notice.link)">
                      <Icon type="link"></Icon>
                       Quiero saber mas
                    </i-button>
                  </div>
                </Row>
              </i-col>
            </Row>
            <hr />
            <Row>
              <h1 class="slides-text--title">{{notice.title}}</h1>
              <p class="slides-text--content">{{notice.description}}</p>
              <img class="slides-img" :src="notice.banner"/>
              <p class="slides-text--description">{{notice.content}}</p>
            </Row>
          </Card>
        </Row>
        <Row>
          <div class="slides-end">
            Final de la lista
          </div>
        </Row>
      </div>
      <!-- En caso de que NO existan noticias en el feed -->
      <div v-if="list_notice.length === 0 || list_notice.length === null">
        <Card class="slides slides-notitems--text">
          <img src=".././assets/images/emoji-72x72/1f61e.png"/>
          <h2>No existen items para mostrar en tu feed</h2>
          <p style="margin-top: 20px;">Esto puede deberse a varias cosas:</p>
          <p style="margin-top: 20px;">⌾ Que no tengas acceso a internet</p>
          <p>⌾ Que no se haya publicado ningun item desde el servidor para que los demas usuarios puedan verlos</p>
          <p>⌾ Que seas muy productivo y no exista ningun necesidad de informarte nada, porque ya lo sabes todo</p>
          <h4 style="margin-top: 20px;">Todo esto puede ser posible, pero si el problema persiste, contacta el administrador del sistema.</h4>
        </Card>
      </div>
    </i-col>
    <!-- Area de notificacion -->
    <i-col span="6">
      <Card class="slides">
        <h3>Notificaciones</h3>
        <hr/>
      </Card>
    </i-col>
    <BackTop>
      <div class="top">
        <Icon type="arrow-up-b"></Icon>
      </div>
    </BackTop>
  </div>
</template>

<script>
  export default {
    name: 'landing-page',
    data () {
      return {
        value1: 0,
        value2: 0,
        height: 677,
        list_notice: [
          {
            origin: 'antrazstudios.com',
            origin_icon: 'ios-world',
            date: '2017-12-08',
            author: 'AntrazStudios',
            imgsrc: 'https://pbs.twimg.com/profile_images/709902706698264576/YpX5dvPY.jpg',
            title: 'Bienvenido al renovado BillsDelivery, el mismo aunque mucho mas poderoso',
            description: 'Gracias a las nuevas tecnologias desarrolladas en AntrazStudios, BillsDelivery es mas potente, eficiente y rapido. Y esta preparado para las innovaciones futuras. Otra novedad es que mejora es que mejora las funcionalidades y modulos que usas todos los dias. En sintesis, es BillsDelivery en su maximo nivel.',
            content: 'Estamos muy emocionados con que utilices esta hermosa version de BillsDelivery, aunque es importante decir que se encuentra en version BETA, y que algunas funciones no se encuentran activas del todo, lo que quiere decir que es posible que te encuentres con algunos problemas menores, pero no sera nada que no solucionemos en el menos tiempo posible.',
            banner: 'https://www.chu.cam.ac.uk/media/assets/35/1de50922f08b3aafff073ecb0dcf052e3dc303.jpg',
            isOutstanding: true,
            link: 'http://www.antrazstudios.com'
          },
          {
            origin: 'CootrasmarCTA, Bucaramanga',
            origin_icon: 'ios-location',
            date: '2018-01-01',
            author: 'CootrasmarCTA',
            imgsrc: 'http://www.cootrasmarcta.com/portals/12/imagenes/WebAmg/NuestrosClientes1.jpg',
            title: 'Los mejores deseos para este 2018',
            description: 'En CootrasmarCTA queremos desearte un feliz 2018, esperamos que sigas compartiendo nuestras experiencias profesionales con nosotros, y que todos tus deseos para este nuevo año que comienza se hagan realidad.',
            content: '',
            banner: 'https://www.theofficegroup.co.uk/wp-content/uploads/2016/09/Template_Single_Image_borough_3.jpg',
            isOutstanding: false,
            link: null
          }
        ],
        list_shortcuts: [
          {
            title: 'Mi perfil',
            goto: '/login',
            icon_type: 'profileimage',
            icon_color: null,
            isDeletable: false
          },
          {
            title: 'Crear Documento',
            goto: '/Settings/index',
            icon_type: 'plus-round',
            icon_color: '#2ecc71',
            isDeletable: true
          }
        ]
      }
    },
    mounted () {
      // do something after mounting vue instance
      console.log(this.$parent.actualProfile.imagenperfil)
    },
    methods: {
      clickMoreInfo (link) {
        const {shell} = require('electron')
        shell.openExternal(link)
      }
    }
  }
</script>

<style lang="css">
  .content{
    font-family: "Helvetica Neue",Arial;
    width: 100%;
    min-height: 100%;
    padding: 0px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
  }
  .slides-text--title{
    margin-bottom: 10px;
  }
  .slides-text--content{
    text-align: justify;
    margin-bottom: 10px;
  }
  .slides-text--description{
    text-align: justify;
    margin-top: 10px;
    margin-bottom: 5px;
    font-size: 12px;
  }
  .slides-text--origin{
    color: rgba(0, 0, 0, 0.25);
    font-size: 12px;
    margin-top: 10px;
  }
  .slides-origin{
    float: right;
  }
  .slides-img{
    width: 100%;
    border-radius: 10px;
  }
  .slides-notitems--text{
    color: rgba(0, 0, 0, 0.49);
    text-align: center;
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
  .slides-star{
    text-align: center;
    padding: 2px;
    margin: 5px;
    margin-top: 8px;
    background-color: rgb(240, 203, 44);
    border-radius: 5px;
    width: 30px;
  }
  .slides{
    background-color: rgb(255, 255, 255);
    padding-left: 4px;
    padding-right: 4px;
    padding-top: 8px;
    padding-bottom: 8px;
    margin-top: 10px;
    margin-bottom: 10px;
    margin-left: 10px;
    margin-right: 10px;
  }
  hr {
    display: block;
    height: 1px;
    border: 0;
    border-top: 1px solid #ebe5e5;
    margin: 1em 0;
    padding: 0;
  }
  .top{
    padding: 2.5px;
    background: rgba(84, 84, 84, 0.7);
    color: #fff;
    text-align: center;
    border-radius: 8px;
    }
</style>
