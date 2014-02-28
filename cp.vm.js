(function(){
    var guid = 0;
    
    cp.vm = function(m,c){
        return new VM(c,m);
    };
    
    cp.vm.valid = {};
    
    function VM(context,model){
        this.$box = context||document;
        this.dataMap = {};
        this.parseModel(model);
    }
    
    VM.prototype = {
        //负责解析model
        parseModel:function(model){
            var self = this,
                $box = self.$box;
            
            cp.each(model,function(n,i){
                var $this = $box.querySelectorAll("[data-class*="+i+"]");
                
                cp.each($this,function(m,j){
                    if(m.dcId)return;
                    var dataClass = m.getAttribute("data-class").split(" ");
                    
                    var classN = self.dataMap[m.dcId = ++guid] = {dom:m};
                    
                    cp.each(dataClass,function(h,k){
                        cp.extend(classN,model[h]);
                    });
                    
                    !classN.name && (classN.name = dataClass[0]);
                });
            });
        },
        renderData:function(data){
            var self = this,
                model = this.dataMap;
            
            self.data = {};
            
            cp.each(model,function(n,i){
                var name = n.name,
                    val,
                    formatVal;
                
                if(name in data){
                    self.data[name] = val = data[name];
                    delete data[name];
                    
                    if(n.formatter){
                        formatVal = n.formatter(n.dom,{cell:val,data:data});
                        formatVal != undefined && (val = formatVal);
                    }
                    
                    if(n.dom.value !== undefined){
                        n.dom.value = val;
                    }else{
                        n.dom.innerHTML = val;
                    }
                }
            });
            
            cp.each(data,function(n,i){
                cp.each(self.$box.querySelectorAll("[data-class*="+i+"]"),function(m,j){
                    delete data[i];
                    if(m.value !== undefined){
                        m.value = n;
                    }else{
                        m.innerHTML = n;
                    }
                })
            });
        },
        addClass:function(name,className){
            
        },
        removeClass:function(name,className){
            
        },
        setData:function(name){
            
        },
        getData:function(name){
            return this.data;
        }
    };
    
})();
