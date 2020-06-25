var mysql = require('./mysqlConn').pool;

module.exports.getNeuroPatients = function(neuroId, callback, next){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status: "Error in the connection to the database"})
            return;
        }
        conn.query("select patientId, name, sex, email, TIMESTAMPDIFF(YEAR, birthdate, CURRENT_DATE()) as age, user_locId, attribId from Location inner join User on user_locId = locId inner join Patient on patient_userId = userId inner join Attribution on attrib_fileId = patientId where attrib_neuroId = ?;", 
        [neuroId], function(err, result){
            conn.release();
            if(err){
                callback(err, {code:500, status: "Error in a database query"})
                return;
            }
            callback(false, {code:200, status:"Ok", patients: result});
        })
    })
};

module.exports.getPatient = function(patientId, callback, next){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("select patientId, name, sex, email, TIMESTAMPDIFF(YEAR, birthdate, CURRENT_DATE()) as age, user_locId from Location inner join User on user_locId=locId inner join Patient on patient_userId=userId where patientId = ?;",
        [patientId], function(err, result){
            conn.release();
            if(err){
                callback(err, {code:500, status:"Error in a database query"})
                return;
            }
            callback(false, {code:200, status:"Ok", patient: result[0]})
        })
    })
}

module.exports.scheduleTest = function(attribId, callback){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("insert into Test (assignedDate, test_attribId) values (?, ?);", [new Date(), attribId], function(err, result){
            conn.release();
            if(err){
                callback(err, {code:500, status: "Error in a database query"});
                return;
            }
            callback(false, {code:200, status:"Ok"});
        });
    })
}

//NEW------
module.exports.scheduleTestDiscalc = function(attribId, callback){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("insert into Test (assignedDate, test_attribId) values (?, ?);", [new Date(), attribId], function(err, result){
            if(err){
                callback(err, {code:500, status: "Error in a database query"});
                return;
            }
            var lista = guardarPerguntas(0,15);
            var query = "insert into Discalculia (firstNumber, sign, secondNumber, correctAnswer, discalc_testId) values "
            var values = []
            for (l of lista){
                query += "(?, ?, ?, ?, ?),"
                values.push(l.firstNumber)
                values.push(l.sign)
                values.push(l.secondNumber)
                values.push(l.correctAnswer)
                values.push(result.insertId)
            }
            query = query.slice(0,-1)
            conn.query(query, values, function(err, result){
                if(err){
                    callback(err, {code:500, status: "Error in a database query"});
                    return;
                }
                callback(false, {code:200, status:"Ok"});
            });
        });
    })
}
//COPIA DE testDiscalc.js

//Gera numeros random
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
  }

//Devolve pergunta de Soma
function sumQuestion(min, max){
    var pergunta = {firstNumber: getRandomInt(min, max), sign:"+", secondNumber: getRandomInt(min, max)}
    pergunta.correctAnswer = pergunta.firstNumber+pergunta.secondNumber
    return pergunta 
}

//Devolve pergunta de Subtracao
function diffQuestion(min, max){
    var pergunta = {firstNumber: getRandomInt(min, max), sign:"-", secondNumber: getRandomInt(min, max)}
    pergunta.correctAnswer = pergunta.firstNumber-pergunta.secondNumber
    return pergunta 
}

//Devolve pergunta de Multiplicacao
function multQuestion(min, max){
    var pergunta = {firstNumber: getRandomInt(min, max), sign:"x", secondNumber: getRandomInt(min, max)}
    pergunta.correctAnswer = pergunta.firstNumber*pergunta.secondNumber
    return pergunta 
}

//Carrega as perguntas todas na lista (window on load)
function guardarPerguntas(min, max){
    var lista = []
    for (i = 0; i < 5; i++){
        lista.push(sumQuestion(min, max))
    }

    for (i = 0; i < 5; i++){
        lista.push(diffQuestion(min, max))
    }

    for (i = 0; i < 5; i++){
        lista.push(multQuestion(min, max))
    }
    return lista
}


module.exports.getReplay = function(testId, callback, next){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status: "Error in the connection to the database"})
            return;
        }
        conn.query("select rec from Result where result_testId = ?", [testId], function(err, result){
            conn.release();
            if(err){
                callback(err, {code:500, status:"Error in a databse query"});
                return;
            }
            
            var rec = result[0].rec;
            callback(false, {code:200, status:"Ok", rec: rec});
        })
    })
}

module.exports.getNeuroPatientTestInfo = function(attribId, callback, next){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("select min(discalcId) as discalcId, min(reyId) as reyId, testId, testState, assignedDate, attribId, completedDate, comment from User inner join Neuropsi on neuro_userId = userId inner join Attribution on attrib_neuroId = neuroId inner join Test on test_attribId = attribId left join Discalculia on testId = discalc_testId left join Rey on testId = rey_testId where attribId=? group by (testId) order by assignedDate desc;",
        [attribId], function(err, result){
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

module.exports.getNeuroTestsRoutes = function(neuroId, callback, next){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status: "Error in the connection to the database"})
            return;
        }
        conn.query("select MAX(attrib_fileId) as patientId, MAX(name) as name, MAX(testId) as testId, count(routeId) as repetitions, coords, waypoints, time, distance from Location inner join Route on route_locId = locId inner join Test on test_routeId = routeId inner join Attribution on test_attribId = attribId inner join Patient on attrib_fileId = patientId inner join User on patient_userId = userId where attrib_neuroId = ? and (testState = ? or testState = ?) group by routeId order by patientId;", 
        [neuroId, "Completed", "Filed"], function(err, result){
            conn.release();
            if(err){
                callback(err, {code:500, status:"Error in a databse query"});
                return;
            }
            var testsRoutes = [];

            for(i=0; i<result.length; i++){
                if(!result[i+1] || result[i+1].patientId != result[i].patientId){
                  var splice = result.splice(0,i+1);
                  var patientRoutes = [];
                  var patientId = splice[0].patientId;
                  var name = splice[0].name;
                  for(r of splice){
                      patientRoutes.push({testId: r.testId, repetitions: r.repetitions, coords: r.coords, waypoints: r.waypoints, time: r.time, distance: r.distance})
                  }
                  testsRoutes.push({patientId: patientId, name: name, patientRoutes: patientRoutes});
                  i=-1;
                }
              }
            callback(false, {code:200, status:"Ok", testsRoutes: testsRoutes});
        })
    })
}

module.exports.fileTest = function(testId, comment, callback){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("update Test set testState = ? where testId = ?;", ["Filed", testId], function(err){
            if(err){
                callback(err, {code:500, status: "Error in a database query"});
                return;
            }
            conn.query("update Result set comment = ? where result_testId = ?;", [comment, testId], function(err){
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

module.exports.rescheduleTest = function(testId, attribId, comment, testType, callback){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("update Test set testState = ? where testId = ?;", ["Reschedule", testId], function(err){
            if(err){
                callback(err, {code:500, status: "Error in a database query"});
                return;
            }
            conn.query("update Result set comment = ? where result_testId = ?;", [comment, testId], function(err){
                if(err){
                    callback(err, {code:500, status: "Error in a database query"});
                    return;
                }
                if(testType == "discalc"){
                    scheduleTestDiscalc(attribId, callback)
                }else if(testType == "ray"){
                    scheduleTest(attribId, callback);
                }
                /*conn.query("insert into Test (assignedDate, test_attribId) values (?, ?);", [new Date(), attribId], function(err, result){
                    if(err){
                        callback(err, {code:500, status: "Error in a database query"});
                        return;
                    }
                    conn.query("insert into Reschedule (resched_testId, resched_newTestId) values (?,?)", [testId, result.insertId], function(err, result){
                        conn.release();
                        if(err){
                            callback(err, {code:500, status: "Error in a database query"});
                            return;
                        }
                        callback(false, {code:200, status:"Ok"});
                    })
                });*/ 
            });
        });
    })
}

module.exports.getNeuroPatientsTestsByState = function(neuroId, testState, callback, next){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status: "Error in the connection to the database"})
            return;
        }
        conn.query("select testId, testState, assignedDate, completedDate, comment from Result right outer join Test on testId = result_testId inner join Attribution on test_attribId = attribId where attrib_neuroId = ? and testState = ?", 
        [neuroId, testState], function(err, result){
            conn.release();
            if(err){
                callback(err, {code:500, status:"Error in a databse query"});
                return;
            }
            callback(false, {code:200, status:"Ok", tests: result});
        })
    })
}

module.exports.saveRoutes = function(testId, waypoints, time, distance, callback){
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status:"Error in the connection to the database"})
            return;
        }
        conn.query("update Route set waypoints=?, time=?, distance=? where routeId in (select test_routeId from Test where testId = ?);", [waypoints, time, distance, testId], function(err, result){
            conn.release();
            if(err){
                callback(err, {code:500, status: "Error in a database query"});
                return;
            }
            callback(false, {code:200, status:"Ok"});
        });
    })
}

