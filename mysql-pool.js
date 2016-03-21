var mysql       = require('mysql');
var mysqlConfig = require('./config/mysql');

var env = process.env.NODE_ENV || 'development';
if(mysqlConfig[env]) {
    mysqlConfig = mysqlConfig[env];
}

exports.createMysqlPool= module.exports.createMysqlPool = function(){
  return mysql.createPool({
        host: mysqlConfig.host,
        user: mysqlConfig.user,
        password: mysqlConfig.password,
        // database: 'account'
        database:'new_schema'
  });
}
