let express = require('express');
let router = express.Router();
let migrateService = require('../services/migrate.service');

router.post('/user', async (req, res) => {
    try {
        let result = await migrateService.restoreUser(req.body);
        res.send(result);
    } catch (error) {
        res.send(error);    
    }
});

router.post('/state', async (req, res) => {
    try {
        let result = await migrateService.restoreState(req.body);
        res.send(result);
    } catch (error) {
        res.send(error);    
    }
});

router.post('/job', async (req, res) => {
    try {
        let result = await migrateService.restoreJob(req.body);
        res.send(result);
    } catch (error) {
        res.send(error);    
    }
});

router.post('/applicant', async (req, res) => {
    try {
        let result = await migrateService.restoreApplicant(req.body);
        res.send(result);
    } catch (error) {
        res.send(error);    
    }
});

router.post('/resume', async (req, res) => {
    try {
        let result = await migrateService.restoreResume(req.body);
        res.send(result);
    } catch (error) {
        res.send(error);    
    }
});

router.post('/jobapplicant', async (req, res) => {
    try {
        let result = await migrateService.restoreJobApplicant(req.body);
        res.send(result);
    } catch (error) {
        res.send(error);    
    }
});

router.post('/comment', async (req, res) => {
    try {
        let result = await migrateService.restoreComments(req.body);
        res,send(result);
    } catch (error) {
        res.send(error);
    }
});

router.post('/history', async (req, res) => {
    try {
        let result = await migrateService.restoreHistory(req.body);
        res.send(result);
    } catch (error) {
        res.send(error);
    }
});

module.exports.migrate = router;