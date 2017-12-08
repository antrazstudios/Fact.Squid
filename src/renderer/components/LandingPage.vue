<style>
  .content{
    width: 100%;
    min-height: 100%;
    padding: 0px;
    background-size: cover;
    background-repeat: no-repeat;
    background-position: right;
    user-select: none;
  }
  .demo-carousel-img1{
    height: 650px;
    line-height: 650px;
    text-align: center;
    font-size: 20px;
    background-image: url('~@/assets/images/cartelera1.png');
    background-position: top;
    background-repeat: no-repeat;
    background-size: contain;
  }
  .demo-carousel-img2{
    height: 650px;
    line-height: 650px;
    text-align: center;
    font-size: 20px;
    background-image: url('~@/assets/images/piedepagina.png');
    background-position: top;
    background-repeat: no-repeat;
    background-size: contain;
  }
</style>
<template>
  <div class="content">
    <Carousel v-model="value1" loop arrow="always">
        <CarouselItem>
            <div class="demo-carousel-img1"></div>
        </CarouselItem>
        <CarouselItem>
            <div class="demo-carousel-img2"></div>
        </CarouselItem>
    </Carousel>
  </div>
</template>

<script>
  export default {
    name: 'landing-page',
    data () {
      return {
        value1: 0
      }
    }
  }
</script>
