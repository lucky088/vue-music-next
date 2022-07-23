// const mutations = {
//   setPlayingState (state, playing) {
//     state.playing = playing
//   },
//   setSequenceList (state, list) {
//     state.sequenceList = list
//   },
//   setPlaylist (state, list) {
//     state.playlist = list
//   },
//   setPlayMode (state, mode) {
//     state.playMode = mode
//   },
//   setCurrentIndex (state, index) {
//     state.currentIndex = index
//   },
//   setFullScreen (state, fullScreen) {
//     state.fullScreen = fullScreen
//   },
//   setFavoriteList (state, list) {
//     state.favoriteList = list
//   },
//   addSongLyric (state, {
//     song,
//     lyric
//   }) {
//     state.sequenceList.map((item) => {
//       if (item.mid === song.mid) {
//         item.lyric = lyric
//       }
//       return item
//     })
//   },
//   setSearchHistory (state, searches) {
//     state.searchHistory = searches
//   },
//   setPlayHistory (state, songs) {
//     state.playHistory = songs
//   }
// }

// export default mutations
  
//唯一修改数据途径
const mutations = {
  setPlayingState(state, playing){
    //修改播放状态
    state.playing = playing
  },
  setSequenceList(state, list){
    //设置歌曲原始播放列表
    state.sequenceList = list
  },
  setPlaylist(state, list){
    //设置指定方式歌曲播放列表
    state.playlist = list
  }, 
  setPlayMode(state, mode){
    //设置播放模式
    state.playMode = mode
  },
  setCurrentIndex(state, index){
    //设置当前播放索引
    state.currentIndex = index
  },
  setFullScreen(state, fullScreen){
    //设置播放状态
    state.fullScreen = fullScreen
  },
  setFavoriteList(state, list){
    //设置收藏列表
    state.favoriteList = list
  },
  addSongLyric(state, { song, lyric }){
    //给歌曲添加歌词
    state.sequenceList.map((item) => {
      if(item.mid === song.mid){
        item.lyric = lyric  //相当于修改了sequenceList，这样playlist也会发生变化
      }
      return item
    })
  },
  setSearchHistory(state, searches){
      state.searchHistory = searches
  },
  setPlayHistory(state, songs){
    state.playHistory = songs
  }
}

export default mutations