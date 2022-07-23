<template>
  <div
      ref="rootRef"
      class="suggest"
      v-loading:[loadingText]="loading"
      v-no-result:[noResultText]="noResult"
  >  <!-- 输入搜索框弹出的推荐下拉框，有歌曲和歌手之分 -->
    <ul class="suggest-list">
      <li
          class="suggest-item"
          v-if="singer"
          @click="selectSinger(singer)"
      > <!-- 由于歌曲和歌手的推荐渲染是不一样的 -->
        <div class="icon">
          <i class="icon-mine"></i>
        </div>
        <div class="name">
          <p class="text">{{ singer.name }}</p>
        </div>
      </li>
      <li
          class="suggest-item"
          v-for="song in songs"
          :key="song.id"
          @click="selectSong(song)"
      >
        <div class="icon">
          <i class="icon-music"></i>
        </div>
        <div class="name">
          <p class="text">
            {{ song.singer }}-{{ song.name }}
          </p>
        </div>
      </li>
      <div
          class="suggest-item"
          v-loading:[loadingText]="pullUpLoading"
      ></div>
    </ul>
  </div>
</template>

<script>
import { ref, watch, computed, nextTick } from 'vue'
import { search } from '@/service/search'
import { processSongs } from '@/service/song'
import usePullUpLoad from './use-pull-up-load'

export default {
  name: 'suggest',
  props: {
    query: String,  //搜索框输入的字符串
    showSinger: {
      type: Boolean,
      default: true  //判断类型是否是歌手，歌曲和歌手搜索结果展示不同
    }
  },
  emits: ['select-song', 'select-singer'],
  setup(props, { emit }) {
    const singer = ref(null)
    const songs = ref([])
    const hasMore = ref(true)
    const page = ref(1)
    const loadingText = ref('')
    const noResultText = ref('抱歉，暂无搜索结果')
    const manualLoading = ref(false)

    const loading = computed(() => {
      return !singer.value && !songs.value.length
    })

    const noResult = computed(() => {
      return !singer.value && !songs.value.length && !hasMore.value
    })

    const pullUpLoading = computed(() => {
      return isPullUpLoad.value && hasMore.value
    })

    const preventPullUpload = computed(() => {
      return loading.value || manualLoading.value
    })

    const {
      isPullUpLoad,
      rootRef,
      scroll
    } = usePullUpLoad(searchMore, preventPullUpload)

    watch(() => props.query, async (newQuery) => {
      if (!newQuery) return
      await searchFirst()  //先重置，后赋值
       /*问题：不能直接检测query，由于watch只能监测响应式数据，query只是字符串,故watch一个getter函数
          原因：因为watch只能监听响应式数据：ref定义的属性和reactive定义的对象，
                如果直接监听reactive定义对象中的属性是不允许的，除非使用函数转换一下;
          基本使用:watch 可以监视 getter/effect 函数、ref、reactive、或这些类型的数组。
            watch(观察的数据，数据发生变化的回调，{配置项，可选});*/
    })

    async function searchFirst() {
      if (!props.query) {
        return
      }
      page.value = 1
      songs.value = []
      singer.value = null
      hasMore.value = true

      const result = await search(props.query, page.value, props.showSinger)
      songs.value = await processSongs(result.songs)  //获取到每首歌的url
      singer.value = result.singer
      hasMore.value = result.hasMore
      await nextTick()
      await makeItScrollable()  //每次输入搜索框后的自动搜索推荐，要满屏
    }

    async function searchMore() {   //对于搜索提示框下拉后，数据请求后的处理逻辑
      if (!hasMore.value || !props.query) {
        return
      }
      page.value++
      const result = await search(props.query, page.value, props.showSinger)
      songs.value = songs.value.concat(await processSongs(result.songs))
      hasMore.value = result.hasMore
      await nextTick()  //每次下拉操作，也要满屏，不能让用户一直拉
      await makeItScrollable()
    }

    async function makeItScrollable() {
      if (scroll.value.maxScrollY >= -1) { 
        manualLoading.value = true  //保证Scroll滑动的内容dom长度大于父盒子，即可滚动
        await searchMore()
        manualLoading.value = false
         //请求数据时若不满足一屏，继而请求下一页数据，直到请求的所有数据满足了一屏幕为止（自动填充满数据，不让用户一直拉）
      }
    }

    function selectSong(song) {
      emit('select-song', song)
    }

    function selectSinger(singer) {
      emit('select-singer', singer)
    }

    return {
      singer,
      songs,
      loading,
      loadingText,
      noResult,
      noResultText,
      pullUpLoading,
      selectSong,
      selectSinger,
      // pullUpload
      rootRef
    }
  }
}
</script>

<style lang="scss" scoped>
.suggest {
  height: 100%;
  overflow: hidden;

  .suggest-list {
    padding: 0 30px;

    .suggest-item {
      display: flex;
      align-items: center;
      padding-bottom: 20px;

      .icon {
        flex: 0 0 30px;
        width: 30px;

        [class^="icon-"] {
          font-size: 14px;
          color: $color-text-d;
        }
      }

      .name {
        flex: 1;
        font-size: $font-size-medium;
        color: $color-text-d;
        overflow: hidden;

        .text {
          @include no-wrap();
        }
      }
    }
  }
}
</style>
