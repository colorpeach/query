module("cp.core");

test("__proto__", function(){
	var o = {c:1},
			arr = [];
	arr.__proto__ = o;
	equal(arr.c,1,"support export __proto__");
});

test( "cp.each", function() {
	var arr = [1,23,4];
  deepEqual( cp.each(arr), arr, "return array same to origin array" );
});

test("cp.merge", function(){
	var arr1 = [2,3,4],
			arr2 = [1,3,"d"],
			arr3 = [2,3,4,1,3,"d"];
			
	deepEqual( cp.merge(arr1,arr2),arr3,"merge passed");
});