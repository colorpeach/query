cp1 = function(){
    var cp = {},
        _document = document;
        
    var arrayPrototype = Array.prototype,
        array_indexOf = arrayPrototype.indexOf,
        array_slice = arrayPrototype.slice,
        array_push = arrayPrototype.push,
        array_forEach = arrayPrototype.forEach;
    
    cp.query = function(node){
        return cp.protoLink( cpSelect(node) );
    };
    
    cp.extend = function(first,second){
        for(var n in second){
            first[n] = second[n];
        }
    };
    
    cp.each = array_forEach ? function(group,callback){
        array_forEach.call(group,callback);
        return group;
    }:function(group,callback){
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
    
    cp.toArray = function(pseudoarray){
        return cp.map(pseudoarray,function(i,n){return n;});
//         return array_slice.call(pseudoarray);
    };
    
    cp.inArray = array_indexOf ? function(elem,arr,i){
        return array_indexOf.call( arr, elem, i );
    }:function(elem,arr,i){

		if ( arr ) {
			var len = arr.length;
			i = i ? i < 0 ? Math.max( 0, len + i ) : i : 0;

			for ( ; i < len; i++ ) {
				// Skip accessing in sparse arrays
				if ( i in arr && arr[ i ] === elem ) {
					return i;
				}
			}
		}

		return -1;
        
    };
    
    cp.merge = function(first,second){
        second.length && array_push.apply(first,second);
        return first;
    };
    
    cp.unique = function(group){
        var node,
            len = group.length,
            i = 0,
            j;
        
        for(;i<len;i++){
            j = i+1;
            for(;j<len;j++){
                if(group[i] === group[j]){
                    len--;
                    group.splice(j--,1);
                }
            }
        }

        return group;
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
        },
        data:function(){
            
        }
    });
    
    var eventGroup = "|click|mouseover|mouseout|mouseenter|focus|blur|change|";
    
    return cp;
}();