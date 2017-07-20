// 购物车验证代码
module.exports = {
	checkWaivers: function(req, res, next){
		var cart = req.session.cart;
		if(!cart) return next();
		if(cart.some(function(item){ return item.product.requiresWaiver; })){
			if(!cart.warnings) cart.warnings = [];
			cart.warnings.push('你选择的一个或多个旅游需要保险！');
		}
		next();
	},
    checkGuestCounts: function (req, res, next) {
        var cart = req.session.cart;
        if (!cart) return next();
        if (cart.some(function (item) { return item.guests > item.product.maximumGuests; })) {
            if (!cart.errors) cart.errors = [];
            cart.errors.push('你选择的一个或多个旅游无法容纳这么都游客！');
        }
        next();
    },
}