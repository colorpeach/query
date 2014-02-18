(function(){
    
    cache = {};
    cp.template = function(mark,str,data){
        var fn;
        
        if(fn = cache[mark]){
            data = str;
        }else{
            if(typeof str !== "string"){
                data = str;
                str = document.getElementById(mark).innerHTML;
            }
            fn = cache[mark] = new Function("data",
                          "return '"+
                          str
                          .replace(/\<\%\S+\%\>/g,function(str){
                              return "'+data."+str.slice(2,-2)+"+'";
                          })+
                          "';"
                          );
        }
        return fn(data);
    };
})();