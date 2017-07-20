// 购物车验证代码
module.exports={
    checkWaivers:function(req,res,next){
        var cart = req.session.cart;
        if(!cart) return next();
        if(cart.some(function(item){return item.gusets>item.product.maxinumGuests;})){
            if(!cart.errors) cart.errors = [];
            cart.errors.push('你选择的一个或多个旅游不能容纳这么多客人')
        }
    }
}