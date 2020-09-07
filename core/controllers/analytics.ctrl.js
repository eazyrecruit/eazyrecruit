const express = require('express');
var responseService = require('../services/response.service');
var analyticsService = require('../services/analytics.service');
let router = express.Router();

router.get('/', async (req, res) => {
    try {
       let analytics = await analyticsService.getAnalyticsData(req);
        responseService.successResponse(analytics, 'getAnalyticsData', res);
    } catch (err) {
        responseService.errorResponse({status: 500, message: err}, 'getAnalyticsData', res);
    }
});

module.exports.analyticsRoutes = router;
