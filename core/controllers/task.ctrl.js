var express = require('express');
var router = express.Router();
var responseService = require('../services/response.service');
var TaskService = require('../services/task.servies');
router.post("/", async (req, res) => {
    try {
        req.body["ownerId"] = req.user.id;
        let result = await TaskService.addTask(req.body);
        responseService.successResponse(result, 'addTask', res);
    } catch (error) {
        responseService.errorResponse(error, 'addTask', res);
    }
});
router.put("/:id", async (req, res) => {
    try {
        req.body["ownerId"] = req.user.id;
        req.body["id"] = req.params.id;
        let result = await TaskService.updateTask(req.body);
        responseService.successResponse(result, 'addTask', res);
    } catch (error) {
        responseService.errorResponse(error, 'addTask', res);
    }
});

router.get("/", async (req, res) => {
    try {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 100,
            filter: req.query.filter,
            status: req.query.status,
            ownerId: req.user.id
        };
        let result = await TaskService.getTask(data);
        responseService.successResponse(result, 'getTask', res);
    } catch (error) {
        responseService.errorResponse(error, 'getTask', res);
    }
});

router.get("/:id", async (req, res) => {
    try {
        let data = {
            offset: req.query.offset || 0,
            limit: req.query.limit || 100,
            applicant: req.params.id
        };
        let result = await TaskService.getApplicantTask(data);
        responseService.successResponse(result, 'getApplicantTask', res);
    } catch (error) {
        responseService.errorResponse(error, 'getApplicantTask', res);
    }
});
router.delete("/:id", async (req, res) => {
    try {
        let data = {
            id: req.params.id,
            ownerId: req.user.id
        };
        let result = await TaskService.deleteTasks(data);
        responseService.successResponse(result, 'deleteTasks', res);
    } catch (error) {
        responseService.errorResponse(error, 'deleteTasks', res);
    }
});

module.exports.task = router;
