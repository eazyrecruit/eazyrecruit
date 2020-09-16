const express = require('express');
var responseService = require('../services/response.service');
var skillService = require('../services/skill.service');
let router = express.Router();

router.get('/', async (req, res) => {
    try {
        skills = await skillService.searchSkills(req);
        responseService.successResponse(skills, 'get skills', res);
    } catch (err) {
        responseService.errorResponse({status: 500, message: err}, 'get skills', res);
    }
});

module.exports.skillRoutes = router;