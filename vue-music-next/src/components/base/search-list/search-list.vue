<template>
  <div class="search-list"> <!-- 关于搜索界面下方搜索历史布局 -->
    <transition-group name="list" tag="ul">
      <li
          v-for="item in searches"
          :key="item"
          class="search-item"
          @click="selectItem(item)">
        <span class="text">{{ item }}</span>
        <span
            v-if="showDelete"
            class="icon"
            @click.stop="deleteItem(item)">
            <i class="icon-delete"></i>
          </span> <!-- .stop 不希望在删除某一项时，同时选择了某一项 -->
      </li>
    </transition-group>
  </div>
</template>

<script>
export default {
  name: 'search-list',
  props: {
    searches: {
      type: Array,
      default() {
        return []
      }
    },
    showDelete: { //对于搜索历史界面不需要删除按钮,由父组件传递
      type: Boolean,
      default: true
    }
  },
  emits: ['select', 'delete'],
  methods: { //逻辑简单，不需要写composition API
    selectItem (item) { //等效于为搜索框添加数据，之前搜索过的数据
      this.$emit('select', item)
    },
    deleteItem (item) {
      this.$emit('delete', item)
    }
  }
}
</script>

<style lang="scss" scoped>
.search-list {
  .search-item {
    display: flex;
    align-items: center;
    height: 40px;
    overflow: hidden;

    .text {
      flex: 1;
      color: $color-text-l;
    }

    .icon {
      @include extend-click();

      .icon-delete {
        font-size: $font-size-small;
        color: $color-text-d;
      }
    }
  }
}
</style>
