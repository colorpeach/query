cp1 = function(){
    var cp = {},
        _document = document,
        _documentElement = document.documentElement;
    
    //≤È—Ønode
    cp.query = function(node){
        var group = typeof node === "string" ? cpSelect(node,_document) : node.length ? node : [node];
        return cp.protoLink( group );
    };
    
    cp.extend = function(first,second){
        for(var n in second){
            first[n] = second[n];
        }
    };
    
    cp.each = function(group,callback){
        for(var i=0,len=group.length,node;i<len;i++){
            if(node = group[i])
                if(callback(node,i) === false)
                    break;
        }
        return group;
    };
    
    cp.toArray = function(pseudoarray){
        return Array.prototype.slice.call(pseudoarray);
    };
    
    cp.merge = function(first,second){
        return second.length ? Array.prototype.push.apply(first,second):first;
    };
    
    cp.protoLink = function(object){
        object.__proto__ = cpSelectPrototype;
        return object;
    }
    
    {
        function cpSelect(s,n){
            return cp.toArray(n.querySelectorAll(s));
        }
    }
    
    var cpSelectPrototype = [];
    
    cp.extend(cpSelectPrototype,{
        find:function(node){
            for(var i=0,self=this,len=self.length,group=[];i<len;i++){
                cp.merge(group,cpSelect(node,self[i]));
            }
            return cp.protoLink( group );
        },
        eq:function(i){
            return i>=0 ? this[i] : this[this.length+i];
        },
        attr:function(name,value){
            return cp.each(this,function(n){
                value == null ?
                    n.getAttribute(name)
                    :
                    n.setAttribute(name,value);
            });
        },
        each:function(callback){
           return cp.each(this,callback);
        }
    });
    
    return cp;
}();