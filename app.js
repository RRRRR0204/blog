var express = require('express')
var path = require('path')
var router = require('./routes/router')
var bodyParser = require('body-parser')
var session = require('express-session')

var app = express()

//开放静态资源
app.use('/public/', express.static(path.join(__dirname, './public/')))
app.use('/node_modules/', express.static(path.join(__dirname, './node_modules/')))

//配置模板引擎
app.engine('html', require('express-art-template'));
app.set('views', path.join(__dirname, './views/'))     //默认就是./views目录

//配置解析表单POST请求体插件（注意：一定要在app.use(router)之前）
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extend: false }))
// parse application/json
app.use(bodyParser.json())


//在Express这个框架中，默认不支持Session和Cookie
//但是可以使用第三方中间件：express-session来解决
// 1、npm install express-session
// 2、配置(一定要在挂载路由之前)
// 3、使用
//    配置好之后，就可以通过req.session来访问和设置session成员
//    添加session数据：req.session.foo = 'bar'
//    访问session数据: req.session.foo
app.use(session({
  //配置加密字符串，它会在原有加密基础上和这个字符串拼起来去加密
  //目的是为了增加安全性，防止客户端恶意伪造
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true     //无论是否使用session，都默认直接给你分配一把钥匙
}))

//把路由挂载到app中
app.use(router)

//配置一个处理404的中间件
app.use(function (req, res) {
  res.render('404.html')
})

//配置一个全局错误处理中间件
app.use(function (err, req, res, next) {
  res.status(500).json({
    err_code: 500,
    message: err.message
  })
})

app.listen(3000, function () {
  console.log("server is running...")
})