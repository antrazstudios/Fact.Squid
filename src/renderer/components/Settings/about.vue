<template>
  <div class="content">
    <Row v-if="source !== ''">
      <i-col span="5">
        <div class="menu">
          <Menu theme="light" :active-name="activeName" style="z-index: 0">
            <MenuGroup v-for="group in listContents" :key="group.key" :title="group.title">
              <MenuItem style="padding: 0" v-for="item in group.contenidos" :key="item.key" :name="item.id">
                <i-button style="width: 100%; text-align: left" type="text" @click="loadMdWithItem(item)">{{item.title}}</i-button>
              </MenuItem>
            </MenuGroup>
          </Menu>
        </div>
      </i-col>
      <i-col span="19">
        <Card class="markdown-viewer" dis-hover>
          <vue-markdown style="height: 100%; margin: 10px;" :source="source"></vue-markdown>
        </Card>
      </i-col>
    </Row>
    <Row v-if="source === ''">
      <div style="height: 100%; ">
        <h1 style="margin-top: 10px; margin-bottom: 5px;">No es posible encontrar el contenido de ayuda de Fact.Squid</h1>
        <p style="center; margin-bottom: 15px">Para poder utilizar el contenido de ayuda de Fact.Squid es necesario descargarlo, solo es cuestion de hacer click en el boton de descargar y esperar un poco</p>
        <i-progress :percent="progressDownload" :status="progressStatus"></i-progress>
        <i-button @click="downloadDocumentation()">REINTENTAR</i-button>
      </div>
    </Row>
    <BackTop>
      <div class="top">
        <Icon type="arrow-up-b"></Icon>
      </div>
    </BackTop>
  </div>
</template>
<script>
  import VueMarkdown from 'vue-markdown'
  export default {
    name: 'settings-about',
    data: () => ({
      progressDownload: 0,
      progressStatus: 'normal',
      source: '',
      activeName: '1',
      listContents: [
        {
          type: 'group',
          title: 'Informacion basica',
          contenidos: [
            {
              id: '1',
              type: 'item',
              title: 'Acerca de FactSquid',
              nameFile: 'README.md'
            },
            {
              id: '2',
              type: 'item',
              title: 'Actualizaciones',
              nameFile: 'updates.md'
            }
          ]
        }
      ]
    }),
    components: {
      VueMarkdown
    },
    mounted () {
      // Verificacion de la existencia del contenido de documentacion
      require('../../libs/settings.js').getDocumentsExist((rta) => {
        if (rta === false) {
          this.downloadDocumentation()
        } else {
          this.loadMdWithId(this.$route.params.id)
        }
      })
    },
    methods: {
      loadMdWithItem (item) {
        if (item !== undefined) {
          let modalPath = require('path').join(require('../../libs/settings.js').getDocumentsPath(), 'packages-documentation/', item.nameFile)
          this.source = require('fs').readFileSync(modalPath, 'utf8')
        }
      },
      loadMdWithId (id) {
        for (let i = 0; i < this.listContents.length; i++) {
          for (let j = 0; j < this.listContents[i].contenidos.length; j++) {
            if (this.listContents[i].contenidos[j].id === id) {
              this.loadMdWithItem(this.listContents[i].contenidos[j])
              this.activeName = id
            }
          }
        }
      },
      downloadDocumentation () {
        const packager = require('../../libs/packager.js')
        const pathDownload = require('../../libs/settings.js').getDocumentsPath()
        this.progressStatus = 'active'
        packager.downloadFunction({
          remoteuri: 'http://antrazstudios.com/billsdelivery/assetsdoc/packages-documentation.zip',
          localuri: pathDownload + 'packages-documentation.zip',
          onProgress: (getSize, totalSize) => {
            this.progressDownload = Math.round(((getSize * 100) / totalSize) - 10)
            this.$forceUpdate()
          }
        }).then((rta) => {
          this.$Message.info({
            content: rta,
            duration: 6
          })
          packager.unzipFunction({ uri: pathDownload + 'packages-documentation.zip', path: pathDownload }).then((content) => {
            this.progressDownload = this.progressDownload + 10
            this.progressStatus = 'success'
            this.$Message.success({
              content: 'Se ha descargado e instalado los paquetes de documentacion',
              duration: 8
            })
            this.loadMdWithId(this.$route.params.id)
          }).catch((err) => {
            this.progressStatus = 'wrong'
            this.$Message.error({
              content: err.toString(),
              duration: 8
            })
          })
        }).catch((err) => {
          this.progressStatus = 'wrong'
          this.$Message.error({
            content: err.toString(),
            duration: 8
          })
        })
      }
    }
  }
</script>
<style lang="css" scoped>
  .content{
    width: 100%;
    height: 100% !important;
    padding: 10px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
  }
  .menu{
    background-color: white;
    height: 100% !important;
    bottom: 10px;
    padding-left: 5px;
    padding-right: 5px;
    padding-top: 10px;
    padding-bottom: 10px;
    border: 1px solid #e6e4e4;
    border-radius: 3px;
    margin-right: 35px;
    z-index: 0;
  }
  .markdown-viewer{
    margin-left: 20px;
    margin-right: 20px;
    margin-bottom: 20px;
    height: 100% !important;
    background-color: white;
  }
  .top{
    padding: 1px;
    background: rgba(84, 84, 84, 0.7);
    color: #fff;
    text-align: center;
    border-radius: 8px;
  }
  img{
    width: 100% !important;
  }
  .modal-contenedor{
      position: absolute;
      background-color: white;
  }
</style>
