const express = require('express');
var responseService = require('../services/response.service');
var lcationService = require('../services/location.service');
let router = express.Router();

router.get('/search/:text', async (req, res) => {
    try {
        locations = await lcationService.searchLocation(req);
        responseService.response(req, null, "", locations, res);
    } catch (err) {
        responseService.response(req, err, "", null, res);
    }
});

module.exports.locationRoutes = router;