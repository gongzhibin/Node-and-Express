let http = require('http');
http.createServer(function (req, res) {
    // 路由设置
    // 规范化 url,去掉查询字符串、可选的反斜杠,并把它变成小写
    var path = req.url.replace(/\/?(?:\?.*)?$/, '').toLowerCase();
    switch (path) {
        case '':
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('Homepage');
            //最好不要在js中写html
            // res.writeHead(200, { 'Content-type': 'text/html' });
            // res.end('<h1>Hello World!<h1>');
            break;
        case '/about':
            res.writeHead(200, { 'Content-Type': 'text/plain' });
            res.end('About');
            break;
        default:
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('Not Found');
            break;
    }
}).listen(3000);

console.log('Sever started on 127.0.0.1:3000');
console.log('press Ctrl-C to terminate....');