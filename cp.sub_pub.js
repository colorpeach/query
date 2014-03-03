(function(){
    cp.sp = {};
    
    var subList = {};
    
    var sp = {
        sub: function(type, fn) {
            if (typeof fn === "function") {
                var fns = subList[type];
                if (fns) {
                    fns.push(fn);
                } else {
                    subList[type] = [fn];
                }
            }
        },
        unsub: function(type, fn) {
            var fns = subList[type] || [];
            for(var i=0,len=fns.length;i<len;i++){
                if(fn === fns[i]){
                    return fns.splice(i,1);
                }
            }
        },
        pub: function(type) {
            var fns = subList[type] || [];
            var args = fns.slice.call(arguments, 1)
            for (var i = 0, fn; fn = fns[i++]; ) {
                fn.apply(this, args)
            }
        }
    };
})();