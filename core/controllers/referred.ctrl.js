var express = require('express');
var router = express.Router();
var referredApplicantService = require("../services/referred.service");
var responseService = require('../services/response.service');
var multer = require('multer');
var redisClient = require('../services/redis.service');
router.get("", async (req, res) => {
    try {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            sortBy: req.query.sortBy || "modified_at",
            order: req.query.order || -1,
            owner: req.user.email,
            search: req.query.search || null
        };
        var results = await referredApplicantService.searchReferredApplicants(data);
        responseService.response(req, null, 'Applicants GET', results, res);
    } catch (err) {
        responseService.response(req, err, 'Applicants GET', null, res);
    }
});


var resumeUpload = multer({storage: multer.memoryStorage(), limits: {fileSize: 1000 * 1000 * 12}});
router.post("/", resumeUpload.any(), async (req, res) => {
    try {
        const applicant = await referredApplicantService.save(req);
        let id = applicant.resume.toString();
        let parsedData = await redisClient.parse(id);
        responseService.response(req, null, "save ReferredApplicants", applicant, res);
    } catch (err) {
        responseService.response(req, err, "save ReferredApplicants", null, res);
    }
});

module.exports.referred = router;
