// 切换播放模式逻辑
import { useStore } from 'vuex'
import { computed } from 'vue'
import { PLAY_MODE } from '@/assets/js/constant'
export default function useMode () {
    //获取playMode，从vuex公共变量库store中
    const store = useStore()
    const playMode = computed(() => store.state.playMode)
    const modeIcon = computed(() => {
        const playModeVal = playMode.value
        return playModeVal === PLAY_MODE.sequence
            ? 'icon-sequence'
            : playModeVal === PLAY_MODE.random
            ? 'icon-random'
            : 'icon-loop' //判断是否顺序播放，对应赋值图标
    })
    const modeText = computed(() => {
        const playModeVal = playMode.value
        return playModeVal === PLAY_MODE.sequence
        ? '顺序播放'
        : playModeVal === PLAY_MODE.random
        ? '随机播放'
        : '单曲播放' 
    })
    function changeMode(){
        const mode = (playMode.value + 1) % 3  //获取切换对应模式索引
        store.dispatch('changeMode', mode)  //dispatch提交actions操作，改变播放模式（提交mutations函数是commit）
    }
    return {modeIcon, modeText, changeMode}
}