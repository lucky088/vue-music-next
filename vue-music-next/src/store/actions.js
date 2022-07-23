// import { PLAY_MODE } from '../assets/js/constant'
// import { shuffle } from '../assets/js/util'

// export function selectPlay({
//                              commit,
//                              state
//                            }, {
//                              list,
//                              index
//                            }) {
//   commit('setPlayMode', PLAY_MODE.sequence)
//   commit('setSequenceList', list)
//   commit('setPlayingState', true)
//   commit('setFullScreen', true)
//   commit('setPlaylist', list)
//   commit('setCurrentIndex', index)
// }

// export function randomPlay({ commit }, list) {
//   commit('setPlayMode', PLAY_MODE.random)
//   commit('setSequenceList', list)
//   commit('setPlayingState', true)
//   commit('setFullScreen', true)
//   commit('setPlaylist', shuffle(list))
//   commit('setCurrentIndex', 0)
// }

// export function changeMode({
//                              commit,
//                              state,
//                              getters
//                            }, mode) {
//   const currentId = getters.currentSong.id
//   if (mode === PLAY_MODE.random) {
//     commit('setPlaylist', shuffle(state.sequenceList))
//   } else {
//     commit('setPlaylist', state.sequenceList)
//   }
//   const index = state.playlist.findIndex((song) => {
//     return song.id === currentId
//   })

//   commit('setCurrentIndex', index)
//   commit('setPlayMode', mode)
// }

// export function removeSong({
//                              commit,
//                              state
//                            }, song) {
//   const sequenceList = state.sequenceList.slice()
//   const playlist = state.playlist.slice()

//   const sequenceIndex = findIndex(sequenceList, song)
//   const playIndex = findIndex(playlist, song)
//   if (playIndex < 0) return

//   sequenceList.splice(sequenceIndex, 1)
//   playlist.splice(playIndex, 1)

//   let currentIndex = state.currentIndex
//   if (playIndex < currentIndex || currentIndex === playlist.length) {
//     currentIndex--
//   }

//   commit('setSequenceList', sequenceList)
//   commit('setPlaylist', playlist)
//   commit('setCurrentIndex', currentIndex)
//   if (!playlist.length) {
//     commit('setPlayingState', false)
//   }
// }

// export function clearSongList({ commit }) {
//   commit('setSequenceList', [])
//   commit('setPlaylist', [])
//   commit('setCurrentIndex', 0)
//   commit('setPlayingState', false)
// }

// export function addSong({
//                           commit,
//                           state
//                         }, song) {
//   const playlist = state.playlist.slice()
//   const sequenceList = state.sequenceList.slice()

//   let currentIndex = state.currentIndex
//   const playIndex = findIndex(playlist, song)

//   if (playIndex > -1) {
//     currentIndex = playIndex
//   } else {
//     playlist.push(song)
//     currentIndex = playlist.length - 1
//   }

//   const sequenceIndex = findIndex(sequenceList, song)
//   if (sequenceIndex === -1) {
//     sequenceList.push(song)
//   }

//   commit('setSequenceList', sequenceList)
//   commit('setPlaylist', playlist)
//   commit('setCurrentIndex', currentIndex)
//   commit('setPlayingState', true)
//   commit('setFullScreen', true)
// }

// function findIndex(list, song) {
//   return list.findIndex((item) => {
//     return item.id === song.id
//   })
// }


//对mutation的封装，其中在store上注册action，处理函数总接受两个参数，第一个context参数，第二个payload

import { PLAY_MODE } from "@/assets/js/constant"
import { shuffle } from "@/assets/js/utill"
//设置顺序播放
export function selectPlay({commit}, {list, index}){
  commit('setPlayMode', PLAY_MODE.sequence)
  commit('setSequenceList', list)
  commit('setPlayingState', true)
  commit('setFullScreen', true)
  commit('setPlaylist', list)
  commit('setCurrentIndex', index)
}

// 设置随机播放
export function randomPlay({commit}, list){
  commit('setPlayMode', PLAY_MODE.random)
  commit('setSequenceList', list)
  commit('setPlayingState', true)
  commit('setFullScreen', true)
  commit('setPlaylist', shuffle(list))
  commit('setCurrentIndex', 0)
}

//切换播放模式
export function changeMode({ commit, state, getters }, mode){
  const currentId = getters.currentSong.id //当前歌曲id
  if (mode === PLAY_MODE.random) {
    commit('setPlaylist', shuffle(state.sequenceList))  //shuffle是js中自定义洗牌函数,打乱原始sequenceList
    //在原歌曲界面切换随机播放时，播放list变了，currentindex没变，导致播放此时索引对应的另一首歌
  }else {
    commit('setPlaylist', state.sequenceList)
  }
  const index = state.playlist.findIndex((song) => {
    return song.id === currentId  //切换新播放模式得到新列表，根据其id，对应到当前列表的新index
  })
  commit('setCurrentIndex', index)  //保证在新列表中对应的歌曲，仍是我们目前正播放的歌曲
  commit('setPlayMode', mode)
}

// 删除歌曲
export function removeSong({commit, state}, song){
  const sequenceList = state.sequenceList.slice()
  const playlist = state.playlist.slice()

  const sequenceIndex = findIndex(sequenceList, song) 
  const playIndex = findIndex(playlist, song)
  if(sequenceIndex < 0 || playIndex < 0){
    return
  }

  sequenceList.splice(sequenceIndex, 1)
  playlist.splice(playIndex, 1)

  let currentIndex = state.currentIndex

  //删除曲目在当前播放歌曲前面或者是删除正在播放的最后一首，对应调整的指定播放的当前歌曲索引上移
  if(playIndex < currentIndex || currentIndex === playlist.length){
    currentIndex--
  }    
  //针对播放列表第一首歌播放时，对其点击删除点击两次，使得第二次获取到playIndex为-1，进而导致currentIndex也--变-1，最后导致无法找到播放歌曲

  commit('setSequenceList', sequenceList)
  commit('setPlaylist', playlist)
  commit('setCurrentIndex', currentIndex)
  if(!playlist.length){
    commit('setplayingState',false)
  }
}

export function clearSongList({commit}){
  commit('setSequenceList', [])
  commit('setPlaylist', [])
  commit('setCurrentIndex', 0)
  commit('setPlayingState', false)  
}

export function addSong({commit, state}, song){
  const playlist= state.playlist.slice()
  const sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  const playIndex = findIndex(playlist, song)
  if(playIndex > -1){
    currentIndex = playIndex //当前播放列表已有
  }else{
    playlist.push(song)
    currentIndex = playlist.length - 1
  }

  const sequenceIndex = findIndex(sequenceList, song)
    if(sequenceIndex == -1){
      sequenceList.push(song)
    }
    commit('setSequenceList', sequenceList)
    commit('setPlaylist', playlist)
    commit('setCurrentIndex', currentIndex)
    commit('setPlayingState', true)
    commit('setFullScreen', true)  //添加歌曲更新播放列表后的效果，立即播放，更新列表
}

function findIndex(list, song){
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

