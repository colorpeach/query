(function(){
    var _document = document;
        
    var arrayPrototype = Array.prototype,
        array_indexOf = arrayPrototype.indexOf,
        array_slice = arrayPrototype.slice,
        array_push = arrayPrototype.push,
        array_forEach = arrayPrototype.forEach;
    
    cp.query = function(node){
        return cp.protoLink( cpSelect(node) );
    };
    
    cp.protoLink = function(object){
        object.__proto__ = cpSelectPrototype;
        return object;
    };
    
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
            return cp.unique(self);
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
            var el = this[0] || {};
            if (el.classList)
              return el.classList.contains(className);
            else
              return new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
        },
        addClass:function(className){
            return cp.each(this,function(n,i){
                var el = n;
                if (!el.className){
                    el.className = className;
                }else if (el.classList){
                    el.classList.add(className);
                }else{
                    el.className = cp.unique((el.className+=" "+className).split(/\S+/g)).join(" ");
                }
                    
            });
        },
        removeClass:function(className){
            return cp.each(this,function(n,i){
                var el = n;
                if (el.classList)
                    el.classList.remove(className);
                else if(el.className)
                    el.className = el.className.replace(new RegExp('(^| )' + className + '( |$)', 'gi')," ");
            });
        }
    });
    
    var dataCache = {},
        dataUuid = 0;
    cp.extend(cpSelectPrototype,{
        data:function(name,value){
            
            if(value == undefined){
                var el = this[0];
                return (dataCache[el.uuid||""]||{})[name];
            }else{
                return cp.each(this,function(n,i){
                            var data = dataCache[n.uuid = ++dataUuid] = {};
                            data[name] = value;
                        });
            }
        },
        removeData:function(name){
            return cp.each(this,function(n,i){
                        var data = dataCache[n.uuid]||{};
                        if(data[name] != undefined)
                            delete data[name];
                    });
        }
    });
    
})();