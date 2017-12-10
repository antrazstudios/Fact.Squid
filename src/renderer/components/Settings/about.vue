<template>
  <div class="content">
    <Row>
      <i-col span="5">
        <div class="menu">
          <Menu theme="light" :active-name="activeName">
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
      source: '# Prueba',
      activeName: '1',
      listContents: [
        {
          type: 'group',
          title: 'Informacion basica',
          contenidos: [
            {
              id: '1',
              type: 'item',
              title: 'Acerca de BillsDelivery',
              nameFile: 'README.md',
              routed: '../../../../'
            },
            {
              id: '2',
              type: 'item',
              title: 'Actualizaciones',
              nameFile: 'updates.md',
              routed: './about/'
            }
          ]
        }
      ]
    }),
    components: {
      VueMarkdown
    },
    mounted () {
      this.loadMdWithId(this.$route.params.id)
    },
    methods: {
      loadMdWithItem (item) {
        if (item !== undefined) {
          let modalPath = require('path').join(__dirname, item.routed, item.nameFile)
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
</style>
