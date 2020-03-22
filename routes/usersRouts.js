var express = require('express');
var router = express.Router();
var usersDAO = require('../models/usersDAO');

router.get('/', function(req, res, next){
    usersDAO.getUser(req.query, function(err, result){
        if(err){
            res.statusMessage = result.status;
            res.status(result.code).json(err);
            return;
        }
        res.status(200).send(result);
    }, next);
});

module.exports = router;
