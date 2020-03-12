const express = require('express');
var responseService = require('../services/response.service');
var skillService = require('../services/skill.service');
let router = express.Router();

router.get('/search/:text', async (req, res) => {
    try {
        skills = await skillService.searchSkills(req);
        responseService.response(req, null, "", skills, res);
    } catch (err) {
        responseService.response(req, err, "", null, res);
    }
});


module.exports.skillRoutes = router;