var express = require('express');
var app = express();
var utils = require('./lib/utils');
var http = require('http');
var qs = require('querystring');
var mysqlClient = require('./mysqlclient').init();

var URI_SEND_SMS = "http://yunpian.com/v1/sms/send.json";
var apikey = "4d41b81cf3f5307c0c49afca60673041";

function isStringEmpty(str) {
	if( str === undefined || str == null ) {
		return true;
	}

	return false;
}

function isValidToken(userid,token,cb) {
	mysqlClient.query("select * from accesstoken where userid = ? and accesstoken = ?",[userid,token],function(err,rows) {
		if (!!err) {
			utils.invokeCallback(cb, err, false);
			return;
		}

		if( rows.length == 0 ) {
			utils.invokeCallback(cb, err, false);
		} else {
			utils.invokeCallback(cb, err, true);
		}

	});
}

function insertToken(userid,token,cb) {
	mysqlClient.query("insert into accesstoken (userid,accesstoken,isdelete) values (?,?,?)",[userid,token,0],function(err,rows) {
		utils.invokeCallback(cb, err);
	});
}

function sendSms(phonenumber,text) {
	var post_data = {
		"apikey" :apikey ,
		"text": text,
		"mobile" :phonenumber
	};

	var content = qs.stringify(post_data);

	var r = http.request({
		hostname: 'yunpian.com',
		port:80,
		path: '/v1/sms/send.json',
		method: 'POST',
		headers: {
			'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
			"Content-Length": content.length
		}
	}, function (res) {
		//	console.log('STATUS: ' + res.statusCode);
		//  console.log('HEADERS: ' + JSON.stringify(res.headers));
		res.on('data', function (chunk) {
			//console.log('BODY: ' + chunk);
			//resp.send(chunk);
		}).on('end',function() {
			//	console.log('end');
		})
	});

	r.on('error', function (er) {
		resp.send("{code : 97 , text : 'send active_code_error'}");
		console.log('database error: ' + er.stack );
		return;
	});

	r.write(content);

	r.end();

	console.log(content);
}

app.get('/user_register', function (req, resp) {

	var phonenumber = req.query.phonenumber;
	console.log('user_register %s',phonenumber);
	if( phonenumber === undefined || phonenumber == null ) {
		resp.send("{code : 1 , text : 'missing param'}");
		return;
	}

  	mysqlClient.query("select * from users where phonenumber = ?",[phonenumber],function(err,rows) {

		if (!!err) {
			resp.send("{code : 99 , text : 'database error'}");
			return;
		}

		if( rows.length > 0 ) {
			resp.send("{code : 2 , text : 'phonenumber already registered'}");
			return;
		}

		var activecode = '1234';
		mysqlClient.insert("insert into users (phonenumber,activestatus,activecode) values (?,?,?)",
				[phonenumber,1,activecode], function(err2,rows2) {

				if (!!err2) {
					resp.send("{code : 98 , text : 'database error'}");
					console.log('database error: ' + err2.stack );
					return;
				}

				var userid = rows2.insertId;
				console.log('result\t' +  phonenumber + "\t" + userid);

				sendSms(phonenumber,'【理财神器】欢迎注册理财神器，您的账户激活码为:'+ activecode);
				//resp.send("{code : 0 , userid : " + userid +"}");
				resp.send(JSON.stringify(
					{
						code: 0,
						userid: userid,
						activestatus : 1
					}
				));
			});
	});
});

app.get('/user_active', function (req, resp) {
	var userid = req.query.userid;
	var code = req.query.code;

	console.log('user_active %s %s',userid,code);
	if( userid === undefined || userid == null ) {
		resp.send(JSON.stringify({
			code: 1,
			text : "missing param"
		}));
		return;
	}

	if( code === undefined || code == null ) {
		resp.send(JSON.stringify({
			code: 1,
			text : "missing param"
		}));
		return;
	}

	mysqlClient.query("select * from users where id = ?",[userid],function(err,rows) {

		if (!!err) {
			resp.send("{code : 99 , text : 'database error'}");
			return;
		}

		if( rows.length == 0 ) {
			resp.send("{code : 3 , text : 'phonenumber not registered'}");
			return;
		}

		console.log(JSON.stringify(rows));
		var result = rows[0];

		if( result.activestatus != 1 && result.activestatus != 4 ) {
			resp.send("{code : 4 , text : 'user already actived'}");
			return;
		}

		if( result.activecode == code ) {

			mysqlClient.insert("update users set activestatus = ? where id = ?",
				[2,userid], function(err2,rows2) {

					if (!!err2) {
						resp.send("{code : 98 , text : 'database error'}");
						console.log('database error: ' + err2.stack );
						return;
					}

					var token = '123456789';

					insertToken(result.id,token,function(err9) {
						if (!!err9) {
							resp.send("{code : 95 , text : 'database error'}");
							return;
						}

						resp.send(JSON.stringify(
							{
									code: 0,
									userid: userid,
									acesstoken: token,
									activestatus : 2
							}
						));
					});
				});
		} else {
			resp.send("{code : 5 , test : 'code error'}");
		}
	});
});

app.get('/user_enter_info', function (req, resp) {
	var userid = req.query.userid;
	var password = req.query.password;
	var name = req.query.name;
	var baoxianid = req.query.baoxianid;
	var city = req.query.city;
	var province = req.query.province;
	var company = req.query.company;
	var acesstoken = req.query.acesstoken;

	if( isStringEmpty(password) ||
		isStringEmpty(name) ||
		isStringEmpty(baoxianid) ||
		isStringEmpty(city) ||
		isStringEmpty(province) ||
		isStringEmpty(company) ) {
		resp.send(JSON.stringify({
			code: 1,
			text : "missing param"
		}));
		return;
	}

	isValidToken(userid,acesstoken,function(err0,tokenvalid) {
		if (!!err0) {
			resp.send("{code : 96 , text : 'database error'}");
			return;
		}

		if (tokenvalid == false) {
			resp.send(JSON.stringify({
				code: 5,
				text: 'invalid token'
			}));
			return;
		}

		mysqlClient.query("select * from users where id = ?", [userid], function (err, rows) {

			if (!!err) {
				resp.send("{code : 99 , text : 'database error'}");
				return;
			}

			if (rows.length == 0) {
				resp.send("{code : 3 , text : 'phonenumber not registered'}");
				return;
			}

			console.log(JSON.stringify(rows));
			var result = rows[0];

		//	if (result.activestatus == 1) {
		//		resp.send("{code : 3 , text : 'user not actived'}");
		//		return;
		//	}

			mysqlClient.insert("update users set activestatus = ?,password=?,username=?,baoxianid=?," +
				"city=?,province=?,company=? where id = ?",
				[3, password, name, baoxianid, city, province, company, userid], function (err2, rows2) {

					if (!!err2) {
						resp.send("{code : 98 , text : 'database error'}");
						console.log('database error: ' + err2.stack);
						return;
					}

					resp.send(JSON.stringify({
						code: 0,
						phonenumber: result.phonenumber,
						userid: userid,
						activestatus: 3,
						name: name,
						baoxianid: baoxianid,
						city: city,
						province: province,
						company: company
					}));
				});
		});
	});
});

app.get('/user_resend_active_code', function (req, resp) {
	var userid = req.query.userid;

	if( isStringEmpty(userid) ) {
		resp.send(JSON.stringify({
			code: 1,
			text : "missing param"
		}));
		return;
	}

	mysqlClient.query("select * from users where id = ?", [userid], function (err, rows) {

		if (!!err) {
			resp.send("{code : 99 , text : 'database error'}");
			return;
		}

		if (rows.length == 0) {
			resp.send("{code : 3, text : 'phonenumber not registered'}");
			return;
		}

		var result = rows[0];

		if (result.activestatus == 3) {
			resp.send("{code : 4 , text : 'user had actived'}");
			return;
		}

		sendSms(result.phonenumber,'【理财神器】欢迎注册理财神器，您的账户激活码为:'+ result.activecode);

		resp.send(JSON.stringify({
			code: 0
		}));
	});
});

app.get('/user_forget', function (req, resp) {
	var phonenumber = req.query.phonenumber;

	if( isStringEmpty(phonenumber) ) {
		resp.send(JSON.stringify({
			code: 1,
			text : "missing param"
		}));
		return;
	}

	mysqlClient.query("select * from users where phonenumber = ?", [phonenumber], function (err, rows) {

		if (!!err) {
			resp.send("{code : 99 , text : 'database error'}");
			return;
		}

		if (rows.length == 0) {
			resp.send("{code : 3, text : 'phonenumber not registered'}");
			return;
		}

		var result = rows[0];

		var activecode = "1234";
		mysqlClient.insert("update users set activestatus = ?,activecode = ? where id = ?",
			[4,activecode, result.id], function(err2,rows2) {

				if (!!err2) {
					resp.send("{code : 98 , text : 'database error'}");
					console.log('database error: ' + err2.stack );
					return;
				}

				sendSms(result.phonenumber,'【理财神器】欢迎注册理财神器，您的账户激活码为:'+ activecode);

				resp.send(JSON.stringify({
					code: 0,
					userid : result.id,
					activestatus : 4
				}));
			});
	});
});

app.get('/user_login', function (req, resp) {
	var phonenumber = req.query.phonenumber;
	var password = req.query.password;

	if( isStringEmpty(phonenumber) || isStringEmpty(password) ) {
		resp.send(JSON.stringify({
			code: 1,
			text : "missing param"
		}));
		return;
	}

	mysqlClient.query("select * from users where phonenumber = ?",[phonenumber],function(err,rows) {

		if (!!err) {
			resp.send("{code : 99 , text : 'database error'}");
			return;
		}

		if( rows.length == 0 ) {
			resp.send("{code : 3 , text : 'phonenumber not registered'}");
			return;
		}

		console.log(JSON.stringify(rows));
		var result = rows[0];

		if( result.activestatus == 1 || result.activestatus == 2 ) {
			resp.send(JSON.stringify({
				code : 0,
				phonenumber :phonenumber,
				userid : result.id,
				activestatus : result.activestatus
			}));
			return;
		} else if( result.activestatus == 3 ) {
			if( password == result.password) {
				var token = '123456789';

				insertToken(result.id,token,function(err9) {
					if (!!err9) {
						resp.send("{code : 98 , text : 'database error'}");
						return;
					}

					resp.send(JSON.stringify({
						code: 0,
						phonenumber: phonenumber,
						userid: result.id,
						activestatus: result.activestatus,
						name: result.username,
						baoxianid: result.baoxianid,
						city: result.city,
						province: result.province,
						company: result.company,
						acesstoken: token
					}));
				});
			} else {
				resp.send(JSON.stringify({
					code : 6,
					text : 'password error'
				}));
				return;
			}
		}
	});
});

app.get('/user_logout', function (req, resp) {
	var userid = req.query.userid;
	var acesstoken = req.query.acesstoken;

	if( isStringEmpty(userid) || isStringEmpty(acesstoken) ) {
		resp.send(JSON.stringify({
			code: 1,
			text : "missing param"
		}));
		return;
	}

	isValidToken(userid,acesstoken,function(err0,tokenvalid) {
		if (!!err0) {
			resp.send("{code : 96 , text : 'database error'}");
			return;
		}

		if (tokenvalid == false) {
			resp.send(JSON.stringify({
				code: 5,
				text: 'invalid token'
			}));
			return;
		}

		mysqlClient.query("delete from accesstoken where userid = ? and accesstoken = ?",[userid,acesstoken],function(err,rows) {

			if (!!err) {
				resp.send("{code : 99 , text : 'database error'}");
				return;
			}

			if( rows.length == 0 ) {
				resp.send("{code : 3 , text : 'phonenumber not registered'}");
				return;
			}

			console.log(JSON.stringify(rows));
			resp.send(JSON.stringify({
				code : 0
			}));
		});
	});
});

app.get('/get_products', function (req, resp) {
	var userid = req.query.userid;
	var acesstoken = req.query.acesstoken;

	if( isStringEmpty(userid) || isStringEmpty(acesstoken) ) {
		resp.send(JSON.stringify({
			code: 1,
			text : "missing param"
		}));
		return;
	}

	isValidToken(userid,acesstoken,function(err0,tokenvalid) {
		if (!!err0) {
			resp.send("{code : 96 , text : 'database error'}");
			return;
		}

		if (tokenvalid == false) {
			resp.send(JSON.stringify({
				code: 5,
				text: 'invalid token'
			}));
			return;
		}

		mysqlClient.query("delete from accesstoken where userid = ? and accesstoken = ?",[userid,acesstoken],function(err,rows) {

			if (!!err) {
				resp.send("{code : 99 , text : 'database error'}");
				return;
			}

			if( rows.length == 0 ) {
				resp.send("{code : 3 , text : 'phonenumber not registered'}");
				return;
			}

			console.log(JSON.stringify(rows));
			resp.send(JSON.stringify({
				code : 0
			}));
		});
	});
});

app.get('/get_product', function (req, resp) {

});

app.get('/get_product', function (req, resp) {

});


var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});

process.on('uncaughtException', function(err) {

	console.log(err);

	console.log(err.stack)
});
