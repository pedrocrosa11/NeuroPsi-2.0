var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'remotemysql.com',
    user: 'Nf7qkPEaA0',
    password: '7cqDVkvVqF',
    database: 'Nf7qkPEaA0'
});

exports.pool = pool;