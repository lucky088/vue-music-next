<template>
    <div class="player" v-show="playlist.length">
        <!-- 播放器组件 -->
        <transition name="normal" @enter="enter" @after-enter="afterEnter" @leave="leave" @after-leave="afterLeave">
        <div class="normal-player" v-show="fullScreen">  
            <!-- v-if的话，条件不满足时，下面语句不会执行（v-show)会执行和渲染，条件不满足只是隐藏不显示 -->
            <div class="background">
                <img :src="currentSong.pic">
            </div>
            <div class="top">
                <div class="back" @click="goBack">
                    <i class="icon-back"></i>
                </div>
                <h1 class="title">{{currentSong.name}}</h1>
                <h2 class="subtitle">{{currentSong.singer}}</h2>
                <!-- 此处的currentSong是vuex的getters的计算属性，通过当前歌曲播放列表playlist和当前播放歌曲的索引计算得到当前播放歌曲 -->
            </div>
            <div 
            class="middle"
            @touchstart.prevent="onMiddleTouchStart"
            @touchmove.prevent="onMiddleTouchMove"
            @touchend.prevent="onMiddleTouchEnd"
            >
                <div class="middle-l" style="middleLStyle">
                    <!-- cd显示界面 -->
                    <div ref = "cdWrapperRef" class="cd-wrapper">
                        <div ref="cdRef" class="cd">
                            <img ref="cdImageRef" class="image" :class="cdCls" :src="currentSong.pic">
                             <!-- 旋转的是内层image，暂停时记录image旋转的角度，进而同步外侧cd角度 -->
                        </div>
                    </div>
                    <!-- cd下方的部分歌词显示 -->
                    <div class="playing-lyric-wrapper">
                        <div class="playing-lyric">{{playingLyric}}</div>
                    </div>
                </div>
                <scroll class="middle-r" ref="lyricScrollRef" :style="middleRStyle">
                    <!-- 歌词滚动列表界面 -->
                    <div class="lyric-wrapper">
                        <div v-if="currentLyric" ref="lyricListRef">  
                            <!-- currentLyric是一个lyric-parser歌词解析对象实例，对歌词解析，得到lines数组 -->
                            <!-- p标签代表每一行歌词，其中当前行高亮 -->
                            <p 
                            class="text"
                            :class="{'current': currentLineNum === index}"  
                            v-for="(line, index) in currentLyric.lines"
                            :key="line.num"
                            >
                                {{line.txt}}
                            </p>
                        </div>
                        <div class="pure-music" v-show="pureMusicLyric">
                            <p>{{pureMusicLyric}}</p>
                        </div>
                    </div>
                </scroll>
            </div>
            <!-- cd和歌词界面切换点显示 -->
            <div class="bottom">
                <div class="dot-wrapper">
                    <span class="dot" :class="{'active': currentShow==='cd'}"></span>
                    <span class="dot" :class="{'active': currentShow==='lyric'}"></span>
                </div>
                <!-- 进度条 -->
                <div class="progress-wrapper">
                    <span class="time time-l">{{ formatTime(currentTime) }}</span>
                    <div class="progress-bar-wrapper">
                        <progress-bar
                        ref="barRef"
                        :progress="progress"
                        @progress-changing="onProgressChanging"
                        @progress-changed="onProgressChanged"></progress-bar>
                    </div>
                    <span class="time time-r">{{ formatTime(currentSong.duration) }}</span>
                </div>
                <!-- 播放器操作符 -->
                <div class="operators">
                    <div class="icon i-left">
                        <i @click="changeMode" :class="modeIcon"></i>
                        <!-- 播放模式 -->
                    </div>
                    <div class="icon i-left" :class ="disableCls">
                        <i  @click="prev" class="icon-prev"></i>
                    </div>
                    <div class="icon i-center" :class ="disableCls">
                        <i :class="playIcon"  @click="togglePlay"></i>  
                        <!-- 播放按钮样式是动态的，取决于当前的播放状态是播放还是暂停 -->
                    </div>
                    <div class="icon i-right">
                        <i  @click="next" class="icon-next"></i>
                    </div>
                    <div class="icon i-right"  :class ="disableCls">
                        <i @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
                    </div>
                </div>
            </div>
        </div>
        </transition>
        <mini-player :progress="progress" :toggle-play="togglePlay"></mini-player>
        <!-- 另外歌曲播放存在缓冲事件，当目前歌曲的缓冲数据足以播放时，canplay的对应事件触发（歌曲是流式加载） -->
        <audio
        ref="audioRef"
        @pause="pause"
        @canplay="ready"
        @error="error"
        @timeupdate="updateTime"
        @ended="end"></audio>
        <!-- pause监听播放器被迫暂停的事件,（不是通过点击的触发方式暂停，而是睡眠，合闭电脑等方式）,使得播放器按钮随音乐停而被迫改变 -->
       <!-- error防止播放出现问题时。不能触发切换上下首歌的情况，将songReady至true -->
       <!-- updateTime监听歌曲播放进度 -->
    </div>
</template>

<script>
import { useStore } from 'vuex' 
import { computed,watch, ref, nextTick } from 'vue'
import useMode from './use-mode'  //切换播放模式图标逻辑
import useFavorite from './use-favorite'
import useCd from './use-cd'
import useLyric from './use-lyric'
import useMiddleInteractive from './use-middle-interactive'
import useAnimation from './use-animation'
import savePlay from './use-play-history'
import ProgressBar from './progress-bar'
import Scroll from '@/components/base/scroll/scroll'
import MiniPlayer from './mini-player'
import { formatTime } from '@/assets/js/utill'
import { PLAY_MODE } from '@/assets/js/constant'
import usePlayHistory from './use-play-history'



export default {
    name:'player',
    components: {
        MiniPlayer,
        ProgressBar,
        Scroll
    },
    setup(){  
        //data当前组件相关数据
        const audioRef = ref(null)
        //songReady控制歌曲的切换，不能很快切换，不能状态一更新就播放，等歌曲ready再播放
        const barRef = ref(null)
        const songReady = ref(false)
        const currentTime = ref(0) //歌曲当前播放时长
        let progressChanging = false  //标志位

        //vuex相关数据
        /*获取vuex存储（store）中的currentSong和fullScreen,
        不能使用options Api的this.$state或者mapState或者mapActions（由于访问不到this）
        利用vuex提供的usestore (composition api专属)，*/
        const store = useStore()  //相当于store中index.js中导出的createStore导出的store实例，含有若干属性
        const fullScreen = computed(() => store.state.fullScreen) //定义为响应式数据，利用响应式api-computed
        const currentSong = computed(() => store.getters.currentSong)
        const playMode = computed(() => store.state.playMode)

        //hooks钩子函数中数据
        const { modeIcon, changeMode } = useMode()
        const { getFavoriteIcon, toggleFavorite } = useFavorite()
        const { cdCls, cdRef, cdImageRef } = useCd()
        const { currentLyric, currentLineNum,pureMusicLyric,playingLyric, lyricScrollRef,lyricListRef, playLyric,stopLyric} = useLyric({songReady, currentTime})
        const {currentShow, middleLStyle, middleRStyle, onMiddleTouchStart, onMiddleTouchMove, onMiddleTouchEnd} = useMiddleInteractive()
        const { cdWrapperRef, enter, afterEnter, leave, afterLeave} = useAnimation()
        const {savePlay} = usePlayHistory()

        //computed计算属性(声明式，根据响应式数据得到另外新的响应式数据)
        const playing = computed(() => store.state.playing)  //1、获取当前播放状态，得到对应图标 2、监控其变化，歌曲播放器随之变化 3、根据绑定点击事件，playing状态随之变化
        const playIcon = computed(() => {return playing.value? 'icon-pause' : 'icon-play'})

        //切换歌曲，获取当前歌曲索引,以及当前播放列表来得到末尾歌曲索引
        const currentIndex = computed(() => store.state.currentIndex)
        const playlist = computed(() => store.state.playlist)

        const progress = computed(() => { //播放进度
            return currentTime.value/currentSong.value.duration
        })

        const disableCls = computed(() => {   //在左右按钮和播放按钮上绑定此事件，根据songready（当前歌曲缓存状态）决定显示样式（决定按钮是否生效）
            return songReady.value? '':'disable'
        })

        //watch监听事件api（命令式，观测数据变化执行逻辑）
        watch(currentSong, async(newSong) => {  
            //关联全局组件的实现：任何组件内点击导致currentSong更新，player组件响应更新，全屏显示由fullscreen决定
            if(!newSong.id || !newSong.url){
                return
            }
            currentTime.value = 0 //上下歌曲切换时，将当前播放时长重置，其余时间随播放器组件的监听时长事件变

            songReady.value = false  //每次歌曲变化时，songready至为false，准备中
            const audioEl = audioRef.value;
            audioEl.src = newSong.url //播放器audio的赋值，利用watch监控currentSong的变化，获取其url
            audioEl.play();
            store.commit('setPlayingState', true)  
        })
        watch(playing, (newPlaying) => {
            if(!songReady.value) {
                return     //songReady就绪状态为false时，先不播放
            }
            //拿到播放按钮状态变化，与audio关联起来，促使歌曲播放状态随之变化
            const audioEl = audioRef.value
            if(newPlaying){
                audioEl.play()
                playLyric()
            }else{
                audioEl.pause()
                stopLyric()
            }
        })
        watch(fullScreen, async(newFullScreen)=>{
            if(newFullScreen){ 
                //每次点击全屏展开播放器，要更新进度条（由于显示mini播放器时，全屏界面display：none，不会watch到监测mini播放器中进度progress变化
                await nextTick()
                barRef.value.setOffset(progress.value) //setOffset是访问了dom的，必须等fullscreen展开，全屏的dom布局更新后才能访问
            }
        })
        //methods相关
        function goBack(){  //改变播放器显示状态，收屏按钮
            store.commit('setFullScreen',false)
        }
        function togglePlay(){
            if(!songReady.value) {
                return
            }
            //点击修改全局播放按钮状态
            store.commit('setPlayingState',!playing.value)
        }
        function pause(){
            store.commit('setPlayingState',false)
        }
        function prev(){
            const list = playlist.value
            if(!songReady.value || !list.length) return  //没有ready好或者歌曲列表空，不能前进
            //另外考虑只有一首歌的特殊情况，无需切换，只需循环,触发循环函数loop
            if(list.length === 1){
                loop()
            }else{
                 let index = currentIndex.value - 1
                if(index === -1){
                    index  = list.length - 1
                }
                store.commit('setCurrentIndex', index)
             
            }
           
        }
        function next(){
            const list = playlist.value
            if(!songReady.value || !list.length) return //没有ready好或者歌曲列表空，不能后退
            //另外考虑只有一首歌的特殊情况，无需切换，只需循环,触发循环函数loop
             if(list.length === 1){
                loop()
            }else{
                let index = currentIndex.value + 1
                if(index === list.length){
                    index  = 0
                }
                store.commit('setCurrentIndex', index)

            }
        }
        function loop(){
            const audioEl = audioRef.value
            audioEl.currentTime = 0; //歌单只有一首歌情况，点击切换，之后让其从头播放，时间至0
            audioEl.play()
            store.commit('setPlayingState', true)  
            //一首歌播放完进入循环，loop中只是将currentTime清零，但播放结束会触发pause事件，会导致暂停，切换其他播放模式内置都修改了播放状态
        }
        function ready(){   //控制歌曲的切换，不能很快切换，不能状态一更新就播放，等歌曲ready再播放
            if(songReady.value){
                return
                //只需要在该歌曲第一次缓冲时执行此逻辑
            }
            songReady.value = true
            playLyric() 
         //既要保证songReady已经触发后执行playLyric，也要保证playLyric一定会执行,防止如果歌词先实例化完（Lyric），此时songReady还未触发
            savePlay(currentSong.value)
        }
        function error(){  //防止播放出现问题时。不能触发切换上下首歌的情况
            songReady.value = true
        }

        function updateTime(e){  //自动监听歌曲播放进度
        /*本来player组件播放器上的updateTime函数会自动实时监听歌曲播放进度，当
        拖动滚动条时则需关闭此自动监听功能：是由于滑动功能派发的更新数据是progress，
        而在player组件中progress计算属性值是根据实时监听更新的currentTime得到的，
        若不关闭currentTime的自动监听功能，则拖动滚动条时，随播放器组件实时更新的currentTime一开始处于原状态，
        会立即导致progress实时变回原进度比，故一开始点击滚动条就回弹了，导致播放歌曲时滑动滚动条失败 */
        if(!progressChanging){
            currentTime.value = e.target.currentTime   //为拖动滚动条事件增加标志位，不拖动时可监听
        }
        }
        function onProgressChanging(progress){
            progressChanging = true
            currentTime.value = currentSong.value.duration * progress
            //在滑动进度条按钮时，歌曲正常播放，只是计算对应的播放进度和对应播放时间，
            playLyric()  //先跳转歌词块，偏移到我们拖动的位置
            stopLyric()  //每一次移动跳转后停止（希望手指不松开情况下，歌词停留在刚刚偏移处）
        }
        function onProgressChanged(progress){
            progressChanging = false
            audioRef.value.currentTime = currentTime.value = currentSong.value.duration * progress
            if(!playing.value){
                store.commit('setPlayingState',true)  //歌曲暂停时拖动进度条后，自动播放歌曲
            }
            playLyric()  //确定位置松开手指后，再往下播放
        }
        function end () {
          currentTime.value = 0
          if (playMode.value === PLAY_MODE.loop) {
            loop()
          } else {
            next()
          }
        }
        return {  //需要返回到模板中的响应式变量才需要返回
            audioRef,
            barRef,
            fullScreen,
            currentTime,
            currentSong,
            playlist,
            playIcon,
            progress,
            goBack,
            togglePlay,
            pause,
            prev,
            next,
            ready,
            disableCls,
            error,
            updateTime,
            formatTime,
            onProgressChanging,
            onProgressChanged,
            end,
            //mode
            modeIcon,
            changeMode,
            //favorite
            getFavoriteIcon,
            toggleFavorite,
            //cd
            cdCls,
            cdRef,
            cdImageRef,
            //lyric
            currentLyric, 
            currentLineNum,
            pureMusicLyric,
            playingLyric,
            lyricScrollRef,
            lyricListRef,
            //middleInteractive
            currentShow,
            middleLStyle,
            middleRStyle,
            onMiddleTouchStart,
            onMiddleTouchMove,
            onMiddleTouchEnd,
            //animation
            cdWrapperRef, 
            enter,
            afterEnter,
            leave,
            afterLeave
        }
    }
}
</script>

<style lang="scss" scoped>
.player {
  .normal-player {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 150;
    background: $color-background;

    .background {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      opacity: 0.6;
      filter: blur(20px);

      img {
        width: 100%;
        height: 100%;
      }
    }

    .top {
      position: relative;
      margin-bottom: 25px;

      .back {
        position: absolute;
        top: 0;
        left: 6px;
        z-index: 50;
      }

      .icon-back {
        display: block;
        padding: 9px;
        font-size: $font-size-large-x;
        color: $color-theme;
        transform: rotate(-90deg);
      }

      .title {
        width: 70%;
        margin: 0 auto;
        line-height: 40px;
        text-align: center;
        @include no-wrap();
        font-size: $font-size-large;
        color: $color-text;
      }

      .subtitle {
        line-height: 20px;
        text-align: center;
        font-size: $font-size-medium;
        color: $color-text;
      }
    }

    .middle {
      position: fixed;
      width: 100%;
      top: 80px;
      bottom: 170px;
      white-space: nowrap;
      font-size: 0;

      .middle-l {
        display: inline-block;
        vertical-align: top;
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 80%;

        .cd-wrapper {
          position: absolute;
          left: 10%;
          top: 0;
          width: 80%;
          box-sizing: border-box;
          height: 100%;

          .cd {
            width: 100%;
            height: 100%;
            border-radius: 50%;

            img {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border-radius: 50%;
              border: 10px solid rgba(255, 255, 255, 0.1);
            }

            .playing {
              animation: rotate 20s linear infinite  //rotate定义在base中，开始和结束时旋转角度
            }
          }
        }

        .playing-lyric-wrapper {
          width: 80%;
          margin: 30px auto 0 auto;
          overflow: hidden;
          text-align: center;

          .playing-lyric {
            height: 20px;
            line-height: 20px;
            font-size: $font-size-medium;
            color: $color-text-l;
          }
        }
      }

      .middle-r {
        display: inline-block;
        vertical-align: top;
        width: 100%;
        height: 100%;
        overflow: hidden;

        .lyric-wrapper {
          width: 80%;
          margin: 0 auto;
          overflow: hidden;
          text-align: center;

          .text {
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;

            &.current {
              color: $color-text;
            }
          }

          .pure-music {
            padding-top: 50%;
            line-height: 32px;
            color: $color-text-l;
            font-size: $font-size-medium;
          }
        }
      }
    }

    .bottom {
      position: absolute;
      bottom: 50px;
      width: 100%;

      .dot-wrapper {
        text-align: center;
        font-size: 0;

        .dot {
          display: inline-block;
          vertical-align: middle;
          margin: 0 4px;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: $color-text-l;

          &.active {
            width: 20px;
            border-radius: 5px;
            background: $color-text-ll;
          }
        }
      }

      .progress-wrapper {
        display: flex;
        align-items: center;
        width: 80%;
        margin: 0px auto;
        padding: 10px 0;

        .time {
          color: $color-text;
          font-size: $font-size-small;
          flex: 0 0 40px;
          line-height: 30px;
          width: 40px;

          &.time-l {
            text-align: left;
          }

          &.time-r {
            text-align: right;
          }
        }

        .progress-bar-wrapper {
          flex: 1;
        }
      }

      .operators {
        display: flex;
        align-items: center;

        .icon {
          flex: 1;
          color: $color-theme;

          &.disable {
            color: $color-theme-d;
          }

          i {
            font-size: 30px;
          }
        }

        .i-left {
          text-align: right;
        }

        .i-center {
          padding: 0 20px;
          text-align: center;

          i {
            font-size: 40px;
          }
        }

        .i-right {
          text-align: left
        }

        .icon-favorite {
          color: $color-sub-theme;
        }
      }
    }

    /* v-enter/leave-active：定义进入/离开过渡生效时的状态。
    在整个进入、离开过渡的阶段中应用，在 元素被插入之前/离开过渡被触发时立即 生效，
    在过渡/动画完成之后移除。这个类可以被用来定义进入/离开过渡的过程时间，延迟和曲线函数*/
    &.normal-enter-active, &.normal-leave-active {
      transition: all .6s;

      .top, .bottom {
        transition: all .6s cubic-bezier(0.45, 0, 0.55, 1);
      }
    }

    /* 定义进入/离开过渡的结束状态。在 元素被插入/离开过渡被触发 之后下一帧生效，在过渡/动画完成之后移除。 */
    &.normal-enter-from, &.normal-leave-to {   
      //这是触发之后动画，相对于原始css来定义，原始透明度为0，这里触发后透明度为0，再变为1，top往上偏移，bottom往下偏移
      opacity: 0;

      .top {
        transform: translate3d(0, -100px, 0);
      }

      .bottom {
        transform: translate3d(0, 100px, 0)
      }
    }
  }
}
</style>