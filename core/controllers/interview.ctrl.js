var express = require('express');
var router = express.Router();
var responseService = require('../services/response.service');
var interviewService = require('../services/interview.service');

router.post("/", async (req, res) => {
    try {
        var interview = await interviewService.createAndInvite(req);
        responseService.response(req, null, 1, interview, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

router.put("/", async (req, res) => {
    try {
        var interview = await interviewService.rescheduleAndInvite(req);
        responseService.response(req, null, 1, interview, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

router.get("/:interviewId", async (req, res) => {
    try {
        var interviews = await interviewService.getAllByInterview(req);
        responseService.response(req, null, 1, interviews, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

router.get("/dates/:start/:end", async (req, res) => {
    try {
        var interviews = await interviewService.getAllBetweenDates(req);
        responseService.response(req, null, 1, interviews, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

router.get("/candidate/:candidateId", async (req, res) => {
    try {
        var interviews = await interviewService.getAllByCandidate(req);
        responseService.response(req, null, 1, interviews, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

router.post("/result", async (req, res) => {
    try {
        var results = await interviewService.saveResult(req);
        responseService.response(req, null, 1, results, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

router.get("/result/:id", async (req, res) => {
    try {
        var results = await interviewService.getResult(req);
        responseService.response(req, null, 1, results, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

router.put("/result", async (req, res) => {
    try {
        var results = await interviewService.deleteResult(req);
        responseService.response(req, null, 1, results, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

router.put("/comment", async (req, res) => {
    try {
        var comment = await interviewService.comment(req);
        responseService.response(req, null, 1, comment, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

router.post("/criteria", async (req, res) => {
    try {
        if (req.body.name) {
            let criteria = await interviewService.addCriteria(req);
            responseService.successResponse(criteria, 'Add criteria', res);
        } else {
            let err = { status: 400, message: 'criteria is missing' };
            responseService.errorResponse(err, 'Add criteria', res);    
        }
    }  catch (error) {
        let err = { status: 400, message: error };
        responseService.errorResponse(err, 'Add criteria', res);
    }
});

router.get("/", async (req, res) => {
    try {
        var results = await interviewService.getInterviews(req);
        responseService.response(req, null, 1, results, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

module.exports.interview = router;