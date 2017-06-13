var express = require('express');
var app = express();
var path = require('path');

var fortunes = require('./lib/fortunes.js');
// 设置handlers视图引擎
var handlebars = require('express-handlebars')
    .create({ defaultLayout: 'main' });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');


app.set('port', process.env.PORT || 3000);

app.use(express.static(__dirname + '/public'));// 这里的文件夹前面需要加/


//测试
app.use(function (req, res, next) {
    // 如果test=1 出现在任何页面的查询字符串中(并且不是运行在生产服务器上),
    // 属性 res.locals.showTests 就会被设为 true 。
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

// 中间件
// 在 Express 中,路由和中间件的添加顺序至关重要。
// 如果我们把404 处理器放在所有路由上面,
// 那首页和关于页面就不能用了,访问这些 URL 得到的都是 404。

// app.get 是我们添加路由的方法。在 Express 文档中写的是 app.VERB 。
// 这并不意味着存在一个叫 VERB 的方法,它是用来指代 HTTP 动词的(最常见的是“get” 和“post”)。
// 这个方法有两个参数:一个路径和一个函数。express添加了路由匹配的功能

//路由设置
app.get('/', function (req, res) {
    //替换路由
    res.render('home');
    // res.type('text/plain');
    // res.send('zxlg');
});
app.get('/about', function (req, res) {
    // //添加名言
    // let randomFortune = fortunes[Math.floor(Math.random()*fortunes.length)]
    // //替换路由
    // res.render('about',{fortune:randomFortune});
    //模块文件导入
    // console.log(fortunes.getFortune());
    res.render('about', {
        fortune: fortunes.getFortune(),
        pageTestScript: 'qa/tests-about.js'
    });

    // res.type('text/plain');
    // res.send('About zxlg');
});

app.get('/tours/hood-river', function ( req, res){
    res.render('tours/hood-river');
});
  app.get('/tours/request-group-rate', function(req, res){
    res.render('tours/request-group-rate');
});

// 对定制的 404 和 500 页面的处理与对普通页面的处理应有所区别:
// 用的不是app.get ,而是 app.use 。 
// app.use 是 Express 添加中间件的一种方法

//定制404页面
app.use(function (req, res) {
    res.status(404);
    //替换路由
    res.render('404');
    // res.type('text/plain');
    // res.send('404 - Not Found')
});

// 定制 500 页面
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500);
    //替换路由
    res.render('500');
    // res.type('text/plain');    
    // res.send('500 - Server Error');
});

app.listen(app.get('port'), function () {
    console.log('Express started on http://localhost:' +
        app.get('port') + '; press Ctrl-C to terminate.');
});