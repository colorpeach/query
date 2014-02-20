(function(){
    //事件绑定缓存
    var eventMapList = [];
    
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
        dispatch:function(){
            
        },
        returnHandler:function(handlers){
            return function(event){
                var e,
                    ns,
                    args = arguments;
                
                if(typeof event === "string"){
                    ns = event;
                    e = args[1] || window.event;
                    args = Array.prototype.slice.call(args,1);
                }else{
                    ns = false;
                    e = event || window.event;
                }
                
                for(var i=0,len=handlers.length;i<len;i++){
                    if(!(ns && handlers[i].ns !== ns))
                        if(handlers[i].h.apply(this,args) === false)break;
                }
            };
        }
    };
    
    cp.on = function(node,type,target,handler){
        cp.bind(node,type,handler);
    };
    
    //绑定事件
    cp.bind = function(node,type,handler){
        var eventItem,ns;
        
        if(type){
            ns = type.split(".");
            ns = ns.length > 1 && (type = ns[1],ns[0]);
        
            cp.each(eventMapList,function(n,i){
                if(n.node === node && n[type].handlers.length){
                    eventItem = n;
                }
            });
            
            if(eventItem){
                eventItem[type].handlers.push({h:handler,ns:ns});
            }else{
                eventItem = {node:node};
                eventItem[type] = {handlers:[{h:handler,ns:ns}]};
                eventItem[type].handler = eventMethod.returnHandler(eventItem[type].handlers);
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