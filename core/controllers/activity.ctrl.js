var express = require('express');
var router = express.Router();
var responseService = require('../services/response.service');
var activityService = require('../services/activity.service');
router.post("/", async (req, res) => {
    try {
        req.body["created_by"] = req.user.id;
        let result = await activityService.addActivity(req.body);
        responseService.successResponse(result, 'addActivity', res);
    } catch (error) {
        responseService.errorResponse(error, 'addActivity', res);
    }
});

router.get("/:id", async (req, res) => {
    try {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 100,
            applicant: req.params.id
        };
        let result = await activityService.getActivity(data);
        responseService.successResponse(result, 'getActivity', res);
    } catch (error) {
        responseService.errorResponse(error, 'getActivity', res);
    }
});

module.exports.activity = router;
