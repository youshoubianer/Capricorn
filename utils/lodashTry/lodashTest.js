'use strict'

const _ = require('./lodashTry')

//chunk
var chunkArray = ['a', 'b', 'c', 'd','e', 'f']
// console.log(_.chunk(array,4))

//compack
var compactArray = [0, 1, false, 2, '', 3]
// console.log(_.compact(compactArray));

//concat
var concatArray = [1]
// console.log(_.concat(concatArray, 2, [3], [[4]]));

//difference
console.log(_.difference([3, 2, 1], [4, 2]));
