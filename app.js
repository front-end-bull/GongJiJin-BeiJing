var express = require('express');
var bodyParser     =         require("body-parser");
//var multipart = require('connect-multiparty');
//var multipartMiddleware = multipart();
var multer = require('multer');
var compression = require('compression')
var uuid = require('node-uuid');
var app = express();
var utils = require('./lib/utils');
var http = require('http');
var https = require('https');
var qs = require('querystring');
var company_list =  require('./company_list');
var product_list =  require('./new_product_list');
var raw_products =  require('./new_products');
var planbooks = require('./planbooks');
var mysqlClient = require('./mysqlclient').init();
var fs = require('fs');
var path = require('path');
var thrift = require('thrift');
var ThriftTransports = require('./node_modules/thrift/lib/thrift/transport');
var ThriftProtocols = require('./node_modules/thrift/lib/thrift/protocol');
var qiniu = require('./node_modules/qiniu/');
var promote_list =  require('./promote_list');
var utility = require('utility');
var jsdom = require("jsdom");
var request = 	require('superagent');
// var $ = require('jquery')

//记录获取验证码的次数
var vcode_number = 0;

var _ = require('underscore');
app.locals._ = _;


transport = ThriftTransports.TBufferedTransport()
protocol = ThriftProtocols.TBinaryProtocol()

qiniu.conf.ACCESS_KEY = "oncNSfeTwUhmEZsZ8ef-9iE6QooeM9d2wwtYa2Se";
qiniu.conf.SECRET_KEY = "LWuNSU8bv57ctwtruNSkXeMToMpvaWN6KyY0px9v";
var ICON_BUCKET = "usericons";


var HUAFEIDUO_ACCESS_KEY = "S42jC6ozK39GQEJAByM00rkWZLKELVpsNgCeaRELJCho8QPxeqxeHI2wiB1UlfcY";
var HUAFEIDUO_SECRET_KEY = "lE4mkwXTY59VKMhP3FUzcKWlaL6lQ803B3dMn1vbUsWt659XySlAr8MsIGDnDDf6";

var PlanningService = require('./gen-nodejs/BaoxianshenqiPlanningService');
var ttypes = require('./gen-nodejs/baoxianshenqi_types');

var URI_SEND_SMS = "http://yunpian.com/v1/sms/send.json";
var apikey = "4d41b81cf3f5307c0c49afca60673041";

var weChart_access_token = ''
var weChart_jsapi_ticket = ''

app.use(bodyParser.json({limit : "1000kb"})); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true , limit : "10000kb" })); // for parsing application/x-www-form-urlencoded
app.use(multer());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname , 'public')));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(compression());



//设置跨域访问
app.all('*', function (req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "Origin, No-Cache, X-Requested-With, If-Modified-Since, Pragma, Last-Modified, Cache-Control, Expires, Content-Type, X-E4M-With");
	//res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");

	next();
});


function getUuid() {
	var s = [];
	var hexDigits = "0123456789abcdef";
	for (var i = 0; i < 36; i++) {
	s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	}
	s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
	s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
	s[8] = s[13] = s[18] = s[23] = "0";

	var uuid = s.join("");
	return uuid;
}

function Row(moon_day,project,increase,total){
	this.moon_day = moon_day
	this.project = project
	this.increase = increase
	this.total = total
}


var cityArray = {
	content:[
		{	first_letter:'A',
			assures:[	
						{id:1,label:'安康公积金',url:''},
						{id:2,label:'安阳公积金',url:''},
						{id:3,label:'安庆公积金',url:''},
						{id:4,label:'阿克苏公积金',url:''},
						{id:5,label:'安徽省直公积金',url:''},
						{id:6,label:'鞍山公积金',url:''},
						{id:7,label:'安顺公积金',url:''},
						{id:8,label:'阿勒泰公积金',url:''},
						{id:9,label:'阿坝州公积金',url:''}
					]
		},
		{	first_letter:'B',
			assures:[{id:10,label:'北京公积金',url:''}]
		},
		{	first_letter:'C',
			assures:[{id:11,label:'淳安公积金',url:''}]
		}
	]
}
var string1,timer1,test_sessionid,vcode_prefix="vcobbbaaaaa"

app.get('/GJJ_details/:sessionid/:url_id/:number/:name',function (req,resp){
	var sessionid = req.params.sessionid
	var url_id = req.params.url_id
	var number = req.params.number
	var name = req.params.name

	// console.log("sessionid: "+sessionid)
	// console.log("url_id: "+url_id)
	// console.log("number: "+number)
	console.log("name: "+number)

	var flag = []
	var isReturn = false


	mysqlClient.query("select * from Details  where url_id = ? and sessionid = ? order by num asc",[url_id,sessionid],function(err,results) {

			if (!!err) {
				// resp.send("{code : 99 , text : 'database error'}");
				console.log('database error: ' + err.stack );
				return;
			}

			// resp.send(JSON.stringify(results))
			var length = results.length


			var content = []

			var rows = []

			var block = {}

			

			var last_year

			for(var i = 0;i<length;i++){
				
				flag[i] = 0

				var every = results[i]
				var year = every.date.substring(0,4)
				var moon_day = every.date.substring(4,8)
				var project = every.type+every.year_moon
				var increase = every.increase
				var total = every.total

				// if(i!=0){
				// 	if()
				// }
				if(i==0){
					block.year = year
					rows.push(new Row(moon_day,project,increase,total))
				}else if(last_year==year){
					rows.push(new Row(moon_day,project,increase,total))
					if(i==length-1){
						block.rows = rows
						content.push(block)
					}
				}else {
					block.rows = rows
					content.push(block)

					block = {}
					rows = []
					block.year = year
					rows.push(new Row(moon_day,project,increase,total))
				}
				
				last_year = year 

				flag[i] = 1

				if(i == length-1){
					isReturn = true
				}
				
			}

			var time1 = setInterval(function(){

				var result = 1
				for(var i = 0;i<flag.length;i++){
					result = result * flag[i]
				}

				if(isReturn==true && result==1){
					var data = {
						content:content,
						number:number,
						name:name
					}
					// resp.send(JSON.stringify(data))
					console.log(JSON.stringify(data))
					resp.render('GJJ_details',data)
					clearInterval(time1)
				}
			},500)

			
	})

	
})

app.get('/GJJ_manage',function (req,resp){
	resp.render('GJJ_manage')
})



app.get('/GJJ_main/:mm/:bh/:jsessionid/:lb/:lk/:gjjcxjjmyhpppp',function (req,res){

	var mm = req.params.mm;
	var bh = req.params.bh;
	var jsessionid = req.params.jsessionid;
	var lb = req.params.lb;
	var lk = req.params.lk;
	var gjjcxjjmyhpppp = req.params.gjjcxjjmyhpppp;
	var isReturn = false

	var flag = [0]

	//获得的数据
	var href_Array = []
	var account_Array = []
	var TOTAL
	var NUMBER
	var NAME
	var CONTENT = []

	//Account表中的url对应的主键id
	// var url_id

	//判断sessionid是否已经进行过查询
	mysqlClient.query("select * from User  where sessionid = ?",[jsessionid],function(err,results) {
		if (!!err) {
				// resp.send("{code : 99 , text : 'database error'}");
				console.log('database error: ' + err.stack );
				return;
		}

		if(results.length==0){
				console.log("------------------第一次查询-------------------")

				var captcha_5s_headers ={
					Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
					'Accept-Encoding':'gzip, deflate, sdch',
					'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6',
					'Cache-Control':'no-cache',
					Connection:'keep-alive',
					Cookie:'JSESSIONID='+jsessionid,
					Host:'www.bjgjj.gov.cn',
					Pragma:'no-cache',
					'Upgrade-Insecure-Requests':'1',
					'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'
				} 

				request
					.get('http://www.bjgjj.gov.cn/wsyw/wscx/asdwqnasmdnams.jsp')
					.set(captcha_5s_headers)
					.end(function (err,resp){
						

						string1 = resp.text.replace(/(^\s*)|(\s*$)/g,"")
						string1 = string1.substring(4,string1.length)
						// console.log("----------string1:"+string1)

						var formData = {
							lb:lb,
							bh:bh,
							mm:mm,
							gjjcxjjmyhpppp:gjjcxjjmyhpppp,
							lk:string1
						}

						var content = qs.stringify(formData);
						// console.log("content: "+content)
						// console.log("formData: "+formData)
						// console.log("length: "+content.length)

						// console.log("提交表单的sessionid为："+test_sessionid)

						var login_headers={
							Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
							'Accept-Encoding':'gzip, deflate',
							'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6',
							'Cache-Control':'no-cache',
							Connection:'keep-alive',
							'Content-Length':content.length,
							'Content-Type':'application/x-www-form-urlencoded',
							Cookie:'JSESSIONID='+jsessionid,
							Host:'www.bjgjj.gov.cn',
							Origin:'http://www.bjgjj.gov.cn',
							Pragma:'no-cache',
							Referer:'http://www.bjgjj.gov.cn/wsyw/wscx/gjjcx-login.jsp',
							'Upgrade-Insecure-Requests':'1',
							'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'
						}

						request
							.post('http://www.bjgjj.gov.cn/wsyw/wscx/gjjcx-choice.jsp')
							.set(login_headers)
							.type('form')
							.send(formData)
							.redirects(0)
							.end(function(err,resp){

								// if(!!err){
								// 	res.send('没有通过验证')
								// 	return
								// }

							 	var html = resp.text.replace(/(^\s*)|(\s*$)/g,"")

							 	//start 解析出 账户以及url数组
								 	jsdom.env(
									  html,
									  ["http://7xqkd3.com2.z0.glb.qiniucdn.com/jsdomJquery.js"],
									  function (err, window) {
									  	var $ = window.$
									  	var td_num = 0
									 

									  	$("td.style21:gt(2)").each(function () {
									  		var text = $(this).text()
									  		account_Array.push(text)
									  		// console.log(" -",text)
									  		td_num++
									  	})


									  	if(td_num==0){
									  		res.render('GJJ_login_failure')
									  	}



									  	var account_num = td_num/3
									  	console.log("共有"+account_num+"个账号")


									  	account_num++

									  	var onclick_num = 0

									  	$("a").each(function(){
									  		onclick_num++
									  		if(onclick_num>1&&onclick_num<=account_num){
										  		var href_text = $(this).attr("onclick")
										  		href_text = href_text.match(/.*(?=",)/g)[0]
										  		href_text = href_text.replace("javascript:window.open(","").replace(",","")
										  		href_text = href_text.substring(1,href_text.length-2)


										  		href_Array.push(href_text)
										  		// console.log(" -",href_text)
									  		}
									  	})

									  	// console.log("账号数组："+account_Array)
									  	// console.log("链接数组："+href_Array)

									  	//-----start-----对获得数据进行处理
										  	var account_length = account_Array.length
										  	var account_number = account_length/3

										  	var href_length = href_Array.length

										  	

										  	var details_headers = {
										 		Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
												'Accept-Encoding':'gzip, deflate, sdch',
												'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6',
												'Cache-Control':'no-cache',
												Connection:'keep-alive',
												Cookie:'JSESSIONID='+jsessionid,
												Host:'www.bjgjj.gov.cn',
												Pragma:'no-cache',
												'Upgrade-Insecure-Requests':'1',
												'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.97 Safari/537.36'
										 	}


										  	var moon_headers = {
										  		Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
												'Accept-Encoding':'gzip, deflate, sdch',
												'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6',
												'Cache-Control':'no-cache',
												Connection:'keep-alive',
												Cookie:'JSESSIONID='+jsessionid,
												Host:'www.bjgjj.gov.cn',
												Pragma:'no-cache',
												'Upgrade-Insecure-Requests':'1',
												'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.97 Safari/537.36'
									  		}	


					
										  	


									  		var i = 0
										  	for(var i = 0;i<account_number;i++){ //account_number
										  		flag[i] = 0
										  		var account_name = account_Array[account_length-2-3*(i)]
										  		var status = account_Array[account_length-1-3*(i)]
										  		var url = href_Array[href_length-1-i]
										  		// console.log(' -'+url)
										  		// var year_fee = 3360  //需要从数据库读取 (是提前还是每次访问再取呢？)

										  		
										  		;(function(i,account_name,status,url){
										  		//start	获取详细信息
												 	request
												 		.get('http://www.bjgjj.gov.cn/wsyw/wscx/'+url)
												 		.set(details_headers)
												 		.end(function(req,resp){
												 			var html2 = resp.text.replace(/(^\s*)|(\s*$)/g,"")
												 			console.log("第"+i+"次进入账号中查询")
												 			console.log(" -"+url)
												 			// console.log(html2)
												 			jsdom.env(
															  	html2,
															  	["http://7xqkd3.com2.z0.glb.qiniucdn.com/jsdomJquery.js"],
															  	function (err, window) {
																  	var $ = window.$

																  	var name = $('#t1Contents table tr:eq(0) td:eq(1)').text()
																  	name = name.replace(",","")
																  	NAME = name


																  	// console.log('姓名: '+name)

																  	var number = $('#t1Contents table tr:eq(0) td:eq(3)').text()
																  	number = number.replace(",","")
																  	NUMBER = number
																  	// console.log('个人登记号：'+number)


																  	var total = $('#t1Contents table tr:eq(4) td:eq(1)').text()
																  	total = total.replace(",","")
																  	total = total.substring(0,total.length-1)
																  	if(i==0){
																  		TOTAL=total
																  	}
																  	console.log('当前余额：'+ total)

																  	var moon = $('#t1Contents table tr:eq(5) td:eq(1)').text()
																  	moon = moon.replace(",","")
																  	moon = moon.substring(0,moon.length-1)
																  	// console.log('当年缴存金额：'+ moon)


																  	


																  	

																  	var a_num = 0
																  	var href_text



																  	$("a").each(function(){
																  		if(i==0){
																  			if(a_num==3){
																	  		    href_text = $(this).attr("onclick")
																		  		href_text = href_text.match(/.*(?=',)/g)[0]
																		  		href_text = href_text.replace("javascript:window.open(","").replace(",","")
																		  		href_text = href_text.substring(1,href_text.length-2)
																		  		// href_Array.push(href_text)
																		  		console.log(" -href"+a_num+"-----",href_text)
																	  		}
																  		}else{
																  			if(a_num==2){
																	  		    href_text = $(this).attr("onclick")
																		  		href_text = href_text.match(/.*(?=',)/g)[0]
																		  		href_text = href_text.replace("javascript:window.open(","").replace(",","")
																		  		href_text = href_text.substring(1,href_text.length-2)
																		  		// href_Array.push(href_text)
																		  		console.log(" -href"+a_num+"-----",href_text)
																	  		}
																  		}
																  		a_num++

																  		
																  	})


																  	if(i==account_number-1){
																  		isReturn=true
																  	}
																  	flag[i] = 1


																  	if(i==0){
																  		//-start-向User表中插入数据
																		  	mysqlClient.insert("insert into User (id,sessionid,name,number,total) values (?,?,?,?,?)",
																			[getUuid(),jsessionid,name,number,total], function(err2,rows2) {

																				if (!!err2) {
																					console.log('database error: ' + err2.stack );
																					return;
																				}
																				// var userid = rows2.insertId;
																			});
																		//-end-向User表中插入数据
																  	}

																  	//-start-向Account表中插入数据
																  		var url_id = getUuid()
																  		mysqlClient.insert("insert into Account (id,sessionid,name,status,url,year_fee,number) values (?,?,?,?,?,?,?)",
																		[url_id,jsessionid,account_name,status,url,moon,i+1], function(err2,rows2) {

																			if (!!err2) {
																				console.log('database error: ' + err2.stack );
																				return;
																			}
																			// url_id = rows2.insertId;

																			console.log("插入的Account------start------------")
																			console.log("-account_name: "+account_name)
																			console.log("-status: "+status)
																			console.log("-moon: "+moon)
																			console.log("-url_id: "+url_id)



																			// CONTENT.push(new Account(account_name,status,moon,url_id))
																			console.log("插入的Account------end------------")

																		});
																  	//-end-向Account表中插入数据


																  	//start	获取每月详细
																  		request
																  		.get(encodeURI('http://www.bjgjj.gov.cn/wsyw/wscx/'+href_text))
																  		// .get('http://www.bjgjj.gov.cn/wsyw/wscx/gjj_cxls.jsp?xm=JiMyNDQyOTsmIzQwNTI3OwAA&grdjh=32060219851201001500&sfzh=GJJ014375841&bh=101&jczt=%B7%E2%B4%E6')
																  		.set(moon_headers)
																  		.end(function(req,resp){
																  			var html3 = resp.text.replace(/(^\s*)|(\s*$)/g,"")
																  			// console.log(html3)

																  			jsdom.env(
																			  html3,
																			  ["http://7xqkd3.com2.z0.glb.qiniucdn.com/jsdomJquery.js"],
																			  function (err, window) {
																			  	var $ = window.$

																			  	var details_Array = []


																			  	$('.pattern1 table tr:gt(0) td').each(function(){
																			  		// console.log(" -"+$(this).text().replace(/(^\s*)|(\s*$)/g,""))

																			  		details_Array.push($(this).text().replace(/(^\s*)|(\s*$)/g,""))

																			  	})

																			  	var details_length = details_Array.length
																			  	var details_totalNum = details_length/6



																			  	for(var i =0;i<details_totalNum;i++){
																			  		var date = details_Array[0+i*6]
																				  	var year_moon = details_Array[1+i*6]
																				  	var type = details_Array[2+i*6]
																				  	var increase = details_Array[3+i*6]
																				  	var decrease = details_Array[4+i*6]
																				  	var total = details_Array[5+i*6]
																				  	var num = details_totalNum-i
																				  	// console.log("插入的为："+href_text)
																				  		//-start-向Details表中插入数据
																			  				

																  					console.log(" -"+i+"-插入Details表时，url_id的值为: "+url_id)
																  					mysqlClient.insert("insert into Details (id,sessionid,url,date,year_moon,type,increase,decrease,total,num,url_id) values (?,?,?,?,?,?,?,?,?,?,?)",
																					[getUuid(),jsessionid,href_text,date,year_moon,type,increase,decrease,total,num,url_id], function(err2,rows2) {

																						if (!!err2) {
																							console.log('database error: ' + err2.stack );
																							return;
																						}
																						// var userid = rows2.insertId;
																					});
																					  		
																				  		//-end-向Details表中插入数据
																			  	}
																			  	
																			  }
																			)//end jsdom
																  	
																		})
																	//end	获取每月详细
															    }
															)	
														})
											 	//end	获取详细信息
											 })(i,account_name,status,url)

										  		// content.push(new Account(account_name,status,year_fee,url))
										  	} //-end- if
										  		// console.log(JSON.stringify(data))

										//-----end-----对获得数据进行处理

										  	
									  }
									)
							 	//end 解析出 账户以及url数组

							 	

							})

					})
				


				var time1 = setInterval(function(){
					var result = 1
					for(var i=0;i<flag.length;i++){
						result = flag[i]*result
					}
					if(isReturn == true&&result==1){

						// CONTENT.push(new Account(account_name,status,moon,url_id))
						mysqlClient.query("select * from Account  where sessionid = ? order by number asc",[jsessionid],function(err,results) {

							if (!!err) {
								// resp.send("{code : 99 , text : 'database error'}");
								console.log('database error: ' + err.stack );
								return;
							}
							
							var updateTime = getCurrentTime()

							var data = {
							  	content:results,
							  	Total:TOTAL,
							  	num:NUMBER,
							  	Name:NAME,
							  	sessionid:jsessionid,
							  	updateTime:updateTime
						  	}
						   res.render("GJJ_main",data)

							clearInterval(time1)

						})

					   
					}
				},500)


			
		}else{
			// CONTENT.push(new Account(account_name,status,moon,url_id))
			mysqlClient.query("select * from Account  where sessionid = ? order by number asc",[jsessionid],function(err,results) {

				if (!!err) {
					// resp.send("{code : 99 , text : 'database error'}");
					console.log('database error: ' + err.stack );
					return;
				}
				
				var updateTime = getCurrentTime()

				var data = {
				  	content:results,
				  	Total:TOTAL,
				  	num:NUMBER,
				  	Name:NAME,
				  	sessionid:jsessionid,
				  	updateTime:updateTime
			  	}
			   res.render("GJJ_main",data)

			})
		}

	})





	
	
})

function getCurrentTime(){
		var myDate = new Date()
		// console.log("----myDate-----"+myDate)
		var month = myDate.getMonth()
		month++
		if(month<10){month="0"+month}
		// console.log("----month----"+month)


		var day = myDate.getDate()
		if(day<10){day="0"+day}
		// console.log("----day-----"+day)
			
		var hour = myDate.getHours()
		if(hour<10){hour="0"+hour}
		// console.log("----hour-----"+hour)

		var minute = myDate.getMinutes()
		if(minute<10){minute="0"+minute}

		var currentTime = myDate.getFullYear()+"-"+month+"-"+day+" "+hour+":"+minute
		return currentTime
}

function Account(name,status,year_fee,url){
	this.name = name
	this.status = status
	this.year_fee = year_fee
	this.url = url
}



app.get('/GJJ_advertisement',function (req,resp){
	resp.render('GJJ_advertisement')
})

app.get('/query_GJJ/:cityId/:jsessionid',function (req,resp){
	var cityId = req.params.cityId
	var sessionid = req.params.jsessionid
	var content = cityArray.content
	var city
	for(var i = 0;i<content.length;i++){
		var assures = content[i].assures
		for(var j = 0;j<assures.length;j++){
			if(assures[j].id==cityId){
				city = assures[j].label
			}
		}
	}
	var captcha_headers = {
		Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Accept-Encoding':'gzip, deflate, sdch',
		'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6',
		'Cache-Control':'no-cache',
		Connection:'keep-alive',
		Cookie:'JSESSIONID='+sessionid,
		Host:'www.bjgjj.gov.cn',
		Pragma:'no-cache',
		'Upgrade-Insecure-Requests':1,
		'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'
	}

	request
		.get('http://www.bjgjj.gov.cn/wsyw/servlet/PicCheckCode1')
		.set(captcha_headers)
		.end(function (err,res){
			// console.log('获取验证码的状态: '+res.status)
			// console.log('res.text: '+res.text)
			// console.log('res.body: '+JSON.stringify(res.body))
			// console.log('res.body: '+res.body)
			// console.log(res.body)
			// console.log(res.header)
			var a = res.body
			var putPolicy = new qiniu.rs.PutPolicy(
				'gongjijin'
			);
			var uptoken = putPolicy.token();

			var client = new qiniu.rs.Client();
			var extra = new qiniu.io.PutExtra();

			vcode_number++

			qiniu.io.put(uptoken, vcode_prefix+vcode_number+".png", a, extra, function (err2, ret2) {
				if (!!err2) {
					resp.send("{code : 98 , text : 'database error'}");
					//					console.log('database error: ' + JSON.stringify(err2));
					console.log('database error: ' + JSON.stringify(ret2));
					return;
				}

				var avatarstring = "http://7xqkd3.com2.z0.glb.qiniucdn.com/"+vcode_prefix+vcode_number+".png";
				// resp.render('query_GJJ',{label:'北京公积金',jsessionid:test_sessionid,image:avatarstring})
				resp.render('query_GJJ',{label:city,jsessionid:sessionid,image:avatarstring})

				// resp.send(JSON.stringify({
				// 	code: 0,
				// 	avatar : avatarstring
				// }));
			});
		})
	
})





app.get('/query_GJJ',function (req,resp){
	var get_cookie_headers = {
		Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Accept-Encoding':'gzip, deflate, sdch',
		'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6',
		'Cache-Control':'no-cache',
		Connection:'keep-alive',
		// Cookie:'JSESSIONID=D2324A8D42D41200C4BCE5EAC463620E.tomcat3; _gscu_509482549=555245021xasiv15; _gscs_509482549=55524502st7d2c15|pv:2; _gscbrs_509482549=1; JSESSIONID=EF3F314C249EA75CDA596FA3A5063D1A.tomcat3; _gscu_1252996743=55524502u6puzq15; _gscs_1252996743=55524502fos60f15|pv:4; _gscbrs_1252996743=1',
		Host:'www.bjgjj.gov.cn',
		Pragma:'no-cache',
		'Upgrade-Insecure-Requests':1,
		'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/48.0.2564.97 Safari/537.36'
	}
	// 为手机用户分配一个可用的cookie
	request
		// .get('http://www.bjgjj.gov.cn')
		.get('http://www.bjgjj.gov.cn/wsyw/wscx/gjjcx-login.jsp')
		.set(get_cookie_headers)
		.end(function (err,res){
			// console.log(res.headers)
			var sessionid = res.headers['set-cookie'][0]
			// console.log("sessionid_before:" + sessionid)
			sessionid = sessionid.match(/.+(?=;)/g) +''
			sessionid = sessionid.substring(11,sessionid.length)
			// test_sessionid = sessionid
			// test_sessionid = 'CAC9E357690F4FE5994DED2A9DBD3FC3.tomcat3'
			// console.log("sessionid_after:" + sessionid)
			// timer1 = setInterval(get_lk,5000)

			get_last_captcha (resp,sessionid)

		})
	
})

function get_last_captcha(resp,sessionid){
	//获得最新的验证码
	// console.log("获得最新的验证码的sessionid: "+test_sessionid)
	var captcha_headers = {
		Accept:'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
		'Accept-Encoding':'gzip, deflate, sdch',
		'Accept-Language':'zh-CN,zh;q=0.8,en;q=0.6',
		'Cache-Control':'no-cache',
		Connection:'keep-alive',
		Cookie:'JSESSIONID='+sessionid,
		Host:'www.bjgjj.gov.cn',
		Pragma:'no-cache',
		'Upgrade-Insecure-Requests':1,
		'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.111 Safari/537.36'
	}

	request
		.get('http://www.bjgjj.gov.cn/wsyw/servlet/PicCheckCode1')
		.set(captcha_headers)
		.end(function (err,res){
			// console.log('获取验证码的状态: '+res.status)
			// console.log('res.text: '+res.text)
			// console.log('res.body: '+JSON.stringify(res.body))
			// console.log('res.body: '+res.body)
			// console.log(res.body)
			// console.log(res.header)
			var a = res.body
			var putPolicy = new qiniu.rs.PutPolicy(
				'gongjijin'
			);
			var uptoken = putPolicy.token();

			var client = new qiniu.rs.Client();
			var extra = new qiniu.io.PutExtra();

			vcode_number++

			qiniu.io.put(uptoken, vcode_prefix+vcode_number+".png", a, extra, function (err2, ret2) {
				if (!!err2) {
					resp.send("{code : 98 , text : 'database error'}");
					//					console.log('database error: ' + JSON.stringify(err2));
					console.log('database error: ' + JSON.stringify(ret2));
					return;
				}

				var avatarstring = "http://7xqkd3.com2.z0.glb.qiniucdn.com/"+vcode_prefix+vcode_number+".png";
				resp.render('query_GJJ',{label:'北京公积金',jsessionid:sessionid,image:avatarstring})

				// resp.send(JSON.stringify({
				// 	code: 0,
				// 	avatar : avatarstring
				// }));
			});
		})
}



		


app.get('/select_city/:jsessionid',function (req,resp){
	var sessionid = req.params.jsessionid
	cityArray.jsessionid = sessionid
	resp.render('select_city',cityArray)
})







var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

process.on('uncaughtException', function(err) {

	console.log(err);

	console.log(err.stack)
});
