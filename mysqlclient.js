var client = module.exports;

var _pool = null;

var NND = {};

NND.init = function(){
  if(!_pool)
    _pool = require('./mysql-pool').createMysqlPool();
};

NND.query = function(sql, args, callback){
  _pool.getConnection(function(err, client) {
    if (!!err) {
      console.error('[sqlqueryErr] '+err.stack);
      return;
    }
    client.query(sql, args, function(err, res) {
      _pool.releaseConnection(client);
      callback.apply(null, [err, res]);
    });
  });
};

/**
 * Close connection pool.
 */
NND.shutdown = function(){
  _pool.end();
};

/**
 * init database
 */
client.init = function() {
  if (!!_pool){
    return client;
  } else {
    NND.init();
    client.insert = NND.query;
    client.update = NND.query;
    //sqlclient.delete = NND.query;
    client.query = NND.query;
    return client;
  }
};
