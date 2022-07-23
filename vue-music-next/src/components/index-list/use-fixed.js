import { ref, watch, computed, nextTick } from 'vue'

export default function useFixed (props) {
    const TITLE_HEIGHT = 30  //定义标题栏高度，确定标题栏是否往上偏移，替换之前的标题栏
    // 关于歌手列表，顶部的标题栏是固定定位，用来动态展示当前小分组列表的title值（key）
    const groupRef = ref(null)
    const listHeights = ref([]) //记录每个key的singerlist高度
    const scrollY = ref(0)
    const currentIndex = ref(0)
    const distance = ref(0)  //计算当前列表分组底部和滚动距离的差值

    const fixedTitle = computed(() => {
        if(scrollY.value < 0){
            return ''
        }
        const currentGroup = props.data[currentIndex.value]
        return currentGroup? currentGroup.title : ''
    })  //根据计算得到的key值，返回固定标题栏目前应该展示的title值

    const fixedStyle = computed(() => {
        const distanceVal = distance.value
        //判断是否满足往上偏移（覆盖）条件，实时记录往上偏移的diff值
        const diff = (distanceVal > 0 && distanceVal < TITLE_HEIGHT) ? distanceVal - TITLE_HEIGHT : 0
        return {
            transform: `translate3d(0, ${diff}px, 0)`
        }
    })

  //calculate的调用是在数据发生变化，故传入props参数
    watch(() => props.data, async () => {  //watch前半部分对应getter函数获取data
       await nextTick()  //但数据变化时，dom还未发生变化(高度还没获取),故传入nexttick,等dom加载后正确获取list的高度
       calculate()
    })

    //监听滚动
    watch(scrollY, (newY) => {
        const listHeightsVal = listHeights.value
        for (let i = 0; i < listHeightsVal.length - 1; i++) {
          const heightTop = listHeightsVal[i]
          const heightBottom = listHeightsVal[i + 1]
          if (newY >= heightTop && newY <= heightBottom) {
            currentIndex.value = i;  //实时求得当前应该展示的列表的索引（key）
            distance.value = heightBottom - newY;
            }
        }
    })

    //列表头部的标题栏是固定定位，但栏中的标题是动态显示，需要计算每个key列表的区间高度作为依据（防止区间高度变化），获取当前对应的标题
    function calculate(){
        // groupRef对应整个歌手列表ul，先拿到其children，即每个key对应的singerlist
        const list = groupRef.value.children
        const listHeightsVal = listHeights.value
        listHeightsVal.length = 0
        let height = 0  //实时滚动借助scroll组件（基于betterscroll）
        //先将数组清空
        listHeightsVal.push(height)

        //遍历list
        for (let i = 0; i < list.length; i++) {
            height += list[i].clientHeight
            listHeightsVal.push(height)
     }
    }

    //在钩子函数内部定义原因，要获取他的实时滚动位置，即scrollY的值
    function onScroll(pos){
        scrollY.value = -pos.y //pos.y是负的情况，从0到-
    }
    return {
        groupRef,
        onScroll,
        fixedTitle,
        fixedStyle,
        currentIndex
    }
}