(function(){
    cp1 = cp1 || {};
    
    var cache = {};
    cp1.template = function(mark,str,data){
        var fn;
        
        if(fn = cache[mark]){
            return fn(data);
        }else{
            if(typeof str !== "string"){
                data = str;
                str = document.getElementById(mark).innerHTML;
            }
            cache[mark] = new Function("data",
                          ""+
                          str
                          .replace(/[\r\t\n]/g, " ")
                          .replace();
                          );
        }
    };
})();