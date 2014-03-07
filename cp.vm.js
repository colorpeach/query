(function(){
    var guid = 0;
    
    cp.vm = function(m,c){
        return new VM(c,m);
    };
    
    //config validation
    cp.vm.valid = {};
    
    //config editor
    cp.vm.editor = {
        text:"",
        number:"",
        list:""
    };
    
    function VM(context,model){
        this.$box = context||document;
        //uid data map
        this.dataUIdMap = {};
        //name data map
        this.dataNameMap = {};
        //data
        this.data = {};
        //viewModel
        this.model = model;
        this.parseModel();
        this._setEvent();
    }
    
    VM.prototype = {
        //generate viewModel
        parseModel:function(node){
            var self = this,
                model = self.model;
                
            cp.each(!node ? self.$box.querySelectorAll("[data-class]") : node.length == undefined ? [node]:node,function(n){
                var dataClass = n.getAttribute("data-class").split(" "),
                    classN,
                    classNList;
                
                classN = self.dataUIdMap[n.dcId || (n.dcId = ++guid)] = {dom:n,dcId:n.dcId,dataClass:dataClass.join(" ")};
                
                //generate viewModel cell
                cp.each(dataClass,function(m,j){
                    if(m in model){
                        cp.extend(classN,model[m]);
                    }
                });
                
                //if viewModel cell has no name,use the first data-class
                !classN.name && (classN.name = dataClass[0]);
                
                //generate viewModel with name
                classNList = self.dataNameMap[classN.name];
                if(classNList){
                    self._replaceInNameMap(classNList,classN);
                }else{
                    self.dataNameMap[classN.name] = [classN];
                }
            });
            console.log(self.dataUIdMap,self.dataNameMap);
        },
        //update viewModel cell in dataNameMap,if found,replace,otherwise,add
        _replaceInNameMap:function(classNList,classN){
            for(var i=0,len=classNList.length;i<len;i++){
                if(classNList[i].dcId === classN.dcId){
                    classNList.splice(i,1,classN);
                    return;
                }
            }
            classNList.push(classN);
        },
        _parseArrayModel:function(nodes,prefix){
            var self = this,
                model = self.model,
                prefix = prefix || "";
                hasPrefix = new RegExp("^"+prefix+"[]");
            
            cp.each(nodes,function(n){
                var dataClass = n.getAttribute("data-class").split(" "),
                    classN,
                    classNList;
                
                classN = self.dataUIdMap[n.dcId || (n.dcId = ++guid)] = {dom:n,dcId:n.dcId,dataClass:dataClass.join(" ")};
                
                cp.each(dataClass,function(m,j){
                    if(m in model){
                        cp.extend(classN,model[m]);
                    }
                });
                
                !classN.name && (classN.name = dataClass[0]);
                
                hasPrefix.test(classN.name) || (classN.name  = prefix + "[]." + classN.name);
                
                classNList = self.dataNameMap[classN.name];
                if(classNList){
                    self._replaceInNameMap(classNList,classN);
                }else{
                    self.dataNameMap[classN.name] = [classN];
                }
                
            });
        },
        _deleteModelCells:function(obj){
            var self = this;
            if(obj.dcId){
                if(self.dataUIdMap[obj.dcId]){
                    Dom.remove(self.dataUIdMap[obj.dcId].dom);
                    delete self.dataUIdMap[obj.dcId];
                }
                cp.each(self.dataNameMap,function(n){
                    for(var i=0,l=n.length;i<l;i++){
                        if(n[i].dcId === obj.dcId){
                            n.splice(i,1);
                            return;
                        }
                    }
                });
            }else if(obj.name){
                cp.each(self.dataNameMap[obj.name]||[],function(n){
                    if(self.dataUIdMap[n.dcId]){
                        Dom.remove(self.dataUIdMap[n.dcId].dom);
                        delete self.dataUIdMap[n.dcId];
                    }
                });
                delete self.dataNameMap[obj.name];
            }else if(obj.prefix){
                var reg = new RegExp("^"+obj.prefix.replace(/\[/g,"\\[").replace(/\]/g,"\\]").replace(/\./g,"\\."));
                for(var m in self.dataNameMap){
                    if(reg.test(m)){
                        cp.each(self.dataNameMap[m]||[],function(n){
                            if(self.dataUIdMap[n.dcId]){
                                Dom.remove(self.dataUIdMap[n.dcId].dom);
                                delete self.dataUIdMap[n.dcId];
                            }
                        });
                        delete self.dataNameMap[m];
                    }
                }
            }else if(obj.arrayName){
                var index = [],
                    model,
                    formatName;
                formatName = obj.arrayName.replace(/\d+/g,function(n){index.push(n);return "";});
                
                index.length && (model = self.dataNameMap[formatName]);
                if(model[index[0]]){
                    Dom.remove(model[index[0]].dom);
                    model.splice(index[0],1);
                    delete self.dataUIdMap[model.dcId];
                }
            }
        },
        toEdit:function(){
            
        },
        toView:function(){
            
        },
        renderData:function (name,data){
            var self = this,
                model = self.dataNameMap;
            
            //first argument is a object
            if(cp.isObject(name)){
                for(var n in name){
                    self.renderData(n,name[n]);
                }
            }else{
            //render a part of this.data
                data == undefined ? (data = self._getOrSetData(self.data,name)):(self._getOrSetData(self.data,name,data));
                
                //for name include "[number]"
                var index = [],
                    formatName;
                formatName = name.replace(/\-*\d+/g,function(n){index.push(n);return "";});
                
                if(formatName in model){
                    name = formatName;
                    model = model[name];
                    //add "[].data.name" data
                    model = !index.length ? model : [index[0]<0?model[model.length-1]:model[index[0]]];
                    //TODO need a method to get a right model
                    cp.each(model,function(m,j){
                        var val = self.formatCellVal(m,{cell:data,data:self.data});
                        self.setCellVal(m.dom,val == undefined ? data:val);
                    });
                }
                
                if(cp.isArray(data)){
                    //data is a array,need use special render method
                    this._dealArrayData(name,data,true);
                }else if(cp.isObject(data)){
                    for(var n in data){
                        self.renderData(name+"."+n,data[n]);
                    }
                }
            }
        },
        //format cell
        formatCellVal:function(modelCell,data){
            if(modelCell.formatter){
                return modelCell.formatter(modelCell.dom,data);
            }
        },
        //set cell val
        setCellVal:function(node,val){
            if(node.value !== undefined){
                node.value = val;
            }else{
                node.innerHTML = val;
            }
        },
        _dealArrayData:function(name,data,cover){
            var frag = document.createDocumentFragment(),
                template = this._getTemplate(name),
                dom = document.createElement("div"),
                parent = this.dataNameMap[name+"[]"];
                
            cover && this._deleteModelCells({prefix:name+"[]."});
            
            for(var i=0,len=data.length;i<len;i++){
                dom.innerHTML = template;
                
                this._parseArrayModel(dom.querySelectorAll("[data-class]"),name);
                
                for(var n in data[i]){
                    if(cover){
                        //
                        this.renderData(name+"["+i+"]."+n,data[i][n]);
                    }else{
                        //add data
                        this.renderData(name+"["+(i+(this.dataNameMap[name+"[]."+n]||[]).length-1)+"]."+n,data[i][n]);
                    }
                }
                while(dom.firstChild)
                    frag.appendChild(dom.firstChild);
            }
            
            cp.each(parent,function(n,i){
                n.dom.appendChild(frag);
            });
        },
        _renderArrayData:function(){
            
        },
        //get template by the template model cell
        _getTemplate:function(name){
            var modelCells = this.dataNameMap[name+"[]"],
                template;
            
            //find template from modelCells
            cp.each(modelCells,function(n,i){
                if(n.template){
                    template = n.template;
                    return false;
                }
            });
            
            if(template)
                return (typeof template === "string" ? document.getElementById(template):template).innerHTML;
            else
                return "";
        },
        addData:function(name,data,index){
            this._dealArrayData(name,data.length ? data : [data]);
        },
        removeData:function(name){
            var reg = /\[\d+\]\./,
                reg2 = /\[\]$/;
            this._deleteModelCells(reg.test(name)?{arrayName:name}:reg2.test(name)?{prefix:name+"."}:{name:name});
        },
        setData:function(name,val){
            if(cp.isObject(name)){
                this.renderData(this.data = name);
            }else{
                this.renderData(name,val == undefined ? this.data[name]:val);
            }
        },
        _getOrSetData:function(data,name,val){
            var names = name.split(/\.|\[|\]\./g),
                name;
            
            if(val != undefined)name = names.pop();
            
            while(names.length && cp.isObject(data = data[names.shift()])){}
            
            if(data != undefined && val != undefined)
                data[name] = val;
            else
                return data || {};
        },
        getData:function(name){
            return name ? this._getOrSetData(this.data,name):this.data;
        },
        _catchChange:function(node,fn){
            //TODO
            if(node.addEventListener){
                node.addEventListener("input",function(){},false)
            }else{
                node.attachEvent("onpropertychange",function(){});
            }
        },
        _removeCatch:function(node,fn){
            //TODO
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
        }
    };
    
    var Dom = {
        remove:function(elt){
          if(elt.parentNode)
            elt.parentNode.removeChild(elt);
        }
    };
    
    var definePro = {
            set:"",
            get:""
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
    },
    "list[]":{
        template:"list-template"
    }
};
