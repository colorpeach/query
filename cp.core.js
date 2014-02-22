(function(){
    
    //数组基本方法
    var arrayPrototype = Array.prototype,
        array_indexOf = arrayPrototype.indexOf,
        array_slice = arrayPrototype.slice,
        array_push = arrayPrototype.push,
        array_forEach = arrayPrototype.forEach;
        
    cp  = {};
    
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
	
	//工具 utils
	var objectPrototype = Object.prototype;
	
	cp.isObject = function(obj){
		return obj === Object(obj);
	};
	
	cp.isArray = function(obj){
		objectPrototype.toString.call(obj) === "[object Array]";
	};
})();