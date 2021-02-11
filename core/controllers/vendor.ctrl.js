var express = require('express');
var router = express.Router();
var esSearch = require('../services/es.service');
var skillService = require('../services/skill.service');
var locationService = require('../services/location.service');
var responseService = require('../services/response.service');
router.get("/job", async (req, res) => {
    try {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 20,
            sortBy: req.query.sortBy || "modified_at",
            order: req.query.order || -1,
            owner: req.user.email,
            searchText: req.query.searchText || null
        };
        let results = await esSearch.searchVendorJobs(data);
        if (results.hits && results.hits.hits && results.hits.hits.length) {
            var jobs = [];
            for (var iHit = 0; iHit < results.hits.hits.length; iHit++) {
                results.hits.hits[iHit]._source._id = results.hits.hits[iHit]._id;
                results.hits.hits[iHit]._source.skills = await skillService.getAllByIds(results.hits.hits[iHit]._source.skills);
                results.hits.hits[iHit]._source.locations = await locationService.getAllByIds(results.hits.hits[iHit]._source.locations);
                jobs.push(results.hits.hits[iHit]._source);
            }
            responseService.successResponse({count: results.hits.total, jobs: jobs}, 'searchVendorJobs', res);
        } else {
            responseService.successResponse({count: 0, jobs: []}, 'searchVendorJobs', res);
        }
    } catch (error) {
        responseService.errorResponse(error, 'searchVendorJobs', res);
    }
});

module.exports.vendor = router;
