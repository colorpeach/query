cp1 = function(){
    var cp = {},
        _document = document;
    
    //查询node
    cp.query = function(node){
        return cp.protoLink( cpSelect(node) );
    };
    
    //扩展对象
    cp.extend = function(first,second){
        for(var n in second){
            first[n] = second[n];
        }
    };
    
    //遍历
    cp.each = function(group,callback){
        for(var i=0,len=group.length,node;i<len;i++){
            node = group[i];
            if(callback(node,i) === false)
                break;
        }
        return group;
    };
    
    cp.map = function(group,callback){
        for(var i=0,len=group.length,node,list=[];i<len;i++){
            node = group[i];
            node = callback(i,node);
            if(node !== undefined){
                list.push(node);
            }
        }
        return list;
    };
    
    //将类数组转为数组
    cp.toArray = function(pseudoarray){
        return cp.map(pseudoarray,function(i,n){return n;});
//         return Array.prototype.slice.call(pseudoarray);
    };
    
    //合并数组
    cp.merge = function(first,second){
        second.length && Array.prototype.push.apply(first,second);
        return first;
    };
    
    cp.protoLink = function(object){
        object.__proto__ = cpSelectPrototype;
        return object;
    }
    
    {
        function cpSelect(node,context){
            var group = typeof node === "string" ? (context||_document).querySelectorAll(node) : node.length ? node : [node]
            return cp.toArray(group);
        }
    }
    
    var cpSelectPrototype = [];
    
    cp.extend(cpSelectPrototype,{
        find:function(node){
            for(var i=0,self=this,len=self.length;len--;){
                cp.merge(self,cpSelect(node,self.shift()));
            }
            return self;
        },
        eq:function(i){
            var self = this,
                i = i>=0 ? i : self.length+i;
            self.cpSlice(i,i+1);
            return  self;
        },
        cpSlice:function(s,e){
            var self = this;
            self.splice(0,s);
            self.splice(e-s,self.length+s-e+1);
            return self;
        },
        each:function(callback){
           return cp.each(this,callback);
        },
        map:function(callback){
           
        },
        filter:function(){
            
        },
        not:function(){
            
        },
        closest:function(){
            
        },
        parent:function(){
            
        },
        parents:function(){
            
        },
        siblings:function(){
            
        },
        add:function(node){
            return cp.merge(this,cpSelect(node));
        }
    });
    
    cp.extend(cpSelectPrototype,{
        attr:function(name,value){
            return cp.each(this,function(n){
                value == null ?
                    n.getAttribute(name)
                    :
                    n.setAttribute(name,value);
            });
        },
        hasClass:function(className){
            
        },
        addClass:function(className){
            
        },
        removeClass:function(className){
            
        },
        data:function(){
            
        }
    });
    
    var eventGroup = "|click|mouseover|mouseout|mouseenter|focus|blur|change|";
    
    return cp;
}();