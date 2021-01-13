var express = require('express');
var router = express.Router();
var referredApplicantService = require("../services/referred.service");
var responseService = require('../services/response.service');
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
        if (results.hits && results.hits.hits && results.hits.hits.length) {
            var applicants = [];
            for (var iHit = 0; iHit < results.hits.hits.length; iHit++) {
                results.hits.hits[iHit]._source._id = results.hits.hits[iHit]._id;
                applicants.push(results.hits.hits[iHit]._source);
            }
            responseService.response(req, null, 'Applicants GET', {
                applicants: applicants,
                total: results.hits.total.value || results.hits.total
            }, res);
        } else {
            responseService.response(req, null, 'Applicants GET', null, res);
        }
    } catch (err) {
        responseService.response(req, err, 'Applicants GET', null, res);
    }
});

module.exports.referred = router;
