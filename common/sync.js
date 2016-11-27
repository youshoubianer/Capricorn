'use strict';

const SequelizeAuto = require('sequelize-auto')

module.exports = function(db,tables){
  //options 参数名称可在源码中发现
  var options = {
    'host': db.host,
    'port': db.port,
    'dialect': db.dialect,
    'directory': __dirname + '/../schema',
  }
  //具体数据表
  if(tables){
    options['tables'] = tables
  }
  var auto = new SequelizeAuto(db.database, db.username, db.password, options);
  auto.run(function (err) {
    if (err) throw err;
    console.log('done!');
  });
}