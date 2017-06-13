suite('"About" Page Test',function(){
    test('Page should contain link to contact page',function(){
        assert($('a[href="/contact"]'.length));
    });
});