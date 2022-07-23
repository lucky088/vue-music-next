import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'
import {onMounted, onUnmounted,onActivated,onDeactivated, ref} from 'vue'
BScroll.use(Slide)
export default function useSlider(wrapperRef){
    const slider = ref(null)
    const currentPageIndex = ref(0)
    onMounted(()=>{
        const sliderVal = slider.value = new BScroll(wrapperRef.value, {
            click:true,
            scrollX:true,  //横向
            scrollY:false, 
            momentum:false, //当使用 slide 时，这个值需要设置为 false，用来避免惯性动画带来的快速滚动时的闪烁的问题和快速滑动时一次滚动多页的问题。
            bounce:false, //bounce 值需要设置为 false，否则会在循环衔接的时候出现闪烁。
            probeType: 2, //如果你想通过监听 slideWillChange 事件，在用户拖动 slide 时，实时获取到 slide 的 PageIndex 的改变，需要设置 probeType 值为 2 或者 3
            slide: true //当 slide 配置为 true 的时候，插件内部使用的是默认的插件选项对象:循环\自动播放\播放间隔等等
        })
        sliderVal.on('slideWillChange', (page) => {
            currentPageIndex.value = page.pageX
        })
    })
    onUnmounted(() => {
        slider.value.destroy()
      })
     onActivated(() => {
        slider.value.enable()
        slider.value.refresh()
    })
    onDeactivated(() => {
        slider.value.disable()
    })

    return {
        slider,
        currentPageIndex
      }
    }
    