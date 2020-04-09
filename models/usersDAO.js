
var mysql = require('./mysqlConn').pool;
const md5 = require("md5");


module.exports.getUser = function(userParams, callback){
    console.log("getuser")
    var name = userParams.name
    var pass = userParams.pass
    var hashedPass = hash(pass, options = {salt: 100, rounds: 10})
    //console.log(hashedPass)
    mysql.getConnection(function(err, conn){
        if(err){
            callback(err, {code:500, status: "Error in the connection to the database"});
            return
        }
        conn.query("select userId, name, sex, email, birthdate, coords, patientId, neuroId from Location inner join User on user_locId = locId left join Patient on userId = patient_userId left join Neuropsi on userId = neuro_userId where name = ? and pass = ?", [name, hashedPass], function(err, user){
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


    /**
     *
     *
     * @param { string } rawPass - the password to be hashed
     * @param { object } [options={}] - object containing salt and rounds
     * @returns {string} 
     */
    hash = function(rawPassword, options = {}) {
      /**
       * salt is optional, if not provided it will be set to current timestamp
       */
      const salt = options.salt ? options.salt : new Date().getTime();
  
      /**
       * rounds is optional, if not provided it will be set to 10
       */
      const rounds = options.rounds ? options.rounds : 10;
  
      let hashed = md5(rawPassword + salt);
      for (let i = 0; i <= rounds; i++) {
        hashed = md5(hashed);
      }
      return `${salt}$${rounds}$${hashed}`;
    }
    /**
     *
     *
     * @param {string} rawPassword - the raw password
     * @param { string } hashedPassword - the hashed password
     * @returns
     */
    compare = function(rawPassword, hashedPassword) {
      try {
        const [ salt, rounds ] = hashedPassword.split('$');
        const hashedRawPassword = this.hash(rawPassword, { salt, rounds });
        return hashedPassword === hashedRawPassword;
      } catch (error) {
        throw Error(error.message);
      }
    }
  ;