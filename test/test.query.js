module("cp.query");

test("cp.query support",function(){
	ok(cp.query("body")[0].nodeType, "get element success");
});

test( "cp.query().data", function(assert) {
	var el = cp.query("div"),
			data = "333";
			
	el.data("test",data);
	
  assert.equal( el.data("test"), data, "data:getter and setter passed" );
	
	el.removeData("test");
	assert.equal( el.data("test"), undefined,"removeData:data remove success");
});