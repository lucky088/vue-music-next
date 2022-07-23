import { ref, computed } from "vue"
export default function useShortcut(props, groupRef){
    const ANCHOR_HEIGHT = 18 //锚点高度
    const scrollRef = ref(null)
    // groupRef代表分组的dom。获取dom调用跳转到对应dom位置的跳转函数scrollToElement
    const shortcutList = computed(() => {
        return props.data.map((group) => {
          return group.title
        })
    })
    const touch = {}
    function onShortcutTouchStart(e) {
        const anchorIndex = parseInt(e.target.dataset.index) //获取点击右侧导航栏中的title，所对应在导航栏数组shortcutList的数据dataset中的索引，索引值由:date-index="index"变量传入
        touch.y1 = e.touches[0].pageY
        touch.anchorIndex = anchorIndex

        scrollTo(anchorIndex)
       // const targetEl = groupRef.value.children[anchorIndex]  //将title对应在导航栏的索引运用在dom中，确定是哪个列表分组
        //const scroll = scrollRef.value.scroll  
        //这里的scrollRef对应于scroll组件实例，可以调用scroll组件实例中setup返回的方法，向方法中传递数据
        //scroll.scrollToElement(targetEl, 0)
    }
    function onShortcutTouchMove(e) {
        touch.y2 = e.touches[0].pageY
        const delta = (touch.y2 - touch.y1) / ANCHOR_HEIGHT | 0
        const anchorIndex = touch.anchorIndex + delta
    
        scrollTo(anchorIndex)
      }
    
      function scrollTo(index) {
        if (isNaN(index)) return
        index = Math.max(0, Math.min(shortcutList.value.length - 1, index))
        const targetEl = groupRef.value.children[index]
        const scroll = scrollRef.value.scroll
        scroll.scrollToElement(targetEl, 0)
      }
    
      return {
        shortcutList,
        onShortcutTouchStart,
        scrollRef,
        onShortcutTouchMove
      }
    }
    