var express = require('express');
var router = express.Router();
var neuroDAO = require('../models/neuroDAO');
var patientsDAO = require('../models/patientsDAO');

router.get('/:patientId', function(req, res, next){
    neuroDAO.getPatient(req.params.patientId, function(err, result){
        if(err){
            res.statusMessage = result.status;
            res.status(result.code).json(err);
            return;
        }
        res.status(200).send(result);
    }, next)
});

router.get('/:patientId/tests/pending', function(req, res, next){
    patientsDAO.searchPendingTests(req.params.patientId, function(err, result){
        if(err){
            res.statusMessage = result.status;
            res.status(result.code).json(err);
            return;
        }
        res.status(200).send(result);
    }, next);
});

router.get('/:patientId/tests', function(req, res, next){
    patientsDAO.getPatientTests(req.params.patientId, function(err, result){
        if(err){
            res.statusMessage = result.status;
            res.status(result.code).json(err);
            return;
        }
        res.status(200).send(result);
    }, next);
});

router.post('/:patientId/tests/:testId/replay', function(req, res, next){
    var coords = {lat: req.body.lat, lng: req.body.lng};
    patientsDAO.saveReplay(req.params.testId, coords, req.body.rec, function(err, result){
        if(err){
            res.statusMessage = result.status;
            res.status(result.code).json(err);
            return;
        }
        res.send({status: "Ok"});
    }, next);
});

router.get('/:patientId/tests/:testId/replay', function(req, res, next) {
    neuroDAO.getReplay(req.params.testId, function(err, result){
        if(err){
            res.statusMessage = result.status;
            res.status(result.code).json(err);
            return;
        }
        res.status(200).send(result);
    })
});

router.post('/:patientId/tests/:testId/cancel', function(req, res, next){
    patientsDAO.cancelTest(req.params.testId, req.body.comment, function(err, result){
        if(err){
            res.statusMessage = result.status;
            res.status(result.code).json(err);
            return;
        }
        res.send({status: "Ok"});
    }, next);
});

router.post('/:patientId/tests/:testId/file', function(req, res, next){
    neuroDAO.fileTest(req.params.testId, req.body.comment, function(err, result){
        if(err){
            res.statusMessage = result.status;
            res.status(result.code).json(err);
            return;
        }
        res.send({status: "Ok"});
    }, next);
});

router.post('/:patientId/tests/:testId/routes', function(req, res, next){
    neuroDAO.saveRoutes(req.params.testId, req.body.waypoints, req.body.time, req.body.distance, function(err, result){
        if(err){
            res.statusMessage = result.status;
            res.status(result.code).json(err);
            return;
        }
        res.send({status: "Ok"});
    }, next);
});

module.exports = router;