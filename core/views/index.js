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
let Log = require('../models/log');
var redisClient = require('../services/redis.service');

router.get("", async (req, res) => {
    try {
        let pageIndex = +req.query.page || 1;
        let totalItems = 0;
        let limit = 12;
        let offset = (pageIndex - 1) * limit;
        let query = {is_published: true, active: true};
        if (req.query.search) {
            // query = { title: new RegExp(`^.*${req.query.search}.*$`, 'i') };
            query.title = new RegExp(`^.*${req.query.search}.*$`, 'i');
        }

        let company = await companyService.getCompany();
        let googleAnalytics = {};
        if (company && company.length) {
            googleAnalytics = await companyService.getSettingObject({id: company[0]._id, group: "googleAnalytics"});
            console.log(googleAnalytics);
        }

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
             googleAnalytics: googleAnalytics,
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
        let googleAnalytics = {};
        if (company && company.length) {
            googleAnalytics = await companyService.getSettingObject({id: company[0]._id, group: "googleAnalytics"});
        }


        var job = await jobService.getByGuid(req.params.id);
        if (job) {
            res.render('pages/apply', {job: job, googleAnalytics: googleAnalytics, company: company[0]});
        } else {
            res.redirect(config.website);
        }

    } catch (err) {
        res.redirect(config.website);
    }
});

router.get("/:id", async (req, res) => {
    try {
        let company = await companyService.getCompany();
        let googleAnalytics = {};
        if (company && company.length) {
            googleAnalytics = await companyService.getSettingObject({id: company[0]._id, group: "googleAnalytics"});
        }


        var job = await jobService.getByGuid(req.params.id);
        if (job) {
            res.render('pages/job', {job: job, googleAnalytics: googleAnalytics, company: company[0]});
        } else {
            res.redirect(config.website);
        }
    } catch (err) {
        res.redirect(config.website);
    }
});

var resume = multer({storage: multer.memoryStorage(), limits: {fileSize: 1000 * 1000 * 12}});
router.post("/apply/:id",
    [
        // password must be at least 5 chars long
        check('name').not().isEmpty(),
        // username must be an email
        check('email').not().isEmpty().isEmail().normalizeEmail(),
        // password must be at least 5 chars long
        check('phone').not().isEmpty().isLength({min: 10}),
        // password must be at least 5 chars long
        check('resume').not().isEmpty(),
        // password must be at least 5 chars long
        check('availability').not().isEmpty()
    ],
    resume.any(),
    async (req, res) => {
        let log = new Log();
        // Finds the validation errors in this request and wraps them in an object with handy functions
        const errors = validationResult(req.body);
        if (!errors.isEmpty()) {
            log.groupName = "error";
            log.data.push({title: "req. validation", message: JSON.stringify(errors)});
            await log.save();
            return res.status(422).json({errors: errors.array()});
        }

        let company = await companyService.getCompany();
        let googleAnalytics = {};
        if (company && company.length) {
            googleAnalytics = await companyService.getSettingObject({id: company[0]._id, group: "googleAnalytics"});
        }

        console.log("googleAnalytics", googleAnalytics);
        try {
            console.log('body : ', req.body);
            log.groupName = "execute request";
            log.data.push({title: "request body", message: JSON.stringify(req.body)});

            let admin = await User.findOne({email: config.admin.username}, {select: 'email'});
            if (admin) {
                req.user = {
                    id: admin.id
                }
            }

            var applicant;
            if (req.body && req.body.email) {
                applicant = await applicantService.save(req);
                console.log('applicant saved');
            }
            let result = await applicantService.resume(req);
            log.groupName = "execute request";
            log.data.push({title: "success response", message: JSON.stringify(result)});

            if (result && result.hasOwnProperty('id') && result.id) {
                console.log('resume id : ', result);
                let id = result.id.toString();
                let parsedData = await redisClient.parse(id);
                console.log('redis success = : ', parsedData);
                log.groupName = "execute request";
                log.data.push({title: "redis success - taskid", message: parsedData.taskid});
                await log.save();
            } else {
                console.log('resume id : ', result);
            }
            res.render('pages/thanks', {company: company[0], googleAnalytics: googleAnalytics});
        } catch (error) {
            console.log('redis error = : ', error);
            log.groupName = "execute request";
            log.data.push({title: "error", message: error.message});
            await log.save();
            res.render('pages/thanks', {company: company[0], googleAnalytics: googleAnalytics});
        }
    });

module.exports.pages = router;
