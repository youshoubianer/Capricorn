'use strict'
const Sequelize = require('sequelize');
const co = require('co');
const SequelizeAuto = require('sequelize-auto');
const fs = require('fs');
const schemasPath = __dirname + '/schemas'
const async = require('async');
const _ = Sequelize.Utils._;

const config = {
  db:{
    username: '',
    password: '',
    database: '',
    host: '',
    port: 3306,
    pool: 10,
    dialect: 'mysql',
    logging: console.log,
    prefix: '',
  }
}

const db = new Sequelize(config.db.database, config.db.username, config.db.password, {
  dialect: config.db.dialect,
  host: config.db.host,
  port: config.db.port,
  // timezone: '+08:00',
  define: { 
    timestamps: false,
  },
  pool: {
    maxConnections: config.db.pool,
  },
  omitNull: true,
  option:{
    logging: config.db.logging,
  }
});


co(function*(){
  let options = {
    'host': config.db.host,
    'port': config.db.port,
    'dialect': config.db.dialect,
    'directory': schemasPath,
  }
  let tables = [];
  let queryInterface = db.getQueryInterface();
  if(process.argv.slice(3).length > 0){
      tables = process.argv.slice(3)
  }
  else{
    tables = yield queryInterface.showAllTables().filter(table=>{
      return table.indexOf(config.db.prefix) !== -1;
    });
  }
  options['tables'] = tables;

  //sequelize-auto 实例
  let auto = new SequelizeAuto(config.db.database, config.db.username, config.db.password,options);
  
  //camel 转换
  const toCamel = function (key) {
    return key.replace(/(_.)/g, function(word) {
      return word[1].toUpperCase();
    });
  }
  
  //重写run方法
  auto.run = function(callback) {
    let self = this;
    let text = {};
    let tables = [];

    this.build(generateText);

    function generateText(err) {
      if (err) console.error(err)

      async.each(_.keys(self.tables), function(table, _callback){
        let fields = _.keys(self.tables[table])
          , spaces = '';

        for (let x = 0; x < self.options.indentation; ++x) {
          spaces += (self.options.spaces === true ? ' ' : "\t");
        }

        text[table] = "/* jshint indent: " + self.options.indentation + " */\n\n";
        text[table] += "module.exports = function(sequelize, DataTypes) {\n";
        text[table] += spaces + "return sequelize.define('" + toCamel(table) + "', {\n";

        _.each(fields, function(field, i){
          // Find foreign key
          let foreignKey = self.foreignKeys[table] && self.foreignKeys[table][field] ? self.foreignKeys[table][field] : null

          if (_.isObject(foreignKey)) {
            self.tables[table][field].foreignKey = foreignKey
          }

          // column's attributes
          let fieldAttr = _.keys(self.tables[table][field]);
          text[table] += spaces + spaces + toCamel(field) + ": {\n";

          // Serial key for postgres...
          let defaultVal = self.tables[table][field].defaultValue;

          _.each(fieldAttr, function(attr, x){
            let isSerialKey = self.tables[table][field].foreignKey && _.isFunction(self.dialect.isSerialKey) && self.dialect.isSerialKey(self.tables[table][field].foreignKey)

            // We don't need the special attribute from postgresql describe table..
            if (attr === "special") {
              return true;
            }

            if (attr === "foreignKey") {
              if (isSerialKey) {
                text[table] += spaces + spaces + spaces + "autoIncrement: true";
              }
              else if (foreignKey.isForeignKey) {
                text[table] += spaces + spaces + spaces + "references: {\n";
                text[table] += spaces + spaces + spaces + spaces + "model: \'" + toCamel(self.tables[table][field][attr].target_table) + "\',\n"
                text[table] += spaces + spaces + spaces + spaces + "key: \'" + toCamel(self.tables[table][field][attr].target_column) + "\'\n"
                text[table] += spaces + spaces + spaces + "}"
              } else return true;
            }
            else if (attr === "primaryKey") {
               if (self.tables[table][field][attr] === true && (! _.has(self.tables[table][field], 'foreignKey') || (_.has(self.tables[table][field], 'foreignKey') && !! self.tables[table][field].foreignKey.isPrimaryKey)))
                text[table] += spaces + spaces + spaces + "primaryKey: true";
              else return true
            }
            else if (attr === "allowNull") {
              text[table] += spaces + spaces + spaces + attr + ": " + self.tables[table][field][attr];
            }
            else if (attr === "defaultValue") {
              let val_text = defaultVal;

              if (isSerialKey) return true

              //mySql Bit fix
              if (self.tables[table][field].type.toLowerCase() === 'bit(1)') {
                val_text = defaultVal === "b'1'" ? 1 : 0;
              }

              if (_.isString(defaultVal)) {
                let field_type = self.tables[table][field].type.toLowerCase();
                if (field_type.indexOf('date') === 0 || field_type.indexOf('timestamp') === 0) {
                  if (_.endsWith(defaultVal, '()')) {
                    val_text = "sequelize.fn('" + defaultVal.replace(/\(\)$/, '') + "')"
                  }
                  else if (_.includes(['current_timestamp', 'current_date', 'current_time', 'localtime', 'localtimestamp'], defaultVal.toLowerCase())) {
                    val_text = "sequelize.literal('" + defaultVal + "')"
                  } else {
                    val_text = "'" + val_text + "'"
                  }
                } else {
                  val_text = "'" + val_text + "'"
                }
              }
              if(defaultVal === null) {
                return true;
              } else {
                text[table] += spaces + spaces + spaces + attr + ": " + val_text;
              }
            }
            else if (attr === "type" && self.tables[table][field][attr].indexOf('ENUM') === 0) {
              text[table] += spaces + spaces + spaces + attr + ": DataTypes." + self.tables[table][field][attr];
            } else {
              let _attr = (self.tables[table][field][attr] || '').toLowerCase();
              let val = "'" + self.tables[table][field][attr] + "'";
              if (_attr === "tinyint(1)" || _attr === "boolean" || _attr === "bit(1)") {
                val = 'DataTypes.BOOLEAN';
              }
              else if (_attr.match(/^(smallint|mediumint|tinyint|int)/)) {
                let length = _attr.match(/\(\d+\)/);
                val = 'DataTypes.INTEGER' + (!  _.isNull(length) ? length : '');
              }
              else if (_attr.match(/^bigint/)) {
                val = 'DataTypes.BIGINT';
              }
              else if (_attr.match(/^string|letchar|letying|nletchar/)) {
                val = 'DataTypes.STRING';
              }
              else if (_attr.match(/^char/)) {
                let length = _attr.match(/\(\d+\)/);
                val = 'DataTypes.CHAR' + (!  _.isNull(length) ? length : '');
              }
              else if (_attr.match(/text|ntext$/)) {
                val = 'DataTypes.TEXT';
              }
              else if (_attr.match(/^(date)/)) {
                val = 'DataTypes.DATE';
              }
              else if (_attr.match(/^(time)/)) {
                val = 'DataTypes.TIME';
              }
              else if (_attr.match(/^(float|float4)/)) {
                val = 'DataTypes.FLOAT';
              }
              else if (_attr.match(/^decimal/)) {
                val = 'DataTypes.DECIMAL';
              }
              else if (_attr.match(/^(float8|double precision)/)) {
                val = 'DataTypes.DOUBLE';
              }
              else if (_attr.match(/^uuid|uniqueidentifier/)) {
                val = 'DataTypes.UUIDV4';
              }
              else if (_attr.match(/^json/)) {
                val = 'DataTypes.JSON';
              }
              else if (_attr.match(/^jsonb/)) {
                val = 'DataTypes.JSONB';
              }
              else if (_attr.match(/^geometry/)) {
                val = 'DataTypes.GEOMETRY';
              }
              text[table] += spaces + spaces + spaces + attr + ": " + val;
            }
            
            text[table] += ",";
            text[table] += "\n";
          });
          
          text[table] += spaces + spaces + spaces + "field: " + `"${field}"`;
          text[table] += ",";
          text[table] += "\n";

          // removes the last `,` within the attribute options
          text[table] = text[table].trim().replace(/,+$/, '') + "\n";

          text[table] += spaces + spaces + "}";
          if ((i+1) < fields.length) {
            text[table] += ",";
          }
          text[table] += "\n";
        });

        text[table] += spaces + "}";

        //conditionally add additional options to tag on to orm objects
        let hasadditional = _.isObject(self.options.additional) && _.keys(self.options.additional).length > 0;

        text[table] += ", {\n";

        text[table] += spaces + spaces  + "tableName: '" + table + "',\n";

        text[table] = text[table].trim()
        text[table] = text[table].substring(0, text[table].length - 1);
        text[table] += "\n" + spaces + "}";
        
        //resume normal output
        text[table] += ");\n};\n";
        _callback(null);
      }, function(){
        self.sequelize.close();
        self.write(text, callback);
      });
    }
  }

  auto.run(function (err) {
    if (err) throw err;
    console.log('done!');
    process.exit(1);
  });
}).catch(e=>{
  console.log(e);
  process.exit(1);
})
