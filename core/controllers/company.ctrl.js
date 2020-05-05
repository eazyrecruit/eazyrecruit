var express = require('express');
var router = express.Router();
var responseService = require('../services/response.service');
var companyService = require('../services/company.service');
var validationService = require('../services/validation.service');
var multer = require('multer');

router.post("/", (req, res) => {
    companyService.save(req, (err, data) => {
        responseService.response(req, err, 2, data, res);
    });
});

router.get("/", async (req, res) => {
    try {
        let company = await companyService.getCompany(req);
        responseService.response(req, null, 'get company', company, res);  
    } catch (error) {
        responseService.response(req, err, 2, data, res);
    }

});

router.get("/settings/", async (req, res) => {
    try {
        let result = await companyService.getSettings(req);
        responseService.response(req, null, 2, result, res);        
    } catch (error) {
        responseService.response(req, error, 2, null, res);
    }

});

router.put("/settings/", async (req, res) => {
    try {
        let result = await companyService.updateSettings(req);
        responseService.response(req, null, 'settings', result, res);   
    } catch (error) {
        responseService.response(req, error, 'settings', null, res);
    }
});

router.delete("/settings/", (req, res) => {
    companyService.deleteSettings(req, (err, data) => {
        responseService.response(req, err, 2, data, res);
    });
});

var uploadService = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1000 * 1000 * 12 } });
router.put("/", uploadService.any(), validationService.validateCompanyDetals, (req, res) => {
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