var Browser = require('zombie'),
    assert = require('chai').assert;//为什么这里不能用var
var browser;
suite('Cross-Page Tests', function () {
    // setup 的参数是一个函数,测试框架运行每个测试之前都会执行它,
    // 我们在这里为每个测试创建一个新的浏览器实例
    setup(function () {
        browser = new Browser();
    });

    test('requesting a group rate quote from the hood river tour page should populate the referrer field', function (done) {
        var referrer = 'http://localhost:3000/tours/hood-river';
        browser.visit(referrer, function () {
            browser.clickLink('.requestGroupRate', function () {
                assert(browser.field('referrer').value === referrer);
                done();
            });
        });
    });

    test('requesting a group rate quote from the oregon coast tour page should populate the referrer field', function (done) {
        var referrer = 'http://localhost:3000/tours/oregon-coast';
        browser.visit(referrer, function () {
            browser.clickLink('.requestGroupRate', function () {
                assert(browser.field('referrer').value === referrer);
                done();
            });
        });
    });

    // 方法 browser.visit 会真正加载页面,页面加载完成后,就会调用回调函数。
    // 然后用方法 browser.clickLink 找到 class 为 requestGroupRate 的链接,并访问它。
    // 链接目标页面加载完后调用回调函数,我们就到了 Request Group Rate 页面上。
    // 剩下唯一要做的就是断言隐藏域 referrer 跟我们原来访问的页面是匹配的。
    //  browser.field 方法会返回一个 DOM 元素对象,具有 value 属性。
    //  最后一个测试只是确保直接访问 Request GroupRate 页面时 referrer 为空。
    test('visiting the "request group rate" page dirctly should result in an empty referrer field', function (done) {
        browser.visit('http://localhost:3000/tours/request-group-rate', function () {
            assert(browser.field('referrer').value === '');
            done();
        });
    });

});