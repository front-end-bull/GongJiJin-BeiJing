// JavaScript Document
define(function(require,exports,module){
	var obj=null;
	var popContent=0;
    var content=null;
    var contentHeight=0;
	//显示弹框
	exports.show=function(id,url,str){
        content=_$('container');
        contentHeight=content.offsetHeight
        obj=_$(id);
		popContent=obj.children[0];
		obj.style.cssText='display:block;';
        content.style.cssText="height:"+(window.innerHeight - content.offsetTop)+'px';
		if(url && str){
			ajax(url,str);
		}
	}
	//创建弹框内容 根据需要创建元素
	function creatPopContent(json){
        var popUp=document.createElement("div");
        var popTit=document.createElement("p");
        var popText=document.createElement("div");
        var popBtn=document.createElement("p");
        popUp.className="popup";
        popTit.className="popTit";
        popTit.innerHTML=json.title;
        popText.className="popText";
        popText.innerHTML=json.text;
        popBtn.className="popClose";
        popBtn.innerHTML="OK";
        popUp.appendChild(popTit);
        popUp.appendChild(popText);
        popUp.appendChild(popBtn);
        popContent.appendChild(popUp);
        var maxTextHeight=parseInt(popUp.offsetHeight*0.85);
        var clientTextHeight=popText.offsetHeight;
        if(clientTextHeight>maxTextHeight){
            popText.style.cssText="overflow-Y:scroll;height:"+maxTextHeight+'px';
        }else{
            popText.style.cssText="height:"+maxTextHeight+'px';
        }

		$(".popClose").each(function(){
			$(this).on('touchstart',hide)
		})

	}
	//隐藏弹框
	function hide(){
		popContent.innerHTML=" ";
        content.style.cssText="height:"+contentHeight+'px';
		obj.style.display="none";
	}
    function ajax(url,str){
        var oAjax=null;
        if(window.XMLHttpRequest){
            oAjax=new XMLHttpRequest();
        }else{
            oAjax=new ActiveXObject("Microsoft.XMLHTTP");
        }
        oAjax.open('GET',url,true);
        oAjax.send();
        oAjax.onreadystatechange=function(){
            if(oAjax.readyState==4){
                if(oAjax.status==200){
                    var data=eval("("+oAjax.responseText+")");
                    var dataContent=data[str];
                    creatPopContent(dataContent);
                }
            }
        }
    }
})