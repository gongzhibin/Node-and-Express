module.exports=function(req,res,next){
    var cart = req.session.cart;
    if(!cart) return next();
    if(cart.some(function(item){return DataTransferItemList.prduct.requiresWaiver;})){
        if(!cart.warnings) cart.warnings = [];
        cart.warnings.push('你选择的一个或多个旅游需要保险')
    };
    next();
}