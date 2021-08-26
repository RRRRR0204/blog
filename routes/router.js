var express = require('express')
var router = express.Router()
var User = require('../models/user')
var md5 = require('blueimp-md5')
const user = require('../models/user')

//渲染首页
router.get('/', function (req, res) {
    res.render('index.html', {
        user: req.session.user
    })
})

//渲染登录页面
router.get('/login', function (req, res) {
    res.render('login.html')
})

//处理登录页面
router.post('/login', function (req, res) {
    //1、获取表单数据
    //2、查询数据库
    //3、发送响应数据

    var body = req.body

    User.findOne({
        email: body.email,
        password: md5(md5(body.password))
    }, function (err, data) {
        if (err) {
            return res.status(500).json({
                err_code: 500,
                message: err.message
            })
        }

        if (!data) {
            return res.status(200).json({
                err_code: 1,
                message: 'Email or password is invalid!'
            })
        }

        //用户存在，登陆成功，通过Session记录登录状态
        req.session.user = data

        res.status(200).json({
            err_code: 0,
            message: 'OK'
        })
    })
})

//渲染注册页面
router.get('/register', function (req, res) {
    res.render('register.html')
})

// 处理注册页面
router.post('/register', function (req, res) {
    //1、获取表单提交的数据
    //   req.body
    //2、操作数据库
    //   判断该用户是否存在，如果已存在，不允许注册；如果不存在，注册新建用户
    //3、发送响应

    var body = req.body

    //or条件查询
    User.findOne({
        $or: [
            {
                email: body.email
            },
            {
                nickname: body.nickname
            }
        ]
    }, function (err, data) {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Server error'
            })
        }

        if (data) {
            //邮箱或昵称已存在
            return res.status(200).json({
                //自定义状态码
                err_code: 1,
                message: 'Email or nickname already exists.'
            })
        }

        //对密码进行两层的md5加密
        body.password = md5(md5(body.password))
        new User(body).save(function (err, data) {
            if (err) {
                return res.status(500).json({
                    err_code: 500,
                    message: 'Server error'
                })
            }

            //注册成功，使用Session记录用户信息
            req.session.user = data

            //Exoress提供了一个响应方法：Json
            //该方法接受一个对象作为参数，自动把对象转为字符串再发送给浏览器
            res.status(200).json({
                err_code: 0,
                message: 'OK'
            })
            //服务端重定向只针对同步请求有效，异步请求无效
        })
    })
})

router.get('/logout', function (req, res) {
    //清楚登录状态
    req.session.user = null

    //重定向到登录页
    res.redirect('/login')
})

module.exports = router