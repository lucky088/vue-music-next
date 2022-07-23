const express = require('express')  //导入express
const compression = require('compression')
const cookieParser = require('cookie-parser')
const registerRouter = require('./router') //导入路由模块

const port = process.env.PORT || 9002

const app = express()  //创建web服务器
const csrfProtection = csrf({  //保护接口
  cookies: true,
  ignoreMethods: ['HEAD','OPTIONS'],
  checkPathReg: /^\/api/
})
app.use(cookieParser())
app.use(csrfProtection)

// 代理自己写的接口
registerRouter(app)

app.use(compression()) //压缩中间件

// 静态资源目录
app.use(express.static('./dist'))

module.exports = app.listen(port, function (err) {  //启动服务器
  if (err) {
    console.log(err)
    return
  }
  console.log('Listening at http://localhost:' + port + '\n')
})
