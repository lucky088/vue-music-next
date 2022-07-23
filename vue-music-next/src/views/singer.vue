<template>
  <div class="singer" v-loading="!singers.length">
    <index-list
      :data="singers"
      @select="selectSinger"  
    ></index-list>
    <!-- 借助index-list组件中emit自定义事件select，赋值给selectSinger方法，来接收select派发的数据， -->
      <!-- 歌手页面，请求数据后整个返回一个数组，
      数组里面每个元素都是对象，对象里面包含标题（姓氏首字母）和一个歌手列表数据list
      list又是一个数组，数组每个元素都是singer对象，singer对象中包含所需数据id,pic -->

      <!-- 渲染singer-detail 在路由组件上实现过渡效果（新画面出现效果） -->
      <router-view v-slot="{ Component }">
      <transition appear name="slide">  
        <!-- transition的name和样式class名（slide-enter-active）对应 -->
        <component :is="Component" :data="selectedSinger"/>
      </transition>
    </router-view>
  </div>
</template>

<script>
import { getSingerList } from '@/service/singer'
import IndexList from '@/components/index-list/index-list'
import storage from 'good-storage'
import { SINGER_KEY } from '@/assets/js/constant'
export default {
    name:'singer',
    components:{
      IndexList
    },
    data(){
      return{
        singers: [],
        selectedSinger: null
      }
    },
    async created(){
      const result = await getSingerList()
      this.singers = result.singers;
      // console.log(result);
    },
    methods:{ 
      //其中这里的参数singer相当于select派发传递的item，获得了被点击歌手的数据项
      selectSinger(singer){
        this.selectedSinger = singer  //传递参数
        this.cacheSinger(singer)  //缓存
        this.$router.push({  //跳转到对应路由
          path:`/singer/${singer.mid}`
        })
      },
      cacheSinger(singer){  //利用storage做一个存储。当点击某个歌手，跳转到对应路由，同时当时的singer对象会存储到本地缓存sessionStorage中：
        storage.session.set(SINGER_KEY, singer)
      }
    }
}
</script>

<style lang="scss" scoped>
.singer {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
}  // 维护滚动功能，固定外容器的高度，不被子级内容撑开
</style>