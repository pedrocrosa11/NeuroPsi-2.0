var mysql = require('mysql');
var pool = mysql.createPool({
    connectionLimit: 10,
    host: 'remotemysql.com',
    user: 'LfwsgKOzgL',
    password: 'vL113Y7U5x',
    database: 'LfwsgKOzgL'
});

exports.pool = pool;