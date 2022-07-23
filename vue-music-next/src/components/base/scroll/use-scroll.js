import BScroll from '@better-scroll/core'
import ObserveDOM from '@better-scroll/observe-dom'
import { onMounted, onUnmounted,onActivated, onDeactivated, ref } from 'vue'

BScroll.use(ObserveDOM)

export default function useScroll(wrapperRef, options, emit){
    const scroll = ref(null)  //wrapperRef对应装滚动条的容器id，options对应滚动传入的数据props

    onMounted(() => {
        const scrollVal = scroll.value = new BScroll(wrapperRef.value, {
            observeDOM: true, //开启插件
            ...options
        })
        if(options.probeType > 0){
            scrollVal.on('scroll', (pos) => {
                emit('scroll', pos) //利用传入的emit（是context解构赋值取出的，相当于$emit)，可将位置信息pos派发出去
                //此时自定义事件scroll拥有了实时派发滚动位置的能力
            })
        }
    })

    onUnmounted(() => {
        scroll.value.destroy()
    })
    onActivated(() => {
        scroll.value.enable()
        scroll.value.refresh()
    })
    onDeactivated(() => {
        scroll.value.disable()
    })
    return scroll
}