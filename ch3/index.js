var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');

var fortunes = require('./lib/fortunes.js');
var getWeatherData = require('./lib/getWeatherData.js');
//获取cookie秘钥，凭证外化
var credentials = require('./credentials.js');

// 设置handlers视图引擎
var handlebars = require('express-handlebars')
    .create({
        defaultLayout: 'main',
        //向布局中加入不同的东西
        helpers: {
            section: function (name, options) {
                if (!this._sections) this._sections = {};
                this._sections[name] = options.fn(this);
                return null;
            }
        }
    });
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');

//设置端口
app.set('port', process.env.PORT || 3001);

//设置静态文件夹
app.use(express.static(__dirname + '/public'));// 这里的文件夹前面需要加/

//设置body-parser,解析URL编码体
app.use(bodyParser());

//设置cookie和会话
app.use(cookieParser(credentials.cookieSecret));
app.use(expressSession());

//测试
app.use(function (req, res, next) {
    // 如果test=1 出现在任何页面的查询字符串中(并且不是运行在生产服务器上),
    // 属性 res.locals.showTests 就会被设为 true 。
    res.locals.showTests = app.get('env') !== 'production' && req.query.test === '1';
    next();
});

//处理即显消息
app.use(function (req, res, next) {
    //如果有即显消息，将其传到上下文，然后清除它
    res.locals.flash = req.session.flash;
    delete req.session.flash;
    next();
});

// // 局部文件添加中间件，获取weather信息
// // !!!未成功不知原因
// app.use(function(req,res,next){
//     if(!res.locals.partials) res.locals.partials = {};
//     res.locals.partials.weather = getWeatherData();
//     next();
// });
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

app.get('/jquery-test', function (req, res) {
    res.render('jquery-test');
});

//童谣
app.get('/nursery-rhyme', function (req, res) {
    res.render('nursery-rhyme');
})

app.get('/data/nursery-rhyme', function (req, res) {
    res.json({
        animal: '袋鼠',
        bodyPart: '尾巴',
        adjective: '浓密',
        noun: '魔鬼',
    });
});

//表单控制
app.get('/newsletter', function (req, res) {
    res.render('newsletter', { csrf: 'CSRF令牌在这' });
});
//post方法解析需要加 body-parser 中间件
app.post('/process', function (req, res) {
    console.log(req.body);
    console.log('表单 (from querystring): ' + req.query.form);
    console.log('CSRF令牌(来自隐藏表单): ' + req.body._csrf);
    console.log('姓名(来自可见表单): ' + req.body.name);
    console.log('邮箱(来自可见表单): ' + req.body.email);
    //如果是AJAX请求(XHR是XML HTTP请求的简称,AJAX依赖于XHR), req.xhr值为 true 。 
    //req.accepts 试图确定返回的最合适的响应类型。
    //req.accepts('json,html') 询问最佳返回格式是JSON还是 HTML
    if (req.xhr || req.accepts('json,html') === 'json') {
        //如果发生错误,应该发送 { error: 'error description' }
        res.send({ success: true });
    } else {
        //若发生错误，应重定向到错误页面
        res.redirect(303, '/thank-you')
    }
});

//重定向thank-you界面
app.get('/thank-you', function (req, res) {
    res.render('thank-you');
});

//contact界面
app.get('/contact', function (req, res) {
    res.render('contact');
});

//景点
app.get('/tours/hood-river', function (req, res) {
    res.render('tours/hood-river');
});
app.get('/tours/request-group-rate', function (req, res) {
    res.render('tours/request-group-rate');
});

//创建文件上传路由处理程序
app.get('/contest/vacation-photo', function (req, res) {
    var now = new Date();
    //注意：res.render中的路由，第一个子文件夹不用加‘/’
    res.render('contest/vacation-photo', {
        year: now.getFullYear(),
        month: now.getMonth()
    });
});
app.post('/contest/vacation-photo/:year/:month', function (req, res) {
    var form = new formidable.IncomingForm();
    form.parse(req, function (err, fields, files) {
        if (err) { return res.redirect(303, '/error'); }
        console.log('Receive fields: ' + fields);
        console.log('Receive files: ' + files);
        res.redirect(303, '/thank-you');
    })
});

//定义NewsletterSignup:
function NewsletterSignup() {
}
NewsletterSignup.prototype.save = function (cb) {
    cb();
};
//即显消息
var VALID_EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;
app.post('/newsletter', function (req, res) {
    var name = req.body.name || '';
    var email = req.body.email || '';
    if (!email.match(VALID_EMAIL_REGEX)) {
        if (req.xhr) return res.json({ error: 'Invalid email address.' });
        req.session.flash = {
            type: 'danger',
            intro: '校验错误!',
            message: '邮箱地址不合法.',
        };
        return res.redirect(303, 'contact');
    }
    new NewsletterSignup({ name: name, email: email }).save(function (err) {
        if (err) {
            if (req.xhr) return res.json({ error: 'Database error.' });
            req.session.flash = {
                type: 'danger',
                intro: '数据库错误!',
                message: '发生了数据库错误，请稍后重试.',
            };
            return res.redirect(303, 'contact');
        }
        if (req.xhr) return res.json({ success: true });
        req.session.flash = {
            type: 'success',
            intro: '谢谢!',
            message: '你已经成功注册了简报.',
        }
        return res.redirect(303, 'newsletter/archive');
    });
});
app.get('/newsletter/archive', function (req, res) {
    res.render('newsletter/archive');
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