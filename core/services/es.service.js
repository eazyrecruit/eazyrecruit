var Jobs = require('../models/job');
var Applicants = require('../models/applicant');

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

exports.searchApplicants = async (req) => {
    return new Promise(function (resolve, reject) {
        var from = req.body.offset > 0 ? req.body.offset - 1 : 0;
        var size = req.body.pageSize;
        var query;
        if (req.body.searchText) {
            query = {
                "bool": {
                    "should": [
                        { "match_phrase": { "email": req.body.searchText } },
                        { "match_phrase": { "firstName": req.body.searchText } },
                        { "match_phrase": { "middleName": req.body.searchText } },
                        { "match_phrase": { "lastName": req.body.searchText } },
                        { "match": { "phones": req.body.searchText } },
                        { "match": { "skills.name": req.body.searchText } }]
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
        if (req.query.title) {
            var query = {
                "query_string" : {
                    "fields" : ["title"],
                    "query" : "*" + req.query.title + "*"
                }
            }
        } else {
            var query = { "match_all": {} };
        }
        if (query) {
            Jobs.search(query, {
                sort: [{
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

