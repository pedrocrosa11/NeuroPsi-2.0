var mysql = require('./mysqlConn').pool;

module.exports.register = function(patients, callback, next){
    mysql.getConnection(function(err, conn){
        if (err) {conn.release(); next(err);}
        else{
            conn.query("insert into User (id, name) values (?,?)", [patients.id, patients.name], function(err, rows){
                conn.release();
                callback(rows);
            })
        }
    })
}

module.exports.saveReplay = function(testId, coords, rec, callback){
    var routeId;
    var result;
    var locId;
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("select locId, routeId, ST_Distance_Sphere(coords, point(?,?)) as distance from Location inner join Route on route_locId = locId inner join Test on test_routeId = routeId where distance < 500 and test_attribId in (select attribId from Attribution, Test where test_attribId = attribId and testId = ?) order by distance limit 0,1;",
        [coords.lng, coords.lat, testId], function(err, result){
            if(err){
                callback(err, {code:500, status: "Error in a database query"})
                return;
            }
            result = result[0];
        });
        if(result){
            routeId = result[0].routeId;
        }else{
            conn.query("insert into Location (coords) values (point(?,?));", [coords.lng, coords.lat], function(err, result){
                if(err){
                    callback(err, {code:500, status:"Error in a database query"})
                    return;
                }
                locId = result.insertId;
                
                conn.query("insert into Route (route_locId) values (?);", [locId], function(err, result){
                    if(err){
                        callback(err, {code:500, status: "Error in a database query"})
                        return;
                    }
                    routeId = result.insertId;

                    conn.query("insert into Result (rec, completedDate, result_testId) values (?,?,?);", [rec, new Date(), testId], function(err, result){
                        if(err){
                            callback(err, {code:500, status: "Error in a database query"})
                            return;
                        }
                        conn.query("update Test set testState = ?, test_routeId = ? where testId = ?;", ["Completed", routeId, testId], function(err, result){
                            conn.release();
                            if(err){
                                callback(err, {code:500, status: "Error in a database query"})
                                return;
                            }
                            callback(false, {code:200, status:"Ok"});
                        });
                    })
                });
            })
        }
    })
}

module.exports.cancelTest = function(testId, comment, callback, next){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("update Test set testState = ? where testId = ?;", ["Canceled", testId], function(err){
            if(err){
                callback(err, {code:500, status: "Error in a database query"});
                return;
            }
            conn.query("insert into Result (completedDate, comment, result_testId) values (?,?,?);", [new Date(), comment, testId], function(err){
                conn.release();
                if(err){
                    callback(err, {code:500, status: "Error in a database query"});
                    return;
                }
                callback(false, {code:200, status:"Ok"});
            });
        });
    })
}

module.exports.getPatientTests = function(patientId, callback, next){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("select testId, testState, assignedDate, name as neuro, attribId, completedDate, comment from User inner join Neuropsi on neuro_userId = userId inner join Attribution on attrib_neuroId = neuroId inner join Test on test_attribId = attribId left outer join Result on testId = result_testId where attrib_fileId = ? order by assignedDate desc;",
        [patientId], function(err, result){
            conn.release();
            if(err){
                callback(err, {code:500, status:"Error in a database query"});
                return;
            }
            for(t of result){
                t.assignedDate = convertDate(t.assignedDate);
                t.completedDate = convertDate(t.completedDate);
                if(!t.comment){
                    t.comment = "-";
                }
            }
            callback(false, {code:200, status:"Ok", tests: result});
        })
    })
}

function convertDate(date){
    if(date){
        var formattedDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
        return formattedDate;
    }else{
        return "-";
    } 
}

/*function saveLocation(coords, callback){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("insert into Location (coords) values (point(?,?));", [coords.lng, coords.lat], function(err, result){
            if(err){
                callback(err, {code:500, status:"Error in a database query"})
                return;
            }
            console.log("1 "+result.insertId)
            var locId = result.insertId;
            console.log("2 "+locId);
            return locId
        })
    })
}*/