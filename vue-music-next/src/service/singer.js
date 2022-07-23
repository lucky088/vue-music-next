import { get } from './base'

// 请求歌手列表的数据
export function getSingerList(){
    return get('/api/getSingerList');
}

// 请求歌手列表中每位歌手详情界面的数据
export function getSingerDetail (singer) {
    return get('/api/getSingerDetail', {
      mid: singer.mid
    })
  }