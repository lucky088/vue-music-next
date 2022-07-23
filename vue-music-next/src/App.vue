<template>
<!-- vue是允许用大写字母注册组件，但使用组件时要在驼峰命名的大写字母间加上“-”并都改小写 -->
   <m-header></m-header>
  <tab></tab> <!-- 将用户中心路由设为同级路由，与其他路由不嵌套 -->
  <router-view :style="viewStyle" v-slot="{ Component }">
    <keep-alive>
      <component :is="Component"/>
    </keep-alive>
  </router-view>
  <router-view
      :style="viewStyle"
      name="user"
      v-slot="{ Component }"
  >
    <transition appear name="slide">
      <keep-alive>
        <component :is="Component"/>
      </keep-alive>
    </transition>
  </router-view>
  <player></player>
</template>

<script>
import Header from '@/components/header/header'
import Tab from '@/components/tab/tab'
import Player from '@/components/player/player'
import {mapState} from 'vuex'
export default {
  components: {
    Player,
    MHeader: Header,
    Tab
  },
  computed: {
    viewStyle(){
      const bottom = this.playlist.length? '60px': '0'
      return{
        bottom
      }
    },
      ...mapState(['playlist'])
  },

}
</script>
