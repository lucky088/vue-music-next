// 根据当前歌曲获取对应歌词
import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { getLyric } from '@/service/song'  //异步函数axios请求
import Lyric from 'lyric-parser'  //歌词解析模块
export default function useLyric({songReady, currentTime}){
    const currentLyric = ref(null)
    const currentLineNum = ref(0)  //当前显示行号
    const pureMusicLyric = ref('')
    const playingLyric = ref('')
    const lyricScrollRef = ref(null)
    const lyricListRef = ref(null)

    const store = useStore()
    const currentSong = computed(() => store.getters.currentSong)

    watch(currentSong, async(newSong) => {
        if(!newSong.url || !newSong.id){
            return
        }
        stopLyric() //切换歌曲时将之前lyric实例清除。stop里面会判断是否有实例
        currentLyric.value = null 
        currentLineNum.value = 0
        pureMusicLyric.value = ''
        playingLyric.value = ''
        /*停止歌词跳转后，若新建当前歌曲歌词实例还没创建完，但歌曲缓存足够到触发了songReady，导致启动playLyric，
        这时目前的lyric还是旧实例，等新实例生成后就会发生乱跳，故切换曲目时也将歌词实例清除*/
        const lyric = await getLyric(newSong)  
        //缺点是每次切换歌都需要发请求，即使是请求过的，故将歌词请求后缓存
        // 利用newSong.lyric = lyric，但不能直接这么修改，这等于没有提交到mutation，自己修改了vuex中state包含的newSong数据
        //在mutation里面添加相关操作
        store.commit('addSongLyric', {
            song: newSong,
            lyric
        })
         //getLyric是异步过程，需要网络延时，若是连续切换，中间部分的跳转歌曲的歌词不用缓存
         if(currentSong.value.lyric !== lyric){
             //可以在这里加debugger调试，快速切换看是否产生debugger
             return   //即表示，当获取到歌词后，发现currentSong发生了变化，已经切换跳转歌曲了
         }

        currentLyric.value = new Lyric(lyric, handleLyric) //处理函数，歌词一旦播放，在一行行切换过程中就会执行handleLyric
        const hasLyric = currentLyric.value.lines.length
        //对于纯音乐没有歌词情况
        if(hasLyric){  
        // 实例化Lyric后，需要播放
        /* 播放时存在两个异步过程，执行完这两个异步过程后，同步歌词才有意义：
        1、切歌时（currentSong变化），需要获取歌词；
        2、歌曲播放过程中，会@canplay事件（缓存响应）触发ready函数，实际播放时songready为true也是异步过程*/
        if(songReady.value){
            playLyric()  //注意如果歌词先实例化完，此时songReady还未触发，这样playLyric播放歌词函数将不能被执行
            /*既要保证songReady已经触发后执行playLyric，也要保证playLyric一定会执行，
            故在player组件中的songReady触发函数（ready函数）中触发后再执行playLyric */
        }
    }else{
        playingLyric.value = pureMusicLyric.value = lyric.replace(/\[(\d{2}):(\d{2}):(\d{2})\]/g, '') //将显示的没有歌词提示信息处理并显示,/g所有可能的匹配
    }
    })
    function playLyric(){  //播放歌词
        const currentLyricVal = currentLyric.value
        if(currentLyricVal){
            currentLyricVal.seek(currentTime.value * 1000)  //lyric-parser中的api--seek(startTime)用于歌词跳转
        }
    }
    function stopLyric(){  //将播放器播放暂停与歌词滚动链接起来
        const currentLyricVal = currentLyric.value
        if(currentLyricVal){
            currentLyricVal.stop() 
        }
    }
    function handleLyric({lineNum, txt}){
        //在handleLyric内部中实现一些逻辑
        currentLineNum.value = lineNum
        playingLyric.value = txt
        // 触发条件，当播放歌词过程中，歌词播放完跳转下一行，每次跳行都会执行handleLyric
        const scrollComp = lyricScrollRef.value
        const listEl = lyricListRef.value  //根据当前歌词是否有才显示,这里是一个p标签列表
        if(!listEl){
            return
        }
        // 实现整体歌词往下滚，相当于当前页面歌词都播完了，跳转显示下一部分歌词
        if(lineNum > 5){
            const lineEl = listEl.children[lineNum - 5] // 让滚动位置偏中间
            scrollComp.scroll.scrollToElement(lineEl, 1000) 
            //scrollToElement(el, time, offsetX, offsetY, easing),el选项可以是选择器或者元素
        }else{
            scrollComp.scroll.scrollTo(0, 0, 1000)
        }
    }
    return {
        currentLyric,
        currentLineNum,
        pureMusicLyric,
        playingLyric,
        lyricScrollRef,
        lyricListRef,
        playLyric,
        stopLyric,
    }
}