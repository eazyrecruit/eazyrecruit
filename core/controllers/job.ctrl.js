var express = require('express');
var router = express.Router();
var jobService = require('../services/job.service');
var esSearch = require('../services/es.service');
var skillService = require('../services/skill.service');
var locationService = require('../services/location.service');
var responseService = require('../services/response.service');
var multer = require('multer');
router.get("/jobname", async (req, res) => {
    try {

        let result = await jobService.getJobsName(req.query.jobId);
        responseService.successResponse(result, 'getJob', res);
    } catch (error) {
        responseService.errorResponse(error, 'getJob', res);
    }
});
router.get("/applicants/pipelines/:id", async (req, res) => {
    try {
        var results = await jobService.getWithApplicantsAndPipeline(req);
        responseService.response(req, null, 'Job Applicants and Pipelines GET', results, res);
    } catch (err) {
        responseService.response(req, err, 'Jobs Applicants and Pipelines GET', null, res);
    }
});


router.get("/applicants/search", async (req, res) => {
    try {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            jobId: req.query.jobId,
            searchText: req.query.search
        };
        var results = await jobService.searchWithApplicantsAndPipeline(data);
        responseService.response(req, null, 'Job Applicants and Pipelines GET', results, res);
    } catch (err) {
        responseService.response(req, err, 'Jobs Applicants and Pipelines GET', null, res);
    }
});
router.get("/applicants", async (req, res) => {
    try {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            source: req.query.source || null,
            jobId: req.query.jobId || null,
            sortBy: req.query.sortBy || "modified_at",
            order: req.query.order || -1,
            searchText: req.query.search || null
        };
        if (req.query.startDate && req.query.endDate) {
            let startDate = new Date(req.query.startDate);
            let endDate = new Date(req.query.endDate);
            if (startDate !== undefined && endDate !== undefined) {
                endDate.setHours(23, 59, 59);
                startDate.setHours(0, 0, 0);
                data["startDate"] = startDate;
                data["endDate"] = endDate;
            }
        }
        var results = await jobService.getJobsApplicant(data);
        responseService.response(req, null, 'Job Applicants and Pipelines GET', results, res);
    } catch (err) {
        responseService.response(req, err, 'Jobs Applicants and Pipelines GET', null, res);
    }
});
router.get("/:id", async (req, res) => {
    try {
        var jobs = await jobService.getById(req.params.id);
        responseService.response(req, null, 'Jobs GET', jobs, res);
    } catch (err) {
        responseService.response(req, err, 'Jobs GET', null, res);
    }
});
router.put("/archive/:jobId", async (req, res) => {
    try {
        var job = await jobService.archive({status: req.body.status, id: req.params.jobId, user: req.user});
        responseService.response(req, null, 'Jobs Archive', job, res);
    } catch (err) {
        responseService.response(req, err, 'Jobs Archive', null, res);
    }
});

router.get("/", async (req, res) => {
    try {
        var results = await esSearch.searchJobs(req);
        if (results.hits && results.hits.hits && results.hits.hits.length) {
            var jobs = [];
            for (var iHit = 0; iHit < results.hits.hits.length; iHit++) {
                results.hits.hits[iHit]._source._id = results.hits.hits[iHit]._id;
                results.hits.hits[iHit]._source.skills = await skillService.getAllByIds(results.hits.hits[iHit]._source.skills);
                results.hits.hits[iHit]._source.locations = await locationService.getAllByIds(results.hits.hits[iHit]._source.locations);
                jobs.push(results.hits.hits[iHit]._source);
            }
            responseService.successResponse({count: results.hits.total, jobs: jobs}, 'Jobs GET', res);
        } else {
            responseService.successResponse({count: 0, jobs: []}, 'Jobs GET', res);
        }
    } catch (err) {
        let error = {
            status: 500,
            message: "internal server error"
        }
        console.log('save job error : ', err);
        responseService.errorResponse(error, 'Jobs GET', res);
    }
});

// create new records in database
var metaImage = multer({storage: multer.memoryStorage(), limits: {fileSize: 1000 * 1000 * 12}});
router.post("/", metaImage.any(), async (req, res) => {
    try {
        var job = await jobService.save(req);
        responseService.successResponse(job, 'Job SAVE', res);
    } catch (err) {
        let error = {
            status: 500,
            message: "internal server error"
        }
        console.log('save job error : ', err);
        responseService.errorResponse(error, 'Job SAVE', res);
    }
});

// create new records in database
router.post("/pipeline", async (req, res) => {
    try {
        var job = await jobService.addPipeline(req);
        responseService.response(req, null, 'Job Pipeline SAVE', job, res);
    } catch (err) {
        responseService.response(req, err, 'Job Pipeline SAVE', null, res);
    }
});

// create new records in database
router.put("/pipeline", async (req, res) => {
    try {
        var job = await jobService.editPipeLine(req.body);
        responseService.response(req, null, 'Job Pipeline Update', job, res);
    } catch (err) {
        responseService.response(req, err, 'Job Pipeline Update', null, res);
    }
});

// create new records in database
router.post("/applicant", async (req, res) => {
    try {
        var job = await jobService.addApplicant(req);
        responseService.response(req, null, 'Job Pipeline SAVE', job, res);
    } catch (err) {
        responseService.response(req, err, 'Job Pipeline SAVE', null, res);
    }
});


router.get("/pipelines/:id", async (req, res) => {
    try {
        console.log("I AM HERE2 ", req.params.id);
        var results = await jobService.getJobsPipeLine(req);
        responseService.response(req, null, 'Job Applicants and Pipelines GET', results, res);
    } catch (err) {
        responseService.response(req, err, 'Jobs Applicants and Pipelines GET', null, res);
    }
});
router.put("/applicant", async (req, res) => {
    try {
        var job = await jobService.editApplicant(req);
        responseService.response(req, null, 'Job Pipeline SAVE', job, res);
    } catch (err) {
        responseService.response(req, err, 'Job Pipeline SAVE', null, res);
    }
});

// update record to make it delete.
router.delete("/:id", (req, res) => {
    jobService.delete(req, function (err, data) {
        responseService.response(req, err, 'delete job', data, res);
    });
});

router.delete("/applicant/:id", async (req, res) => {
    try {
        let result = await jobService.removeApplicant(req);
        responseService.successResponse(result, 'remove applicant', res);
    } catch (error) {
        responseService.errorResponse(error, 'remove applicnat', res);
    }
});

// return job which is not deleted according to id


router.get("/criteria", (req, res) => {
    interviewCriteriaService.get(req, (err, data) => {
        responseService.response(req, err, 'get job criteria', data, res);
    });
});

module.exports.job = router;
