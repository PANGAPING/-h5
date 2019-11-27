var express = require("express");
var https = require("https");
var http = require("http");
var sha1 = require("sha1");
var fs = require("fs");
var request = require("request");
var uuid = require("uuid");


var app = new express();

var DeveloperConfig = {
	id: "",
	secret: ""
}

var Token = {
	"access_token":'',
	"expires_in":0
}


var jsapi_ticket = '';

var jsSignature = '';

var callbackIpList = [];

var apiIpList = [];




GetToken();

setInterval(()=>{GetToken();GetJsApiTicket()},7000000);


app.get('/',(req,res)=>{
	res.end("这是首页");

});

app.get("/GetSignature",(req,res)=>{
	res.end(jsSignature);
});


app.get("/GetUploadImage",(req,res)=>{
    var Id = req.query.Id;
    var fileName = DownloadUploadedHead(Id);
    res.end(fileName);
});


app.get("/GetCount",(req,res)=>{
	fs.readFile("./count.txt","utf-8",function(error,data){
		if(error) {
			res.end(1203);
		}
		else{
			res.end(data);
		}
	});
	
});


app.use(express.static("./wwwroot"));




app.listen(80);


function DownloadUploadedHead(id){
	fs.readFile("./count.txt","utf-8",function(error,data){
		var countPre = data - 0;
		var countNow = ++countPre;
		fs.writeFile("./count.txt",countNow,"utf-8",()=>{console.log('+1')});
	});

	var url ="http://file.api.weixin.qq.com/cgi-bin/media/get?access_token="+Token.access_token+"&media_id="+id;
	var fileName = uuid.v1()+".png";
	saveImageToDisk(url,"./wwwroot/uploads/"+ fileName);
	return fileName;	
}

function saveImageToDisk(url, localPath) {var fullUrl = url;
	var file = fs.createWriteStream(localPath);
	var request = http.get(url, function(response) {
	response.pipe(file);
	});
}


function GetJsSignature(){
	var noncestr = "woshidengweihao";
	var timestamp = 17798258390;
	var url = "http://www.xiaoyibang.top/ChangeHead.html";

	var oriStr = "jsapi_ticket="+ jsapi_ticket +'&noncestr=' + noncestr +'&timestamp='+ timestamp+'&url='+url;

	jsSignature = sha1(oriStr);
}





function GetToken(){
	https.get("https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid="+DeveloperConfig.id+"&secret="+DeveloperConfig.secret,(data)=>{
		    var str="";
    		data.on("data",function(chunk){
        		str+=chunk;//监听数据响应，拼接数据片段
    		})

    		data.on("end",function(){
    			Token = JSON.parse(str);
    			GetWechatCallbackIp();
			GetWechatApiIp();
			GetJsApiTicket();
    		});
			
	});
}


function GetWechatCallbackIp(){
	https.get("https://api.weixin.qq.com/cgi-bin/getcallbackip?access_token="+Token.access_token,(data)=>{
		    var str="";
    		data.on("data",function(chunk){
        		str+=chunk;//监听数据响应，拼接数据片段
    		})

    		data.on("end",function(){
    			callbackIpList = JSON.parse(str).ip_list;
    		});
			
	});

}


function GetJsApiTicket(){
		https.get("https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token="+Token.access_token+"&type=jsapi",(data)=>{
		    var str="";
    		data.on("data",function(chunk){
        		str+=chunk;//监听数据响应，拼接数据片段
    		})

    		data.on("end",function(){
    			jsapi_ticket = JSON.parse(str).ticket;
    			GetJsSignature();
    		});
			
	});

}

function GetWechatApiIp(){
		https.get("https://api.weixin.qq.com/cgi-bin/get_api_domain_ip?access_token="+Token.access_token,(data)=>{
		    var str="";
    		data.on("data",function(chunk){
        		str+=chunk;//监听数据响应，拼接数据片段
    		})

    		data.on("end",function(){
    			apiIpList = JSON.parse(str).ip_list;
    		});
			
	});
}
