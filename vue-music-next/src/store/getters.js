export const currentSong = (state) => {
  return state.playlist[state.currentIndex] || {}   //初始取不到歌曲时给予一个空对象
}
//state的计算属性，可以监控state数据变化，得到新属性，commit mutation修改数据