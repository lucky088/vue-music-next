// import { PLAY_MODE, SEARCH_KEY } from '../assets/js/constant'
// import { load } from '@/assets/js/array-store'

// const state = {
//   sequenceList: [],
//   playlist: [],
//   playing: false,
//   playMode: PLAY_MODE.sequence,
//   currentIndex: 0,
//   fullScreen: false,
//   favoriteList: [],
//   searchHistory: load(SEARCH_KEY),
//   playHistory: []
// }

// export default state
 //全局数据仓库   vuex相当于内存，刷新浏览器便重新初始化清空
 import { PLAY_MODE, SEARCH_KEY } from "@/assets/js/constant"
 import { load } from '@/assets/js/array-store'

 const state = {
   sequenceList: [],  //歌曲播放列表（原始顺序）
   playlist: [],  //实际播放顺序（随机、循环、顺序）
   playing: false, //正在播放
   playMode: PLAY_MODE.sequence, //播放模式，在js的constant中定义的常量
   currentIndex: 0,
   fullScreen: false,  //播放器状态（全屏，收缩）
   favoriteList: [],  //收藏歌曲列表
   searchHistory: load(SEARCH_KEY),
   playHistory: []
 }

 export default state