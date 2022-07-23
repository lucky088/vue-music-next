import { get } from './base'

export function processSongs(songs) {
  if (!songs.length) {
    return Promise.resolve(songs)
  }

  return get('/api/getSongsUrl', {
    mid: songs.map((song) => {
      return song.mid
    })
  }).then((result) => {
    const map = result.map
    return songs.map((song) => {
      song.url = map[song.mid]  //需要获取每首歌的url
      return song
    }).filter((song) => {
      return song.url && song.url.indexOf('vkey') > -1  //保证必须由vkey字段
    })
  })
}

const lyricMap = {}

//歌词数据量太大，没必要在请求歌手数据时一起返回，将请求歌词数据接口剥离开来
export function getLyric(song){
  if(song.lyric){  
    //发送请求前先判断，优先从对象本身找
    return Promise.resolve(song.lyric)
  }//之后在不同歌单、榜单创建歌曲时，歌曲对象song可能不同，但对应mid相同（即不同song对象对应同一首歌）
  //进而通过mid构建map
  const mid = song.mid
  const lyric = lyricMap[mid]
  if(lyric){
    return Promise.resolve(lyric)
  }

  return get('/api/getLyric',{  //get实际调用axios，返回promise对象
    mid
  }).then((result) => {
    const lyric = result? result.lyric : '[00:00:00]该歌曲暂时无法获取歌词'
    lyricMap[mid] = lyric
    return lyric
  })
}