(function(){
    var guid = 0;
    
    cp.vm = function(m,c){
        return new VM(c,m);
    };
    
    //楠岃瘉鍣�
    cp.vm.valid = {};
    
    //缂栬緫绫诲瀷
    cp.vm.editor = {
        text:"",
        number:"",
        list:""
    };
    
    function VM(context,model){
        this.$box = context||document;
        //浠id涓虹储寮曠殑model鍗曞厓
        this.dataUIdMap = {};
        //浠ame涓虹储寮曠殑model鍗曞厓
        this.dataNameMap = {};
        //鏁版嵁
        this.data = {};
        //鍒濆鍖栨椂鐨剉iewModel
        this.model = model;
        this.parseModel();
        this._setEvent();
    }
    
    VM.prototype = {
        //璐熻矗瑙ｆ瀽model
        parseModel:function(node){
            var self = this,
                model = self.model;
                
            cp.each(!node ? self.$box.querySelectorAll("[data-class]") : node.length ? node : [node],function(n){
                var dataClass = n.getAttribute("data-class").split(" "),
                    classN,
                    classNList;
                
                classN = self.dataUIdMap[n.dcId || (n.dcId = ++guid)] = {dom:n,dcId:n.dcId,dataClass:dataClass.join(" ")};
                
                //缁ф壙鎵€鏈夌被鐨勫睘鎬�
                cp.each(dataClass,function(m,j){
                    if(m in model){
                        cp.extend(classN,model[m]);
                    }
                });
                
                //缁ф壙鐨勭被涓兘娌℃湁name灞炴€э紝鍙栫涓€涓被鍚嶅仛涓簄ame
                !classN.name && (classN.name = dataClass[0]);
                
                //鐢熸垚浠ame涓虹储寮曠殑model
                classNList = self.dataNameMap[classN.name];
                if(classNList){
                    self._replaceInNameMap(classNList,classN);
                }else{
                    self.dataNameMap[classN.name] = [classN];
                }
            });
            console.log(self.dataUIdMap,self.dataNameMap);
        },
        //鍦╠ataNameMap涓壘鐩稿簲鐨刴odel鍗曞厓锛屾壘鍒颁簡鏇挎崲鎺夛紝娌℃壘鍒板姞涓�
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
            
            //浼犲叆鐨勭涓€涓弬鏁版槸瀵硅薄
            if(cp.isObject(name)){
                for(var n in name){
                    self.renderData(n,name[n]);
                }
            }else{
            //浼犲叆鐨勭涓€涓弬鏁版槸瀛楃涓�
                data == undefined ? (data = self._getOrSetData(self.data,name)):(self._getOrSetData(self.data,name,data));
                var index = [],
                    formatName;
                formatName = name.replace(/\d+/g,function(n){index.push(n);return "";});
                if(formatName in model){
                    name = formatName;
                    cp.each(!index.length ? model[name]:[model[name][index.shift()]],function(m,j){
                        var val = self.formatCellVal(m,{cell:data,data:self.data});
                        self.setCellVal(m.dom,val == undefined ? data:val);
                    });
                }
                
                //TODO
                if(cp.isArray(data)){
                    this._renderArrayData(name,data);
                }else if(cp.isObject(data)){
                    for(var n in data){
                        self.renderData(name+"."+n,data[n]);
                    }
                }
            }
        },
        //璋冪敤model鍗曞厓鐨刦ormatter
        formatCellVal:function(modelCell,data){
            if(modelCell.formatter){
                return modelCell.formatter(modelCell.dom,data);
            }
        },
        //璁剧疆瀵瑰簲view鍗曞厓鐨勫€�
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
        _parseArrayModel:function(node){
            
        },
        _renderArrayData:function(name,data){
            var frag = document.createDocumentFragment(),
                template = this._getTemplate(name),
                dom = document.createElement("div"),
                parent = this.dataNameMap[name+"[]"][0].dom;
            
            for(var i=0,len=data.length;i<len;i++){
                dom.innerHTML = template;
                
                this.parseModel(dom.querySelectorAll("[data-class]"));
                
                for(var n in data[i]){
                    this.renderData(name+"["+i+"]."+n,data[i][n]);
                }
                while(dom.firstChild)
                    frag.appendChild(dom.firstChild);
            }
            
            parent.appendChild(frag);
        },
        _getTemplate:function(name){
            var id = this.dataNameMap[name+"[]"][0];
            
            if(id && (id = id.template))
                return (typeof id === "string" ? document.getElementById(id):id).innerHTML;
            else
                return "";
        },
        addData:function(){
            
        },
        removeData:function(){
            
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
    },
    "list[]":{
        template:"list-template"
    }
};
