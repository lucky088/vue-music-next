<template>
  <div class="search">
      <div class="search-input-wrapper">
        <search-input v-model="query"></search-input>  <!-- 搜索框只提供搜索字段 -->
      </div>
      <scroll ref="scrollRef" class="search-content" v-show="!query"><!-- 搜索框内容为空，显示search-content区块，即热门搜索区块 -->
        <div> <!-- better-scroll只作用于第一个子元素，要套入一个大div中 -->
        <div class="hot-keys">
          <h1 class="title">热门搜索</h1> <!-- 搜索框下面的热门推荐 -->
          <ul> 
            <li class="item" v-for="item in hotKeys" :key="item.id" @click="addQuery(item.key)"> 
              <span>{{item.key}}</span>
            </li>
          </ul>
        </div>
        <div class="search-history" v-show="searchHistory.length">
          <h1 class="title">
            <span class="text">搜索历史</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
          <confirm
              ref="confirmRef"
              text="是否清空所有搜索历史"
              confirm-btn-text="清空"
              @confirm="clearSearch"></confirm>
          <search-list
            :searches="searchHistory"
            @select="addQuery"
            @delete="deleteSearch">
          </search-list>
        </div>
        </div>
      </scroll>  <!-- 搜索框内容不为空，显示推荐相关词的区块 -->
      <div class="search-result" v-show="query">  
        <suggest
          :query="query"
          @select-song="selectSong"
          @select-singer="selectSinger"></suggest>
      </div>
      <router-view v-slot="{ Component }">
      <transition appear name="slide">    <!-- transition的name和样式class名（slide-enter-active）对应 -->
        <component :is="Component" :data="selectedSinger"/>
      </transition>
    </router-view>
  </div>
</template>

<script>
import SearchInput from '@/components/search/search-input' 
import Suggest from '@/components/search/suggest.vue'
import SearchList from '@/components/base/search-list/search-list'
import Scroll from '@/components/wrap-scroll'  //wrapperscroll是考虑了min播放器情况下，下方内容滚动能正常显示，不被其覆盖
import Confirm from '@/components/base/confirm/confirm'
import {ref, computed, watch, nextTick} from 'vue'
import { getHotKeys } from '@/service/search'
import { useStore} from 'vuex'
import {useRouter} from 'vue-router'
import storage from 'good-storage'
import { SINGER_KEY} from '@/assets/js/constant'
import useSearchHistory from '@/components/search/use-search-history'
export default { 
    name:'search',
    components: {
      Confirm,
      Scroll,
      SearchList,
      Suggest,
      SearchInput
    },
    setup(){
      const query = ref('')
      const hotKeys =  ref([])
      const selectedSinger = ref(null)
      const scrollRef = ref(null)
      const confirmRef = ref(null)

      const store = useStore()
      const searchHistory = computed(() => store.state.searchHistory)
      const router = useRouter()
      const { saveSearch, deleteSearch, clearSearch} = useSearchHistory()

      getHotKeys().then((result) => {
        hotKeys.value = result.hotKeys
      })

      watch(query, async(newQuery) => {
        /*问题：每次点击下拉框中推荐结果歌手，点击歌手中歌曲播放后弹出播放器，
        之后回到原搜索带有下拉框界面，清空搜索框，回到原搜索界面时要执行一次refresh
        否则原搜索界面的搜索历史不能滚动，由于scroll会根据之前带有下拉框的显示界面进行渲染
        ，不符合原搜索界面的尺寸，故等到下一个dom更新后nexttick（回到下拉框消失的搜索界面），再重新渲染scroll组件*/ 
        if(!newQuery){
          await nextTick()
          refreshScroll()
        }
      })

      function refreshScroll(){
        scrollRef.value.scroll.refresh()
      }

      function addQuery(s){
        query.value = s
      }
      function selectSong(song){
        saveSearch(query.value)
        store.dispatch('addSong', song)
      }
      function selectSinger(singer){
        saveSearch(query.value)
        selectedSinger.value = singer
        cacheSinger(singer)
        router.push({  //跳转到对应路由
          path:`/search/${singer.mid}`
        })
      }
      function cacheSinger(singer){  //利用storage做一个存储。当点击某个歌手，跳转到对应路由，同时当时的singer对象会存储到本地缓存sessionStorage中：
        storage.session.set(SINGER_KEY, singer)
      }

      function showConfirm(){
        confirmRef.value.show()
      }

      return {
        scrollRef,
        confirmRef,
        query,
        hotKeys,
        selectedSinger,
        searchHistory,
        addQuery,
        selectSong,
        selectSinger,
        showConfirm,
        //searchHistory
        deleteSearch,
        clearSearch
      }
    }
}
</script>

<style lang="scss" scoped>
.search {
  position: fixed;
  width: 100%;
  top: 88px;
  bottom: 0;
  display: flex;
  flex-direction: column;

  .search-input-wrapper {
    margin: 20px;
  }

  .search-content {
    flex: 1;
    overflow: hidden;

    .hot-keys {
      margin: 0 20px 20px 20px;

      .title {
        margin-bottom: 20px;
        font-size: $font-size-medium;
        color: $color-text-l;
      }

      .item {
        display: inline-block;
        padding: 5px 10px;
        margin: 0 20px 10px 0;
        border-radius: 6px;
        background: $color-highlight-background;
        font-size: $font-size-medium;
        color: $color-text-d;
      }
    }

    .search-history {
      position: relative;
      margin: 0 20px;

      .title {
        display: flex;
        align-items: center;
        height: 40px;
        font-size: $font-size-medium;
        color: $color-text-l;

        .text {
          flex: 1;
        }

        .clear {
          @include extend-click();

          .icon-clear {
            font-size: $font-size-medium;
            color: $color-text-d;
          }
        }
      }
    }
  }

  .search-result {
    flex: 1;
    overflow: hidden;
  }
}
</style>