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
    
    var _ = VM.prototype = {
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
                        cp.extend(true,classN,model[m]);
                    }
                });
                
                //bind event
                classN.event && (self._unbindEvent(classN),self._bindEvent(classN));
                
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
                hasPrefix = new RegExp("^"+prefix+"\\[\\]");
            
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
                
                //bind event
                classN.event && (self._unbindEvent(classN),self._bindEvent(classN));
                
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
        _unbindEvent:function(modelCell){
            cp.unbind(modelCell.dom);
        },
        _bindEvent:function(modelCell){
            var node = modelCell.dom,
                events = modelCell.event,
                self = this;
            cp.each(events,function(n,i){
                cp.bind(node,i,function(e){n.call(node,e,self._generateArgs(modelCell.dcId))});
            });
        },
        _generateArgs:function(dcId){
            var modelCell = this.dataUIdMap[dcId],
                index = cp.inArray(modelCell,this.dataNameMap[modelCell.name]);
            return {
                model:modelCell,
                index:index<0?0:index,
                cell:this.get(modelCell.name)
            };
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
                        if(obj.index){
                            //a[1]
                            var n = self.dataNameMap[m][obj.index[0]];
                            if(n){
                                Dom.remove(n.dom);
                                self.dataNameMap[m].splice(obj.index[0],1);
                                delete self.dataUIdMap[n.dcId];
                            }
                        }else{
                            //a[]
                            cp.each(self.dataNameMap[m]||[],function(n){
                                if(self.dataUIdMap[n.dcId]){
                                    Dom.remove(self.dataUIdMap[n.dcId].dom);
                                    delete self.dataUIdMap[n.dcId];
                                }
                            });
                            delete self.dataNameMap[m];
                        }
                    }
                }
            }else if(obj.arrayName){
                var n = self.dataNameMap[obj.arrayName];
                if(obj.index){
                    //a[1].b
                    if(n){
                        Dom.remove(n[obj.index[0]].dom);
                        delete self.dataUIdMap[n[obj.index[0]].dcId];
                        n[obj.index[0]] = undefined;
                    }
                }else{
                    //a[].b
                    cp.each(n,function(n,i){
                        if(n){
                            Dom.remove(n.dom);
                            delete self.dataUIdMap[n.dcId];
                        }
                    });
                    self.dataNameMap[obj.arrayName] = [];
                }
            }
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
            if(modelCell.view){
                return modelCell.view(modelCell.dom,data);
            }
        },
        //set cell val
        setCellVal:function(node,val){
            if(typeof val === "string"){
                if(node.value !== undefined){
                    node.value = val;
                }else{
                    node.innerHTML = val;
                }
            }
        },
        _dealArrayData:function(name,data,cover){
            var frag = document.createDocumentFragment(),
                template = this._getTemplate(name+"[]"),
                dom = document.createElement("div"),
                parent = this.dataNameMap[name];
            
            //if update array data,need delete old array data and dom
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
            var modelCells = this.model[name],
                template = modelCells.template;
           
            if(template)
                return (typeof template === "string" ? document.getElementById(template):template).innerHTML;
            else
                return "";
        },
        add:function(name,data){
            this._dealArrayData(name.replace(/\[\]$/,""),data.length ? data : [data]);
        },
        del:function(name){
            var reg = /\[\d*\]\./,
                reg1 = /\[\d*\]$/,
                obj = {name:name};
            //if match number,user arrayName;if match [],use preifx;otherwise just use name
            if(reg1.test(name)){
                var index = [];
                name = name.replace(/\[\d+\]$/,function(v){
                    index.push(v.slice(1,-1));
                    return "[]";
                });
                if(index.length)
                    obj = {prefix:name,index:index};
                else
                    obj = {prefix:name};
            }else if(reg.test(name)){
                var index = [];
                name = name.replace(/\[\d+\]\./,function(v){
                    index.push(v.slice(1,-2));
                    return "[].";
                });
                if(index.length)
                    obj = {arrayName:name,index:index};
                else
                    obj = {arrayName:name};
            }
            this._deleteModelCells(obj);
        },
        set:function(name,val){
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
        get:function(name){
            return name ? this._getOrSetData(this.data,name):this.data;
        },
        //replace ? with the second argument
        _formatName:function(name,arg){
            if(typeof arg === "string")
                arg = arg.split(",");
            return name.replace(/\?/g,function(){
                var str = arg.shift();
                return str == undefined ? "":str;
            });
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
                
                if(dom.dcId && dataUIdMap[dom.dcId].view){
                    dom.value = data[dataUIdMap[dom.dcId].name];
                }
            });
            
            cp.bind(document,"focusout",function(e){
                var dom = e.target,
                    modelCell;
                
                if(dom.dcId){
                    modelCell = dataUIdMap[dom.dcId];
                    self.set(modelCell.name,dom.value);
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
        },
        _editOrView:function(name,type){
            var modelCells = this.dataNameMap[name],
                editable = type === "edit"?true:false;
            cp.each(modelCells,function(n){
                var node = n.dom;
                
                if(node.nodeType === 1 && formType.indexOf("|"+node.type+"|")>-1){
                    node.readOnly = !editable;
//                     node.disabled = !editable;
                }
            });
        },
        toEdit:function(name){
            this._editOrView(name,"edit");
        },
        toView:function(name){
            this._editOrView(name);
        }
    };
    
    var formType = "|button|checkbox|file|hidden|image|password|radio|reset|submit|text|";
    
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
        view:function(){},
        editable:true,
        editor:"text",
        validation:("required number"||function(){}),
        keyBridge:{
            enter:"click",
            13:"click",
            "shift && enter":"click"
        },
        delegate:{
            target:"",
            click:function(){}
        },
        event:{
            click:function(){}
        }
    },
    "list[]":{
        template:"list-template"
    }
};
