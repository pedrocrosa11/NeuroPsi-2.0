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

module.exports.getDiscalcTest = function(testId, callback, next){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("select * from Discalculia where discalc_testId = ?;", [testId], function(err, result){
            if(err){
                callback(err, {code:500, status: "Error in a database query"});
                return;
            }
            callback(false, {code:200, status:"Ok", discalc:result});
        });
    })
}

module.exports.getPatientTests = function(patientId, callback, next){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("select min(discalcId) as discalcId, min(reyId) as reyId, testId, testState, assignedDate, name as neuro, attribId, completedDate, comment from User inner join Neuropsi on neuro_userId = userId inner join Attribution on attrib_neuroId = neuroId inner join Test on test_attribId = attribId left join Discalculia on testId = discalc_testId left join Rey on testId = rey_testId where attrib_fileId = ? group by (testId) order by assignedDate desc;",
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
            console.log(result)
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
//NEW---------
module.exports.saveDiscalculiaResults = function(testId, discalc, callback){
    console.log(discalc)
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in a database connection"});
            return;
        }
        var query = "update Test set testState = ? where testId = ?"
        conn.query(query, ["Completed", testId], function(err, rows){
            if(err){
                callback(err, {code:500, status:err});
                return;
            }
            safeResultRow(conn, testId, discalc, callback)
        })
    })
}

function safeResultRow(conn, testId, discalc, callback){
    if(discalc.length > 0){
        var result = discalc[0].result
        var discalcId = discalc[0].discalcId
        var query = "update Discalculia set result = ? where discalcId = ?;"
        conn.query(query, [result, discalcId], function(err, rows){
            if(err){
                callback(err, {code:500, status:err});
                return;
            }
            discalc.shift()
            safeResultRow(conn, testId, discalc, callback)
        })
    }else{
        callback(false, {code:200, status:"Ok"});
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