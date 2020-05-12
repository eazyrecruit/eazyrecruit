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
        const pageIndex = +req.query.page || 1;
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

// router.post("", async (req, res) => {
//     try {
//         const pageIndex = +req.query.page || 1;
//         let totalItems = 0; 
//         let limit = 12;
//         let offset = (pageIndex - 1) * limit;
//         var jobs = await jobService.getPublishedJobs({ title: new RegExp(`^.*${req.body.search}.*$`, 'i') }, limit, offset);
//         res.render('pages/jobs', { 
//             count: jobs.count, 
//             jobs: jobs.jobs, 
//             currentPage: pageIndex,
//             hasNextPage: (limit * pageIndex) < totalItems,
//             hasPreviousPage: pageIndex > 1,
//             nextPage: pageIndex + 1,
//             previousPage: pageIndex - 1,
//             lastPage: Math.ceil(totalItems / limit) 
//         });
//     } catch (err) {
//         res.render('pages/error')
//     }
// });

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
        // var form = new FormData();
        // form.append('my_field', 'my value');
        // form.append('resume', new Buffer(req.files[0].buffer));
        // // formData.buffer = new Buffer(req.files[0].buffer)        
        // let file = {}
        // if (req.files && req.files.length) {
        //     console.log('path : ', __dirname + './images');
        //     // file = { buffer: new Buffer(req.files[0].buffer), encoding: req.files[0].encoding, 
        //     //     fieldname: req.files[0].fieldname, mimetype: req.files[0].mimetype, originalname: req.files[0].originalname, size: req.files[0].size }
        //     // formData.resume = fs.createReadStream(__dirname + '../images/5e957b8866a6470018b23fc2.png');
        // }
        // let options = {
        //     "headers": { 
        //         "content-type": "application/json",
        //         "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjVlOTU5NjYwMzgzYmFkNWU2OWExZTQzZCIsImRpc3BsYXlOYW1lIjoidmlja3kgdmlja3kiLCJlbWFpbCI6InZpY2t5QGFrZW8ubm8iLCJyb2xlcyI6WyJhZG1pbiJdLCJpYXQiOjE1ODkxODM0NzYsImV4cCI6MTU4OTI2OTg3NiwiYXVkIjoiRWF6eVJlY3J1aXRVc2VycyIsImlzcyI6Imh0dHBzOi8vZGV2LWFwaS5lYXp5cmVjcnVpdC5pbiJ9.VJrKKS3ke_YmccmOb3q8ctbHlyU6wrTRm9SMcxZ2JMc"
        //     },
        // }
        // form.submit('http://localhost:8082/api/applicant/', options, function(err, res) {
        // // res – response object (http.IncomingMessage)  //
        // res.resume();
        // });

        request.post({
            "headers": { 
                "content-type": "application/json"
            },
            "url": `${config.website}/api/account/login`,
            "method": "POST", 
            "body": {
                "userName": "admin@eazyrecruit.in",
                "password": "root"
            },
            "json": true
            }, (error, response, body) => {
                if(error) {
                    return console.dir(error);
                }
                if (body['success'] && body['success']['data']) {
                    console.dir(JSON.parse(body));
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
                            console.dir(JSON.parse(body));
                            res.render('pages/thanks', { company: company[0] }); 
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