var express = require('express');
var router = express.Router();
var responseService = require('../services/response.service');
var companyService = require('../services/company.service');
var validationService = require('../services/validation.service');

router.post("/", (req, res) => {
    companyService.save(req, (err, data) => {
        responseService.response(req, err, 2, data, res);
    });
});

router.get("/", (req, res) => {
    companyService.getCompany(req, (err, data) => {
        responseService.response(req, err, 2, data, res);
    });
});

router.get("/settings/", (req, res) => {
    companyService.getSettings(req, (err, data) => {
        responseService.response(req, err, 2, data, res);
    });
});

router.put("/settings/", (req, res) => {
    companyService.updateSettings(req, (err, data) => {
        responseService.response(res, err, 2, data, res);
    });
});

router.delete("/settings/", (req, res) => {
    companyService.deleteSettings(req, (err, data) => {
        responseService.response(req, err, 2, data, res);
    });
});

router.put("/", validationService.validateCompanyDetals, (req, res) => {
    companyService.update(req, (err, data) => {
        responseService.response(res, err, 2, data, res);
    });
});

router.delete("/", (req, res) => {
    companyService.delete(req, (err, data) => {
        responseService.response(req, err, 2, data, res);
    });
});

router.get("/settings/", (req, res) => {
    companyService.getSettings(req, (err, data) => {
        responseService.response(req, err, 2, data, res);
    });
});

router.put("/settings/", (req, res) => {
    companyService.updateSettings(req, (err, data) => {
        responseService.response(res, err, 2, data, res);
    });
});

router.delete("/settings/", (req, res) => {
    companyService.deleteSettings(req, (err, data) => {
        responseService.response(req, err, 2, data, res);
    });
});

module.exports.company = router;