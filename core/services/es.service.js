var Jobs = require('../models/job');
var Applicants = require('../models/applicant');
const {query} = require('winston');
var config = require('../config').config();
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

exports.searchApplicantsByJob = async (req) => {
    return new Promise(function (resolve, reject) {
        let query;
        let from = 0, size = 10;
        const requestBody = req.body;
        if (requestBody.limit) size = parseInt(requestBody.limit);
        if (requestBody.offset) from = parseInt(requestBody.offset);
        if (requestBody.searchJob) {
            const searchJob = JSON.parse(requestBody.searchJob);
            query = {
                "bool": {
                    "should": [
                        {"match": {"roles": searchJob.role}},
                        {"term": {"totalExperience": searchJob.experience}},

                    ]
                }
            }
            for (const skill of searchJob.skills) {
                query.bool.should.push({"match": {"skills.name": skill.name}})
            }
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
    })
}


exports.searchApplicants = async (req) => {
    return new Promise(async (resolve, reject) => {

            try {
                let sort = {};
                sort[req.sortBy] = {order: parseInt(req.order) === -1 ? "desc" : "asc"};
                var query = {};
                if (req.search && req.source) {
                    query = {
                        "bool": {
                            "must": [
                                {
                                    "bool": {
                                        "should": [
                                            {"match_phrase": {"email": req.search}},
                                            {"match_phrase": {"firstName": req.search}},
                                            {"match_phrase": {"middleName": req.search}},
                                            {"match_phrase": {"lastName": req.search}},
                                            {"match": {"roles": req.search}},
                                            {"match": {"phones": req.search}},
                                            {"match": {"skills.name": req.search}}]
                                    }
                                },
                                {"match": {"source": req.source}}
                            ]
                        }
                    };
                }
                if (req.search && !req.source) {
                    query = {
                        "bool": {
                            "should": [
                                {"match_phrase": {"email": req.search}},
                                {"match_phrase": {"firstName": req.search}},
                                {"match_phrase": {"middleName": req.search}},
                                {"match_phrase": {"lastName": req.search}},
                                {"match": {"roles": req.search}},
                                {"match": {"phones": req.search}},
                                {"match": {"skills.name": req.search}}]
                        }
                    };
                }
                if (!req.search && req.source) {
                    query = {
                        "bool": {
                            "must": [
                                {"match": {"source": req.source}}]
                        }
                    }
                }

                if (!req.source && !req.search) {
                    query = {
                        "match_all": {}
                    }
                }
                Applicants.search(query, {
                        hydrate: false, size: parseInt(req.limit), from: parseInt(req.offset), sort: [sort]
                    }, function (err, results) {
                        if (err)
                            reject(err);
                        else {
                            resolve(results);
                        }
                    }
                );

                // resolve(result);
            } catch
                (err) {
                console.log("err", err);
                reject("No data found");
            }

        }
    );
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
                        {"match_phrase_prefix": {"title": req.query.searchText}}, {"match_phrase": {"active": active}}]
                }
            }
        } else {
            query = {
                "bool": {
                    "must": [
                        {"match_all": {}},
                        {"match_phrase": {"active": active}}]
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
            reject({status: 400, message: "job id is missing"});
        }
    });
}

// var elasticsearch = require("elasticsearch");

// var client = new elasticsearch.Client({
//     hosts: ["localhost:9200"]
// });
