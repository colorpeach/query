(function(){
    var concat = Array.prototype.concat;
    
    var operaMap = {
        before:"unshift",
        after:"push"
    };
    
    function aspect(type){
        return function(target,method,fn,mark){
            var aspected = target[method],
                hanler = aspected;
            
            //如果已经添加过切面
            if(!aspected.target){
                hanler = target[method] = returnHandler();
                hanler.origin = {fn:aspected};
                hanler.before = [];
                hanler.after = [];
                hanler.target = target;
            }
            hanler[type][operaMap[type]]({fn:fn,mark:mark});
        }
    }
    
    //
    function returnHandler(){
        return function handler(){
            var fnList = concat.call(handler.before,handler.origin,handler.after),
                target = handler.target,
                len,
                i = 0,
                args = arguments,
                arg;
                
            if(len = fnList.length){
                while(i < len){
                    arg = fnList[i++].fn.apply(target,arg === undefined ? args:concat.call(concat.apply([],args),arg));
                }
            }
            
            return arg;
        }
    }
    
    //移除切入
    function removeAspect(target,method,mark){
        var aspected = target[method],
            beforeList = aspected.before,
            afterList = aspected.after,
            len = beforeList.length;
            
        if(aspected.target){
            if(mark !== undefined){
                while(len--){
                    if(beforeList[len].mark === mark){
                        beforeList.splice(len,1);
                        return;
                    }
                }
                
                len = afterList.length;
                
                while(len--){
                    if(afterList[len].mark === mark){
                        afterList.splice(len,1);
                    }
                }
            }else{
                target[method] = aspected.origin.fn;
            }
        }
    }
    
    cp.aspect = {
        after:aspect("after"),
        before:aspect("before"),
        remove:removeAspect
    };
})();