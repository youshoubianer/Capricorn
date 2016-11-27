'use strict';

const config = require('../common/config');
const sync = require('../common/sync');
const Sequelize = require('sequelize');
const co = require('co');
const wordDB = config.database.word;

//数据库连接
const db = new Sequelize(wordDB.database, wordDB.username, wordDB.password, {
  dialect: wordDB.dialect,
  host: wordDB.host,
  port: wordDB.port,
  timezone: '+08:00',
  define: { 
    timestamps: false,
  },
  pool: {
    maxConnections: wordDB.pool,
  },
  omitNull: true,
  option:{
    logging: wordDB.logging,
  }
});

//generate random value
const randomValue = (base) => (
  Math.floor(Math.random() * base)
)


//生成随机名称
function* getRandomName(){
  let word = db.import(__dirname+'/../schema/cetsix.js');
  let adjWord = yield word.findAndCountAll({
    where:{
      meaning:{$like: '%a.%'}
    }
  });
  
  let nWord = yield word.findAndCountAll({
    where:{
      meaning:{$like: '%n.%'}
    }
  });
  
  let adjIdx = randomValue(adjWord.count)
  let nIdx = randomValue(nWord.count)
  // console.log('idx',adjIdx,nIdx);
  
  let nameInfo = {
    adjInfo:{
      words: adjWord.rows[adjIdx].words,
      meaning: adjWord.rows[adjIdx].meaning,
    },
    nInfo:{
      words: nWord.rows[nIdx].words,
      meaning: nWord.rows[nIdx].meaning,
    }
  };
  console.log('nameInfo:',nameInfo);
  return nameInfo;
}

if(process.argv[2] === 'sync'){
  sync(wordDB)
}
else{
  co(function * (){
    let nameInfo =  yield getRandomName();
    let randomName = nameInfo.adjInfo.words + '-' + nameInfo.nInfo.words
    console.log('\n', nameInfo.adjInfo.words,' : ',nameInfo.adjInfo.meaning);
    console.log(nameInfo.nInfo.words,' : ',nameInfo.nInfo.meaning);
    console.log('get one name: ',randomName);
    process.exit(0);
  })
  
  
  
}
