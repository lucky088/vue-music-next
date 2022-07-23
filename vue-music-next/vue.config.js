const registerRouter = require('./backend/router')
//对webpack做额外配置入口，对webpack做修改
module.exports = {
  transpileDependencies:true,
  lintOnSave:false,
  css: {
    loaderOptions: {
      sass: {
        // variable和mixin给sass提供了一些东西，给sassloader用，css不认
        //  全局引入variable和mixin,additionalData全局引入sass文件（额外的）
        //    ---这两个是全局样式（每个组件要单个引入很麻烦）
        additionalData: `
          @import "@/assets/scss/variable.scss";
          @import "@/assets/scss/mixin.scss";
        `
      }
    }
  },
  devServer:{
    onBeforeSetupMiddleware : function ( devServer ) {
      if (!devServer ) {
        throw new Error ( 'webpack-dev-server is not defined' );
      }
      registerRouter(devServer.app)
    },
    // onBeforeSetupMiddleware (app){
    //   registerRouter(app)
    // }
  },
  configureWebpack: (config) => {
    if (process.env.npm_config_report) {  //run build时候为true
      const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
      config.plugins.push(new BundleAnalyzerPlugin())
    }
  },
  productionSourceMap: false, // 生产不需要打开sourceMap
  publicPath: process.env.NODE_ENV === 'production' ? '/music-next/' : '/'
}
