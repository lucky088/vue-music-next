<template>
    <div class="album">
        <music-list
            :songs="songs"
            :title="title"
            :pic="pic"
            :loading="loading"></music-list>
    </div>
</template>

<script>
import createDetailComponent from '@/assets/js/create-detail-component'
import {getAlbum} from "@/service/recommend"
import {ALBUM_KEY} from '@/assets/js/constant'
export default createDetailComponent('album', ALBUM_KEY, getAlbum)
//创建歌单详情界面显示页
</script>

<style lang="scss" scoped>
.album {
  position: fixed;
  z-index: 10;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: $color-background;
}
</style>