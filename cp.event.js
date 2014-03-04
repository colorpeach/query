(function(){
    //事件绑定缓存
    var eventMapList = [];
    var docElem = document.documentElement;
    var matchesSelector = 
            docElem.webkitMatchesSelector ||
            docElem.mozMatchesSelector ||
            docElem.oMatchesSelector ||
            docElem.msMatchesSelector;
    
    var eventMethod = {
        bind:function(node,type,handler){
        
            if(document.attachEvent){
                node.attachEvent("on"+type,handler);
            }else{
                node.addEventListener(type,handler,false);
            }
        },
        unbind:function(node,type,handler){
        
            if(document.detachEvent){
                node.detachEvent("on"+type,handler);
            }else{
                node.removeEventListener(type,handler,false);
            }
        },
        delegate:function(){
            
        },
        returnHandler:function(handlers,node,selector){
            return function(event){
                var e,
                    ns,
                    args = arguments,
                    target = selector;
                
                if(typeof event === "string"){
                    ns = event;
                    e = new standardEvent(args[1] || window.event);
                    args = Array.prototype.slice.call(args,2);
                }else{
                    ns = false;
                    e = new standardEvent(event || window.event);
                    args = Array.prototype.slice.call(args,1);
                }
                
                args = cp.merge([e],args);
                var el = e.target;
                if(target){
                    while(el&&el!==document){
                        if(isMatch(el,target)){
                            target = false;
                            break;
                        }else if(el === node){
                            break;
                        }else{
                            el = el.parentNode;
                        }
                    }
                }
                
                if(!target){
                    for(var i=0,len=handlers.length;i<len;i++){
                        if(!(ns && handlers[i].ns !== ns))
                            if(handlers[i].h.apply(this,args) === false)break;
                    }
                }
            };
        }
    };
    
    function isMatch(el,selector){
        return matchesSelector.call(el,selector);
    }
    
    function returnTrue() {
        return true;
    }
    
    function returnFalse() {
        return false;
    }
    
    var standardEvent = function(src, props){
        if ( !(this instanceof standardEvent) ) {
            return new standardEvent( src, props );
        }
    
        if ( src && src.type ) {
            this.originalEvent = src;
            this.type = src.type;
    
            this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
                src.getPreventDefault && src.getPreventDefault() ) ? returnTrue : returnFalse;
                
            this.target = src.target||src.srcElement||document;
    
        } else {
            this.type = src;
        }
    
        if ( props ) {
            cp.extend( this, props );
        }
    
        this.timeStamp = src && src.timeStamp || (new Date()).getTime();
    };
    
    // http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
    standardEvent.prototype = {
        isDefaultPrevented: returnFalse,
        isPropagationStopped: returnFalse,
        isImmediatePropagationStopped: returnFalse,
    
        preventDefault: function() {
            var e = this.originalEvent;
    
            this.isDefaultPrevented = returnTrue;
            if ( !e ) {
                return;
            }
    
            if ( e.preventDefault ) {
                e.preventDefault();
    
            } else {
                e.returnValue = false;
            }
        },
        stopPropagation: function() {
            var e = this.originalEvent;
    
            this.isPropagationStopped = returnTrue;
            if ( !e ) {
                return;
            }
            
            if ( e.stopPropagation ) {
                e.stopPropagation();
            }
    
            e.cancelBubble = true;
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = returnTrue;
            this.stopPropagation();
        }
    };
    
    cp.on = function(node,type,target,handler){
        cp.bind(node,type,handler,target);
    };
    
    //绑定事件
    cp.bind = function(node,type,handler,target){
        var eventItem,ns;
        
        if(type){
            ns = type.split(".");
            ns = ns.length > 1 && (type = ns[1],ns[0]);
        
            cp.each(eventMapList,function(n,i){
                if(n.node === node && type === i && n[type].handlers.length){
                    eventItem = n;
                }
            });
            
            if(eventItem){
                eventItem[type].handlers.push({h:handler,ns:ns});
            }else{
                eventItem = {node:node};
                eventItem[type] = {handlers:[{h:handler,ns:ns}]};
                eventItem[type].handler = eventMethod.returnHandler(eventItem[type].handlers,node,target);
                eventMapList.push(eventItem);
            }
            
            eventMethod.bind(node,type,eventItem[type].handler);
        }
    };
    
    //解绑事件
    cp.unbind = function(node,type){
        var handler,ns;
        
        if(type){
            ns = type.split(".");
            ns = ns.length > 1 && (type = ns[1],ns[0]);
            
            cp.each(eventMapList,function(n){
                if(n.node === node && n[type]){
                    if(ns){
                        for(var i=0,list=n[type].handlers,len=list.length;i<len;i++){
                            if(list[i].ns === ns){
                                list.splice(i,1);
                                len--;
                                i--;
                            }
                        }
                    }
                    
                    //如果不存在命名空间，或者该类型事件处理函数列表为空，将事件缓存删除
                    if(!ns || !list.length){
                        eventMethod.unbind(node,type,n[type].handler);
                        delete n[type];
                    }
                    
                    (function(){
                        var j = 0,m;
                        for(m in n){
                            if(j++)break;
                        };
                        
                        j === 1 && eventMapList.splice(i,1);
                    })();
                    return false;
                }
            });
        }else{
            cp.each(eventMapList,function(n,i){
                if(n.node === node){
                    eventMapList.splice(i,1);
                    for(var m in n){
                        m !== "node" && eventMethod.unbind(node,m,n[m].handler);
                    }
                    return false;
                }
            });
        }
    };
    
    //触发事件
    cp.trigger = function(node,type,args){
        //TODO trigger事件对象
        var e,
            ns = type.split(".");
        ns = ns.length > 1 && (type = ns[1],ns[0]);
        cp.each(eventMapList,function(n,i){
            if(n.node === node && n[type]){
                n[type].handler.apply(node,cp.merge(ns ? [ns,e]:[e],args));
            }
        });
    };
    
    cp.off = function(node,type){
        cp.unbind(node,type);
    };
})();