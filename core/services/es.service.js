var Jobs = require('../models/job');
var Applicants = require('../models/applicant');
const { query } = require('winston');

exports.syncApplicants = async () => {
    return new Promise((resolve, reject) => {
        try {
            var stream = Applicants.synchronize();
            var count = 0;
            stream.on('data', function (err, doc) {
                count++;
            });
            stream.on('sync closed', function () {
                console.log('indexed ' + count + ' documents!');
            });
            stream.on('sync error', function (err) {
                console.log(err);
            });
            resolve(true);
        } catch (err) {
            reject(err);
        }
    });
}


exports.syncJobs = async () => {
    return new Promise((resolve, reject) => {
        try {
            var stream = Jobs.synchronize();
            var count = 0;
            stream.on('data', function (err, doc) {
                count++;
            });
            stream.on('sync closed', function () {
                console.log('syncJobs-->indexed ' + count + ' documents!');
            });
            stream.on('sync error', function (err) {
                console.log("syncJobs---->error", err);
            });
            resolve(true);
        } catch (err) {
            reject(err);
        }
    });
}


exports.searchApplicants = async (req) => {
    return new Promise(function (resolve, reject) {
        let query;
        let from = 0, size = 10;
        if (req.query.limit) size = parseInt(req.query.limit);
        if (req.query.offset) from = parseInt(req.query.offset);
        if (req.query.searchJob) {
            const searchJob = JSON.parse(req.query.searchJob);
            query = {
                "bool": {
                    "should": [
                        { "match": { "roles": searchJob.role } },
                        { "term": { "totalExperience": searchJob.experience } },

                    ]
                }
            }
            for (const skill of searchJob.skills) {
                query.bool.should.append({ "match": { "skills": skill } })
            }
        } else if (req.query.search) {
            query = {
                "bool": {
                    "should": [
                        { "match_phrase": { "email": req.query.search } },
                        { "match_phrase": { "firstName": req.query.search } },
                        { "match_phrase": { "middleName": req.query.search } },
                        { "match_phrase": { "lastName": req.query.search } },
                        { "match": { "roles": req.query.search } },
                        { "match": { "phones": req.query.search } },
                        { "match": { "skills.name": req.query.search } }]
                }
            }
        } else {
            query = { "match_all": {} }
        }
        if (query) {
            Applicants.search(query, {
                hydrate: false, size: size, from: from, sort: [{
                    "created_at": {
                        "order": "desc"
                    }
                }]
            },
                function (err, results) {
                    if (err)
                        reject(err);
                    else
                        resolve(results);
                });
        } else {
            reject("No data found");
        }
    });
}

exports.searchJobs = async (req) => {
    return new Promise(function (resolve, reject) {
        let offset = 0, limit = 12;
        let active = !(req.query.active === "false" || req.query.active === false);
        if (req.query.limit) limit = parseInt(req.query.limit);
        if (req.query.offset) offset = parseInt(req.query.offset);
        var query = {};
        if (req.query.searchText) {
            query = {
                "bool": {
                    "must": [
                        { "match_phrase_prefix": { "title": req.query.searchText } }, { "match_phrase": { "active": active } }]
                }
            }
        } else {
            query = {
                "bool": {
                    "must": [
                        { "match_all": {} },
                        { "match_phrase": { "active": active } }]
                }
            }
        }
        if (query) {
            Jobs.search(query, {
                from: offset, size: limit,
                sort: [{
                    "is_published": {
                        "order": "desc"
                    }
                }, {
                    "created_at": {
                        "order": "desc"
                    }
                }]
            },
                function (err, results) {
                    if (err)
                        reject(err);
                    else {
                        resolve(results);
                    }
                });
        } else {
            reject("No data found");
        }
    });
}

exports.updateJob = async (id, job) => {
    return new Promise(async (resolve, reject) => {
        /* Update a Document */
        if (id) {
            Jobs.update({
                id: id,
                body: job
            })
                .then(
                    function (resp) {
                        console.log("Successfully updated in elastic!");
                        resolve(resp);
                    },
                    function (err) {
                        console.log(err.message);
                        reject(err);
                    }
                );
        } else {
            reject({ status: 400, message: "job id is missing" });
        }
    });
}

// var elasticsearch = require("elasticsearch");

// var client = new elasticsearch.Client({
//     hosts: ["localhost:9200"]
// });
