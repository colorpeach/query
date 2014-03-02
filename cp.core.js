(function(){
    
    //数组基本方法
    var arrayPrototype = Array.prototype,
        array_indexOf = arrayPrototype.indexOf,
        array_slice = arrayPrototype.slice,
        array_push = arrayPrototype.push,
        array_forEach = arrayPrototype.forEach;
        
    cp  = {};
	
	cp.noop = function(){};
    
    cp.extend = function(first){
		var args = arguments,
			len = args.length;
		if(len > 1){
			for(var i=1;i<len;i++){
				for(var n in args[i]){
					first[n] = args[i][n];
				}
			}
		}
    };
    
    cp.each = function(group,callback){
		if(callback){
			if(group.length !== undefined){
				for(var i=0,len=group.length,node;i<len;i++){
					node = group[i];
					if(callback(node,i,group) === false)
						break;
				}
			}else{
				for(var n in group){
					node = group[n];
					if(callback(node,n,group) === false)
						break;
				}
			}
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
	
	//工具 utils
	var objectPrototype = Object.prototype;
	
	cp.isObject = function(obj){
		return obj === Object(obj);
	};
	
	cp.isArray = function(obj){
		objectPrototype.toString.call(obj) === "[object Array]";
	};
	
	cp.trim = function(str){
		return str.replace(/^\s+|\s+$/g,"");
	}
})();