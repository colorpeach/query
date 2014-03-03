(function(){
    var guid = 0;
    
    cp.vm = function(m,c){
        return new VM(c,m);
    };
    
    //验证器
    cp.vm.valid = {};
    
    //编辑类型
    cp.vm.editor = {
        text:"",
        number:"",
        list:""
    };
    
    function VM(context,model){
        this.$box = context||document;
        //以uid为索引的model单元
        this.dataUIdMap = {};
        //以name为索引的model单元
        this.dataNameMap = {};
        //数据
        this.data = {};
        //初始化时的viewModel
        this.model = model;
        this.parseModel();
        this._setEvent();
    }
    
    VM.prototype = {
        //负责解析model
        parseModel:function(node){
            var self = this,
                model = self.model;
                
            cp.each(node ? [node] : self.$box.querySelectorAll("[data-class]"),function(n){
                var dataClass = n.getAttribute("data-class").split(" "),
                    classN,
                    classNList;
                
                classN = self.dataUIdMap[n.dcId || (n.dcId = ++guid)] = {dom:n,dcId:n.dcId,dataClass:dataClass.join(" ")};
                
                //继承所有类的属性
                cp.each(dataClass,function(m,j){
                    if(m in model){
                        cp.extend(classN,model[m]);
                    }
                });
                
                //继承的类中都没有name属性，取第一个类名做为name
                !classN.name && (classN.name = dataClass[0]);
                
                //生成以name为索引的model
                classNList = self.dataNameMap[classN.name];
                if(classNList){
                    self._replaceInNameMap(classNList,classN);
                }else{
                    self.dataNameMap[classN.name] = [classN];
                }
            });
            console.log(self.dataUIdMap,self.dataNameMap);
        },
        //在dataNameMap中找相应的model单元，找到了替换掉，没找到加上
        _replaceInNameMap:function(classNList,classN){
            for(var i=0,len=classNList.length;i<len;i++){
                if(classNList[i].dcId === classN.dcId){
                    classNList.splice(i,1,classN);
                    return;
                }
            }
            classNList.push(classN);
        },
        toEdit:function(){
            
        },
        toView:function(){
            
        },
        renderData:function (name,data){
            var self = this,
                model = self.dataNameMap;
            
            //传入的第一个参数是对象
            if(cp.isObject(name)){
                for(var n in name){
                    self.renderData(n,name[n]);
                }
            }else{
            //传入的第一个参数是字符串
                data == undefined ? (data = self.data[name]):(self.data[name] = data);
                if(name in model){
                    cp.each(model[name],function(m,j){
                        var val = self.formatCellVal(m,{cell:data,data:self.data});
                        self.setCellVal(m.dom,val == undefined ? data:val);
                    });
                }else{
                    self.setCellVal($self.$box.querySelectorAll("[data-class*="+i+"]"),n);
                }
            }
        },
        //调用model单元的formatter
        formatCellVal:function(modelCell,data){
            if(modelCell.formatter){
                return modelCell.formatter(modelCell.dom,data);
            }
        },
        //设置对应view单元的值
        setCellVal:function(node,val){
            if(node.value !== undefined){
                node.value = val;
            }else{
                node.innerHTML = val;
            }
        },
        addDataClass:function(name,className){
            var self = this,
                model = self.dataNameMap;
            if(name in model){
                cp.each(model[name],function(n,i){
                    var dom = n.dom,
                        dataClass = cp.trim(dom.getAttribute("data-class"));
                    
                    if((" "+dataClass+" ").indexOf(" "+className+" ")<0){
                        dom.setAttribute("data-class",dataClass+" "+className);
                        self.parseModel(dom);
                        self.renderData(name);
                    }
                });
            }
        },
        removeDataClass:function(name,className){
            var self = this,
                model = self.dataNameMap;
            if(name in model){
                cp.each(model[name],function(n,i){
                    var dom = n.dom,
                        dataClass = " "+cp.trim(dom.getAttribute("data-class"))+" ";
                    
                    if(dataClass.indexOf(" "+className+" ")>-1){
                        dom.setAttribute("data-class",cp.trim(dataClass.replace(" "+className+" "," ")));
                        self.parseModel(dom);
                        self.renderData(name);
                    }
                });
            }
        },
        setData:function(name,val){
            if(cp.isObject(name)){
                this.renderData(this.data = name);
            }else{
                this.renderData(name,val == undefined ? this.data[name]:val);
            }
        },
        getData:function(name){
            return name ? this.data[name]:this.data;
        },
        _catchChange:function(node,fn){
            if(node.addEventListener){
                node.addEventListener("input",function(){},false)
            }else{
                node.attachEvent("onpropertychange",function(){});
            }
        },
        _removeCatch:function(node,fn){
            if(node.addEventListener){
                node.removeEventListener("input",function(){},false)
            }else{
                node.detachEvent("onpropertychange",function(){});
            }
        },
        _setEvent:function(){
            var self = this,
                dataUIdMap = self.dataUIdMap,
                data = self.data;
            
            cp.bind(document,"focusin",function(e){
                var dom = e.target;
                
                if(dom.dcId && dataUIdMap[dom.dcId].formatter){
                    dom.value = data[dataUIdMap[dom.dcId].name];
                }
            });
            
            cp.bind(document,"focusout",function(e){
                var dom = e.target,
                    modelCell;
                
                if(dom.dcId){
                    modelCell = dataUIdMap[dom.dcId];
                    self.setData(modelCell.name,dom.value);
                }
            });
        }
    };
    
})();

var model = {
    modelCell:{
        name:"",
        formatter:function(){},
        editable:true,
        editType:"text",
        validation:("required number"||function(){}),
        event:{
            delegate:{
                target:"",
                click:function(){}
            },
            click:function(){}
        }
    }
};
