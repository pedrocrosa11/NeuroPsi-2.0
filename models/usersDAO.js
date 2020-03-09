
var mysql = require('./mysqlConn').pool;

module.exports.getUser = function(name, callback, next){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status: "Error in the connection to the database"});
            return
        }
        conn.query("select userId, name, sex, email, birthdate, coords, patientId, neuroId from Location inner join User on user_locId = locId left join Patient on userId = patient_userId left join Neuropsi on userId = neuro_userId where name = ?", [name], function(err, user){
            conn.release();
            if (err){
                callback(err, {code:500, status: "Error in a database query"});
                return;
            }
            var user = user[0];
            callback(false, {code: 200, status:"Ok", user: user});
        })
    })
}