var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var formidable = require('formidable');
var expressSession = require('express-session');
var cookieParser = require('cookie-parser');
//express邮件处理程序
var nodemailer = require('nodemailer');

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
app.set('port', process.env.PORT || 3000);

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
// // 添加购物车后注射掉这段
// app.get('/tours/hood-river', function (req, res) {
//     res.render('tours/hood-river');
// });
// app.get('/tours/oregon-coast', function (req, res) {
//     res.render('tours/oregon-coast');
// });
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


// 添加物品数据库
function Product() {
}
Product.find = function (conditions, fields, options, cb) {
    if (typeof conditions === 'function') {
        cb = conditions;
        conditions = {};
        fields = null;
        options = {};
    } else if (typeof fields === 'function') {
        cb = fields;
        fields = null;
        options = {};
    } else if (typeof options === 'function') {
        cb = options;
        options = {};
    }
    var products = [
        {
            name: '青海湖',
            slug: 'hood-river',
            category: 'tour',
            maximumGuests: 15,
            sku: 723,
        },
        {
            name: '王者大峡谷',
            slug: 'oregon-coast',
            category: 'tour',
            maximumGuests: 10,
            sku: 446,
        },
        {
            name: 'Rock Climbing in Bend',
            slug: 'rock-climbing/bend',
            category: 'adventure',
            requiresWaiver: true,
            maximumGuests: 4,
            sku: 944,
        }
    ];
    cb(null, products.filter(function (p) {
        if (conditions.category && p.category !== conditions.category) return false;
        if (conditions.slug && p.slug !== conditions.slug) return false;
        if (isFinite(conditions.sku) && p.sku !== Number(conditions.sku)) return false;
        return true;
    }));
};
Product.findOne = function (conditions, fields, options, cb) {
    if (typeof conditions === 'function') {
        cb = conditions;
        conditions = {};
        fields = null;
        options = {};
    } else if (typeof fields === 'function') {
        cb = fields;
        fields = null;
        options = {};
    } else if (typeof options === 'function') {
        cb = options;
        options = {};
    }
    Product.find(conditions, fields, options, function (err, products) {
        cb(err, products && products.length ? products[0] : null);
    });
};


//购物车
app.get('/tours/:tour', function (req, res, next) {
    Product.findOne({ category: 'tour', slug: req.params.tour }, function (err, tour) {
        if (err) return next(err);
        if (!tour) return next();
        res.render('tour', { tour: tour });
    });
});
app.get('/adventures/:subcat/:name', function (req, res, next) {
    Product.findOne({ category: 'adventure', slug: req.params.subcat + '/' + req.params.name }, function (err, adventure) {
        if (err) return next(err);
        if (!adventure) return next();
        res.render('adventure', { adventure: adventure });
    });
});

var cartValidation = require('./lib/cartValidation.js');

app.use(cartValidation.checkWaivers);
app.use(cartValidation.checkGuestCounts);

app.post('/cart/add', function (req, res, next) {
    var cart = req.session.cart || (req.session.cart = []);
    Product.findOne({ sku: req.body.sku }, function (err, product) {
        if (err) return next(err);
        if (!product) return next(new Error('Unknown product SKU: ' + req.body.sku));
        cart.push({
            product: product,
            guests: req.body.guests || 0,
        });
        res.redirect(303, '/cart');
    });
});
app.get('/cart', function (req, res) {
    var cart = req.session.cart || (req.session.cart = []);
    res.render('cart', { cart: cart });
});

//添加邮件处理
var mailTransport = nodemailer.createTransport({
    host: 'smtp.163.com',
    port: 465,
    secure: true,
    auth: {
        user: credentials.wymail.user,
        pass: credentials.wymail.password,
    },
});
// mailTransport.sendMail({
//     from: '"zxlg site test"<gzb19930714@163.com>',
//     to: 'zxlg1993@gmail.com,2271721552@qq.com,1041259804@qq.com',
//     subject: '你的度假安排',
//     html: '<h1>无敌美少女</h1>\n<p>感谢你选择与我并肩作战.</p><b>期待下一次的旅程</b>',
//     generateTextFromHtml: true,
// }, function (err) {
//     if (err) console.error('Unable to send email: ' + err);
// })

//添加购物车检查路由
app.get('/cart/checkout', function(req, res, next){
	var cart = req.session.cart;
	if(!cart) next();
	res.render('cart-checkout');
});
app.get('/cart/thank-you', function(req, res){
	res.render('cart-thank-you', { cart: req.session.cart });
});
app.get('/email/cart/thank-you', function(req, res){
	res.render('email/cart-thank-you', { cart: req.session.cart, layout: null });
});

app.post('/cart/checkout', function (req, res) {
    var cart = req.session.cart;
    if (!cart) next(new Error('Cart does not exist.'));
    var name = req.body.name || '';
    var email = req.body.email || '';
    //输入验证
    if (!email.match(VALID_EMAIL_REGEX)) {
        return res.next(new Error('Invalid email address.'));
    }
    //分配一个随机的购物车ID,一般选用数据库ID
    cart.number = Math.random().toString().replace(/^0\.0*/, '');
    cart.billing = {
        name: name,
        email: email,
    }
    res.render('email/cart-thank-you', {
        layout: null,//第一次调用避开正常渲染
        cart: cart,
    }, function (err, html) {
        if (err) console.log('error in email template');
        mailTransport.sendMail({
            from: '"zxlg site test"<gzb19930714@163.com>',
            to: cart.billing.email,
            subject: '谢谢你在zxlg网站预定旅游计划',
            html: html,
            generateTextFromHtml: true,
        }, function (err) {
            if (err) console.error('Unable to send email: ' + err);
        })
    });
    res.render('cart-thank-you', { cart: cart });
})

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