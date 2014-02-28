module("cp.aspect");

test( "cp.aspect", function() {
	var o = {f:function(i){return cp.toArray(arguments);}};
	
	cp.aspect.before(o,"f",function(i){return i;},"b1");
	
	deepEqual(o.f(1),[1,1],"cp.aspect.before : arguments right,passed;");
	
	cp.aspect.after(o,"f",function(){return cp.toArray(arguments)},"a1");
	
	deepEqual(o.f(1),[1,1,1],"cp.aspect.after : arguments right,passed;");
	
	cp.aspect.remove(o,"f","b1");
	
	deepEqual(o.f(2,1),[2,1,2,1],"cp.aspect.remove : remove before passed;");
	
	cp.aspect.remove(o,"f","a1");
	
	deepEqual(o.f(2,1),[2,1],"cp.aspect.remove : remove after passed;");
});