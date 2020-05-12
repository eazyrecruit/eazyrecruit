var express = require('express');
const check = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;
var router = express.Router();
var jobService = require('../services/job.service');
var applicantService = require("../services/applicant.service");
var User = require('../models/user');
var multer = require('multer');
var companyService = require('../services/company.service');
var path = require('path');
var utilService = require('../services/util.service');
const request = require('request');
const fs = require('fs');
const config = require('../config').config();
// var FormData = require('form-data');
// var http = require('http');

router.get("", async (req, res) => {
    try {
        let pageIndex = +req.query.page || 1;
        let totalItems = 0; 
        let limit = 12;
        let offset = (pageIndex - 1) * limit;
        let query = { is_published: true, active: true };
        if (req.query.search) {
            // query = { title: new RegExp(`^.*${req.query.search}.*$`, 'i') };
            query.title = new RegExp(`^.*${req.query.search}.*$`, 'i');
        }

        let company = await companyService.getCompany();
        var result = await jobService.getPublishedJobs(query, limit, offset);
        totalItems = result.count;
        let lastPage = Math.ceil(totalItems / limit);
        if (totalItems == 0) {
            pageIndex = 1;
        } else {
            console.log(Math.ceil(totalItems / limit));
            pageIndex > lastPage ? pageIndex = 1 : pageIndex; 
        }
        res.render('pages/jobs', {
            company: company[0],
            search: req.query.search, 
            jobs: result.jobs,
            currentPage: pageIndex,
            hasNextPage: (limit * pageIndex) < totalItems,
            hasPreviousPage: pageIndex > 1,
            nextPage: pageIndex + 1,
            previousPage: pageIndex - 1,
            lastPage: Math.ceil(totalItems / limit) 
        });
    } catch (err) {
        res.render('pages/error')
    }
});


router.get("/apply/:id", async (req, res) => {
    try {
        let company = await companyService.getCompany();
        var job = await jobService.getByGuid(req.params.id);
        res.render('pages/apply', { job: job, company: company[0] });
    } catch (err) {
        res.render('pages/error')
    }
});

router.get("/:id", async (req, res) => {
    try {
        let company = await companyService.getCompany();
        var job = await jobService.getByGuid(req.params.id);
        res.render('pages/job', { job: job, company: company[0] });
    } catch (err) {
        res.render('pages/error')
    }
});

var resume = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1000 * 1000 * 12 } });
router.post("/apply/:id", 
[
    // password must be at least 5 chars long
    check('name').not().isEmpty(),
    // username must be an email
    check('email').not().isEmpty().isEmail().normalizeEmail(),
    // password must be at least 5 chars long
    check('phone').not().isEmpty().isLength({ min: 10 }),
    // password must be at least 5 chars long
    check('resume').not().isEmpty(),
    // password must be at least 5 chars long
    check('availability').not().isEmpty()
], 
resume.any(),
async (req, res) => {
    // Finds the validation errors in this request and wraps them in an object with handy functions
    const errors = validationResult(req.body);
    if (!errors.isEmpty()) {
        return res.status(422).json({ errors: errors.array() });
    }

    let company = await companyService.getCompany();
    try {
        console.log(req.body);
        let admin = await User.findOne({ email: 'admin@eazyrecruit.in' }, { select: 'email' });
        if (admin) {
            req.user = {
                id: admin.id
            }
        }

        let fileName;
        if (req.files && req.files.length) {
            let position = req.files[0].originalname.lastIndexOf('.');
            let name = req.files[0].originalname.toString();
            fileName = await utilService.writeResumeFile(req, name.substring(0, position));
        }

        request.post({
            "headers": { 
                "content-type": "application/json"
            },
            "url": `${config.website}/api/account/login`,
            "method": "POST", 
            "body": {
                "userName": config.admin.username,
                "password": config.admin.password
            },
            "json": true
            }, (error, response, body) => {
                if(error) {
                    return console.dir(error);
                }
                if (body['success'] && body['success']['data']) {
                    request.post({
                        "headers": { 
                            "content-type": "application/json",
                            "Authorization": `Bearer ${body['success']['data'].token}`
                        },
                        "url": config.website + config.pyUrl,
                        "formData": {
                            name: req.body.name,
                            email: req.body.email,
                            phone: req.body.phone,
                            availability: req.body.availability,
                            currentCtc: req.body.currentCtc,
                            expectedCtc: req.body.expectedCtc,
                            source: req.body.source,
                            jobId: req.body.jobId,
                            resume: fs.createReadStream(path.join(__dirname, `../resumes/${fileName}`))
                        }
                        }, (error, response, body) => {
                            if(error) {
                                return console.dir(error);
                            }
                            res.render('pages/thanks', { company: company[0] });
                            fs.unlinkSync(path.join(__dirname, `../resumes/${fileName}`)); 
                        });
                }
            });
        // let result = await applicantService.save(req);
        // if (err) res.render('pages/error');
        // else res.render('pages/thanks', { job: data });       
    } catch (error) {
        res.render('pages/thanks', { company: company[0] });
    }
});

module.exports.pages = router;