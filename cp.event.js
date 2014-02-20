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
            return function(e){
                var e = e || window.event;
                for(var i=0,len=handlers.length;i<len;i++){
                    if(handlers[i].apply(this,arguments) === false)break;
                }
            };
        }
    };
    
    cp.on = function(node,type,target,handler){
        cp.bind(node,type,handler);
    };
    
    //绑定事件
    cp.bind = function(node,type,handler){
        var eventItem;
        
        cp.each(eventMapList,function(n,i){
            if(n.node === node && n[type].handlers.length){
                eventItem = n;
            }
        });
        
        if(eventItem){
            eventItem[type].handlers.push(handler);
        }else{
            eventItem = {node:node};
            eventItem[type] = {handlers:[handler]};
            eventItem[type].handler = eventMethod.returnHandler(eventItem[type].handlers);
            eventMapList.push(eventItem);
        }
        
        eventMethod.bind(node,type,eventItem[type].handler);
    };
    
    //解绑事件
    cp.unbind = function(node,type){
        var handler;
        
        if(type){
            cp.each(eventMapList,function(n,i){
                if(n.node === node && n[type]){
                    eventMethod.unbind(node,type,n[type].handler);
                    delete n[type];
                    var j = 0,m;
                    for(m in n){j++};
                    
                    if(j === 1) eventMapList.splice(i,1);
                    return false;
                }
            });
        }else{
            cp.each(eventMapList,function(n,i){
                if(n.node === node){
                    eventMapList.splice(i,1);
                    for(var m in n){
                        m !== "node" && eventMethod.unbind(node,type,n[type].handler);
                    }
                    return false;
                }
            });
        }
    };
    
    //触发事件
    cp.trigger = function(node,type,args){
        var e;
        cp.each(eventMapList,function(n,i){
            if(n.node === node && n[type]){
                n[type].handler.apply(node,cp.merge([e],args));
            }
        });
    };
    
    cp.off = function(node,type){
        cp.unbind(node,type);
    };
})();