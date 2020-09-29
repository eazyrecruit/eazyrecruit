var express = require('express');
var router = express.Router();
var responseService = require('../services/response.service');
var reportService = require('../services/report.service');

router.get('/source/day/last15', async (req, res) => {
    try {
        var reportData = await reportService.resumeByDayBySource15Days(req);
        responseService.response(req, null, 'Report', reportData, res);
    } catch (err) {
        responseService.response(req, err, 'Report', null, res);
    }
});

module.exports.report = router;