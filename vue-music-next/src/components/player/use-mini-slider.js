import { ref, computed, watch, nextTick, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'
import { useStore } from 'vuex'
import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'

BScroll.use(Slide)
//使用时要注册
export default function useMiniSlider () {
    const sliderWrapperRef = ref(null)
    const slider = ref(null)
    //mini组件左右滑动切歌逻辑
    const store = useStore()
    const fullScreen = computed(() => store.state.fullScreen)
    const playlist = computed(() => store.state.playlist)
    const currentIndex = computed(() => store.state.currentIndex)
  
    const sliderShow = computed(() => {
      return !fullScreen.value && !!playlist.value
    }) //用双非转成buer类型，playlist要存在

    //由于mini组件根据v-show来显示，mini未显示状态(fullscreen)下初始化滑动切换功能没有意义
    onMounted(() => {
        let sliderVal
        watch(sliderShow, async (newSliderShow) => {
          if (newSliderShow) {
                await nextTick()  //一旦fullScreen变flase，还要等对应mini组件dom挂载后形成后，再对应初始化滑动插件
                // 另外滑动插件只需初始生成一次（在第一次打开mini播放器时）
                if(!sliderVal){
                    sliderVal = slider.value = new BScroll(sliderWrapperRef.value,
                        {click: true,  //配置
                        scrollX: true,
                        scrollY: false,
                        momentum: false,
                        bounce: false,
                        probeType: 2,
                        slide: {
                            autoplay: false,
                            loop: true
                        }
                    })
                    //初始化滑动插件后，绑定滑动换页事件，更新currentIndex
                    sliderVal.on('slidePageChanged', ({ pageX }) => {
                        store.commit('setCurrentIndex', pageX)
                      })
                    } else {
                      sliderVal.refresh()
                    }
                    sliderVal.goToPage(currentIndex.value, 0, 0) 
                //滚动到对应的page位置，第一项是pagex代表当前横向页面的索引值，下标从 0 开始；第二项是pageY；第三项是时间
            }
        })
        watch(currentIndex, (newIndex) => {
            if(sliderVal && sliderShow.value){  //确定滑动插件已创建，切mini播放器是显示状态，dom已经渲染
                sliderVal.goToPage(newIndex, 0, 0) 
            }
        })

        watch(playlist, async(newList) =>{
            if(sliderVal && sliderShow.value && newList.length){
                await nextTick()
                sliderVal.refresh()
            }
            //监听播放列表发生变化，歌曲被删除的情况
        })
    })
    onUnmounted(() =>{
        if(slider.value){   //确保slider插件已经初始化形成，再销毁
            slider.value.destroy()
        }
    })
    onActivated(() => {
        slider.value.enable()
        slider.value.refresh()
    })
    onDeactivated(() => {
        slider.value.disable()
    })
    return{ slider, sliderWrapperRef }
}