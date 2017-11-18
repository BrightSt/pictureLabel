var rootPath = "http://127.0.0.1:8080/pictureLabel";
var tomcatPath = "http://127.0.0.1:8080";
var imgPath= "";
var elements = [];
var pictureId = "";
var factoryCode = "";
var again_label ="0"; // 是否是已标注再次标注，1：重新标注2.标注
$(function() {
    $(".loader").fadeOut(500, function() {
        $(".page_wrapper").show();
    });
    
    //Create a canvas
    var canvas = new fabric.Canvas('c', {
        isDrawingMode: false,
        selection: false
    });
    //fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
    //Drag&drop area settings
    $('[name="image"]').ezdz({
        text: '<p>Drop or select a picture<p>',
        validators: {
            maxSize: 4000000
        },
        reject: function(file, errors) {
            if (errors.mimeType) {
                alert(file.name + ' must be jpg or png.');
            }
            if (errors.maxSize) {
                alert(file.name + ' must be size:4mb max.');
            }
        }
    });

    //Canvas background color
    $('.canvas-background-color').minicolors({
        defaultValue: '#fff',
    });
    var canvasbcolor = $(".canvas-background-color").val();
    canvas.backgroundColor = canvasbcolor;
    canvas.renderAll();

    $(".canvas-background-color").on("change", function() {
        var canvasbcolor = $(".canvas-background-color").val();
        canvas.backgroundColor = canvasbcolor;
        canvas.renderAll();
    });

    //Make an image canvas background
    $("#image-background").click(function() {
        var x = $('.ezdz-dropzone img').attr('src');
        canvas.setBackgroundImage(x,
            canvas.renderAll.bind(canvas), {
                width: 500,
                height: 400,
                backgroundImageStretch: false
            });

        $("#c").css("border", "none");
        return false;
    });

    //Add an image to canvas
    $("#image-on").click(function() {
        var x2 = $('.ezdz-dropzone img').attr('src');

        fabric.Image.fromURL(x2, function(oImg) {
            canvas.add(oImg);

        }, {
            "scaleX": 0.40,
            "scaleY": 0.40
        });

        $("#c").css("border", "none");
        return false;
    });

    //Default text color
    $('.text-color').minicolors({
        defaultValue: '#333',
    });

    //Hit enter and add text
    $('#text').bind('change keyup input', function(e) {
    	var flag = true;
        var key = e.which;
        var myText = $("#text").val();
        if (key == 13) {
        	
        	/*// 获取工厂number
            var myText = $("#text").val();
            $("#text").val('');
            $.ajax({
    			type:"post",
    			url:rootPath+"/deviceInfo/numberGenerate.do",
    			async:false,
    			success:function(result){
    				if(result.success == true){
    					myText = myText+"_"+result.data;
    				}
    		    },
    			error:function(parame){
    			}
    		});*/
        	//验重
        	
        	if(elements.length>0){
        		for(k=0;k<elements.length;k++){
            		if(myText==elements[k].eiNumber){
            			alert("输入编号重复，请重输！")
     					$("#floor").val('');
     					$("#quipmentId").val('');
     					$("#element_type").val('');
     					$("#substanceStatus").val('');
     					$("#difficult").val('');
     					flag = false;
            	        return false;
            		}
            	}
        	}
        	 $("#text").val('');
        	 var reg = new RegExp(/^[0-9A-Za-z]+$/);
        	    if (!reg.test(myText)) {
        	    	alert("请输入10位以内字母或数字组合！")
 					$("#floor").val('');
 					$("#quipmentId").val('');
 					$("#element_type").val('');
 					$("#substanceStatus").val('');
 					$("#difficult").val('');
 					flag = false;
        	        return false;
        	    }
        	 
        	 
            
             $.ajax({
     			type:"post",
     			url:rootPath+"/deviceInfo/checkElementNumber.do",
     			async:false,
     			data:{"eiNumber":myText},
     			success:function(result){
     				if(result.success == true){
     					alert("组件编号重复，请重输！")
     					$("#floor").val('');
     					$("#quipmentId").val('');
     					$("#element_type").val('');
     					$("#substanceStatus").val('');
     					$("#difficult").val('');
     					flag=false;
     				}
     		    },
     			error:function(parame){
     			}
     		});
            if(flag==true){
            	var mycolor = $(".text-color").val();
                var myfont = $("#text-font option:selected").val();

                var  line = makeLine([ 150, 100, 250, 175 ]);
                canvas.add(line);
                canvas.add(
                	    makeCircle(line.get('x1'), line.get('y1'), null, line,null,null,myText,myfont,mycolor),
                	    makeCircle1(line.get('x2'), line.get('y2'), line)
                	  );
                	  canvas.on('object:moving', function(e) {
                	    var p = e.target;
                	    p.line1 && p.line1.set({ 'x2': p.left, 'y2': p.top });
                	    p.line2 && p.line2.set({ 'x1': p.left, 'y1': p.top });
                	    canvas.renderAll();
                	  });
                
                // 获取原有数据，保存
            	var equipment = $("#quipmentId option:selected").val();
            	var elementType = $("#element_type option:selected").val();
            	var substanceStatus =$("#substanceStatus option:selected").val();
            	var difficult = $("#difficult option:selected").val();
            	var floor = $("#floor").val();
            	var obj = {};
            	obj.eiNumber = myText;
            	obj.factoryNumber=factoryCode;
            	obj.devicecode = equipment;
            	obj.eiType = elementType;
            	obj.mediumStatus = substanceStatus;
            	obj.isdifficult = difficult;
            	obj.floor=floor;
            	obj.pidNumber = imgPath;
            	obj.pid = pictureId;
            	elements.push(obj);
            	// 按下enter键，清空原有数据
            	$("#quipmentId option:first").prop("selected", 'selected'); 
            	$("#element_type option:first").prop("selected", 'selected'); 
            	$("#substanceStatus option:first").prop("selected", 'selected'); 
            	$("#difficult option:first").prop("selected", 'selected'); 
            	$("#floor").val("");
                $("#selection").trigger("click");
            }
            
        }
        return false;
    });

    //Defaut draw color
    $('.draw-color').minicolors({
        defaultValue: '#333',
    });

    //Click button and start to draw
    $("#draw").click(function() {
        canvas.isDrawingMode = true;
        $(".draw-color").on("change", function() {
            var mycolor = $(".draw-color").val();
            canvas.freeDrawingBrush.color = mycolor;
            return false;
        });

        canvas.renderAll();
        $(this).addClass('active');
        $("#selection").removeClass('active');
        return false;
    });

    //Click button to activate selection mode
    $("#selection").addClass('active');
    $("#selection").click(function() {
        canvas.isDrawingMode = false;
        $(this).addClass('active');
        $("#draw").removeClass('active');
        return false;
    });

    //Update brush width
    $("#range").on("change", function() {
        var rangeVal = $(this).val();
        $("#value").val(rangeVal);
        canvas.freeDrawingBrush.width = rangeVal;
        return false;
    });

    $("#value").on("keyup", function() {
        var rangeShownVal = $(this).val();
        if (rangeShownVal < 51) {
            $("#range").val(rangeShownVal);
            canvas.freeDrawingBrush.width = rangeShownVal;
        } else {
            alert("Max is 50");
            var rangeVal2 = $("#range").val();
            $("#value").val(rangeVal2);
        }
        return false;
    });

    //Delete selected object
    function deleteObjects() {
        var activeObject = canvas.getActiveObject(),
            activeGroup = canvas.getActiveGroup();
        if (activeObject) {
            if (confirm('确定删除?')) {
                canvas.remove(activeObject);
                canvas.remove(activeObject.line2); // 删除组件编号关联的线条
                // 删除elements里的数据
                var text = activeObject.text;
                if(text!=""){
                	if(elements.length>0){
                		for(var i = 0;i<elements.length;i++){
                			if(elements[i].eiNumber == text){
                				elements.remove(i);
                			}
                		}
                	}
                }
            }
        }
    };
    $("#delete").click(function() {
        deleteObjects();
        return false;
    });

    //Clear canvas
    $("#delete-all").click(function() {
        if (confirm('确定删除?')) {
            canvas.backgroundImage = false;
            canvas.clear();
            elements = [];
        }
        return false;
    });

    //Save canvas as image
    $("#save").click(function() {
    	// 校验elements 是否为空
    	if(elements.length<=0){
    		alert("保存失败！图片没有标注组件");
    		return ;
    	}
    	//判断是否添加重复组件编号
    	debugger;
    	
    	for(var i=0;i<elements.length;i++) {
    		for(var j=i+1;j<elements.length;j++){
    			var a = elements[i].eiNumber;
    			var b = elements[j].eiNumber;
    			if(a==b){
    				alert("添加了重复组件编号，请更正：" );
        			return ;
    			}
    		}
    			
    	
    	}
  
    	// 保存组件数据
    	// 1.文件名
    	// 2.保存地址_label
    	$.commonReq({
				url:rootPath+'/devicePicture/savePicture.do',
				data:{"name":imgPath,"base64":canvas.toDataURL('jpg')},//
				success: function(data) {
					if(data.success){
				    	// 更新图档数据
				    	$.commonReq({
				    		url:rootPath+"/devicePicture/updateByPrimaryKeySelective.do",
				    		data:{"id":pictureId,"newName":imgPath},
				    		success:function(){
				    			if(again_label == "1"){
						    		// 重新标注
						        	$.ajax({
						        		type: 'POST',
						        		url:rootPath+"/deviceInfo/saveElementsAndDeleteBef.do",
						        		dataType: 'json',
						        		contentType: "application/json",
						        		data:JSON.stringify(elements),
						        		success:function(){
						        			alert("保存成功");
						        			canvas.clear();
						                    elements = [];
						        		}
						        	});
						    	}else{
						    	    // 第一次标注
						        	$.ajax({
						        		type: 'POST',
						        		url:rootPath+"/deviceInfo/saveElements.do",
						        		dataType: 'json',
						        		contentType: "application/json",
						        		data:JSON.stringify(elements),
						        		success:function(){
						        			alert("保存成功");
						        			canvas.clear();
						                    elements = [];
						        		}
						        	});
						    	}
				    		}
				    	});
						
					}else{
						alert("保存失败")
					}
					
            },
            error:
                function(xhr,status,e){
//           		bootbox.alert('服务器请求失败');
            }
		});
//    	var save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
//       save_link.href = canvas.toDataURL('png');
//       
//        save_link.download = "a.png";
//        var event = document.createEvent('MouseEvents');
//        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
//        save_link.dispatchEvent(event);
    	
//        window.open(canvas.toDataURL('image/png'));
        return false;
    });
//    function convertBase64UrlToBlob(urlData,type){
//        var bytes=window.atob(urlData.split(',')[1]);        //去掉url的头，并转换为byte
//        //处理异常,将ascii码小于0的转换为大于0
//        var ab = new ArrayBuffer(bytes.length);
//        var ia = new Uint8Array(ab);
//        for (var i = 0; i < bytes.length; i++) {
//            ia[i] = bytes.charCodeAt(i);
//        }
//        return new Blob( [ab] , {type : 'image/'+type});
//    }

    /**
     * 第一次标注
     */
    $("#label_id").click(function(){
    	again_label = "0";
    	var path = getSelectionsStr();
    	var c = imgPath.lastIndexOf(".");
    	imgPath = imgPath.substring(0,c)+"_label"+imgPath.substring(c);
    	if(path=="false"){
    		return;
    	}
    	// 清空数据
    	canvas.backgroundImage = false;
        canvas.clear();
        elements = [];
    	 canvas.setBackgroundImage(path,
            canvas.renderAll.bind(canvas), {
                width: 700,
                height: 500,
                backgroundImageStretch: false
            });

        $("#c").css("border", "none");
        return false;
    });
    
    /**
     *已标注过  再次标注
     */
    $("#again_label_id").click(function(){
    	var path = getSelectionsStr();
    	$.commonReq({
    		url:rootPath+'/devicePicture/findEleByCheck.do',
    		data:{'id':pictureId},
    		async:false,
    		success:function(data){
    			if(data.success){
    				if(data.data){
    					again_label = "1";
    			    	var c = imgPath.lastIndexOf(".");
    			    	imgPath = imgPath.substring(0,c)+"_label"+imgPath.substring(c);
    			    	if(path=="false"){
    			    		return;
    			    	}
    			    	// 清空数据
    			    	canvas.backgroundImage = false;
    			        canvas.clear();
    			        elements = [];
    			    	 canvas.setBackgroundImage(path,
    			            canvas.renderAll.bind(canvas), {
    			                width: 700,
    			                height: 500,
    			                backgroundImageStretch: false
    			            });

    			        $("#c").css("border", "none");
    			        return false;
    				}else{
    					alert(data.error);
    				}
    			}
    		}
    	})
    	
    	
    });

});

//About modal
var modal = $('.modal');
var overlay = $(".overlay");
overlay.hide();
$('.open-modal').click(function() {
    modal.show();
    overlay.show();
});

$('.close-modal').click(function() {
    modal.hide();
    overlay.hide();
});

$(".overlay").click(function() {
    modal.hide();
    overlay.hide();
});


//Confirmation before closing the tab
//window.onbeforeunload = function(e) {
//    e = e || window.event;
//    if (e) {
//        e.returnValue = 'Sure?';
//    }
//    return 'Sure?';
//};

function getSelectionsStr(){
	var rows = $('#dt').bootstrapTable('getSelections');
	var str = "";
	if(rows!=null){
		if(rows.length!=1){
			alert("请选择一条数据！");
			return "false";
		}
		
		str = tomcatPath+"/imgUpload/"+rows[0].originalName;
	}
	pictureId = rows[0].id;
	imgPath = rows[0].originalName;
	factoryCode = rows[0].factoryCode;
	return str;
}

function makeCircle(left, top, line1, line2, line3, line4,myText,myfont,mycolor) {
	  var c = new fabric.Text(myText, {
              fontFamily: myfont,
              fontSize: 15,
			  left: left,
			  top: top,
              fill: mycolor,
              backgroundColor:"yellow",
              originX:"center",
              originY:"center"
          });
  c.hasControls = c.hasBorders = false;
  c.line1 = line1;
  c.line2 = line2;
  c.line3 = line3;
  c.line4 = line4;

  return c;
}

function makeCircle1(left, top, line1, line2, line3, line4) {
    var c = new fabric.Circle({
      left: left,
      top: top,
      strokeWidth: 5,
      radius: 2,
      fill: '#666',
      stroke: '#666',
      originX:"center",
      originY:"center"
    });

    c.hasControls = c.hasBorders = false;
    c.line1 = line1;
    c.line2 = line2;
    c.line3 = line3;
    c.line4 = line4;

    return c;
  }

function makeLine(coords) {
    return new fabric.Line(coords, {
      fill: 'red',
      stroke: 'red',
      strokeWidth: 3,
      selectable: false,
      originX:"center",
      originY:"center"
    });
  }

/*
*  方法:Array.remove(dx) 通过遍历,重构数组
*  功能:删除数组元素.
*  参数:dx删除元素的下标.
*/
Array.prototype.remove = function (dx) {
    if (isNaN(dx) || dx > this.length) { return false; }
    for (var i = 0, n = 0; i < this.length; i++) {
        if (this[i] != this[dx]) {
            this[n++] = this[i]
        }
    }
    this.length -= 1
}