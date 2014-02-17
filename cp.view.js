(function(){
    cp1 = cp1 || {};
    
    cache = {};
    cp1.template = function(mark,str,data){
        var fn;
        
        if(!(fn = cache[mark])){
            if(typeof str !== "string"){
                data = str;
                str = document.getElementById(mark).innerHTML;
            }
            fn = cache[mark] = new Function("data",
                          "var p=[];"+
                          "return '"+
                          str
                          .replace(/[\r\t\n]/g, " ")+
                          "';"
                          );
        }
        return fn(data);
    };
})();