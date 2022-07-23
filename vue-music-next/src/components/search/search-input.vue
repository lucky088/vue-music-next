<template>
    <div class="search-input">
        <i class="icon-search"></i><!--搜索界面中的输入框组件  -->
        <input
        class="input-inner"
        v-model="query"
        :placeholder="placeholder"
         />  <!-- 不能直接修改props中的modelValue，modelValue是从父组件中传递而来，只能在父组件中修改 -->
        <i
        v-show="query"
        class="icon-dismiss"
        @click="clear"></i>
    </div>
</template>

<script>
import { debounce } from 'throttle-debounce'
export default {
    name: 'search-input',
    props:{
        modelValue: String,
        placeholder:{  //给予搜索框的占位符，搜索框默认值
            type: String,
            default: '搜索歌曲、歌手'
        }
    },
    data(){
        return{
            query: this.modelValue
        }
    },
    created(){
         this.$watch('query', debounce(300, (newQuery) => {
        this.$emit('update:modelValue', newQuery.trim())
        //debounce防抖函数，防止input。scroll，resize等频繁操作
        //监听数据变化，执行debounce，不直接使用watch：{}是因为debounce不能直接在watch中使用，应该放在created中,this才会指向vue组件实例
        }))
        this.$watch('modelValue', (newVal) => {
            this.query = newVal  
        //外面比如搜索值推荐等，会自动向搜素输入框填充值，(由外部父组件search传入addQuery）实现真正的双向绑定
        })
    },
    // watch:{
    //     query(newQuery){
    //         this.$emit('update:modelValue', newQuery.trim())
    //         //直接写watch是无法给函数加debounce,debounce需要访问组件this，而这里的this指向there
    //     }
    // }
    methods:{
        clear(){
            this.query = ''
        }
    }
}
</script>

<style lang="scss" scoped>
.search-input {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  width: 100%;
  padding: 0 6px;
  height: 32px;
  background: $color-highlight-background;
  border-radius: 6px;

  .icon-search {
    font-size: 24px;
    color: $color-text-d;
  }

  .input-inner {
    flex: 1;
    margin: 0 5px;
    line-height: 18px;
    background: $color-highlight-background;
    color: $color-text;
    font-size: $font-size-medium;
    outline: 0;

    &::placeholder {
      color: $color-text-d;
    }
  }

  .icon-dismiss {
    font-size: 16px;
    color: $color-text-d;
  }
}
</style>
