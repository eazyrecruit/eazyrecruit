var Applicants = require('../models/applicant');
exports.searchReferredApplicants = async (req) => {
    return new Promise(async (resolve, reject) => {

            try {
                console.log("req", req);
                let sort = {};
                sort[req.sortBy] = {order: parseInt(req.order) === -1 ? "desc" : "asc"};
                var query = {};
                if (req.search) {
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
                                {"match": {"referredBy": req.owner}}
                            ]
                        }
                    };
                } else {
                    query = {
                        "bool": {
                            "must": [
                                {"match_all": {}},
                                {"match_phrase": {"referredBy": req.owner}}]
                        }
                    }
                }
                Applicants.search(query, {
                        hydrate: false, size: parseInt(req.limit), from: parseInt(req.offset), sort: [sort]
                    }, function (err, results) {
                        if (err)
                            resolve({});
                        else {
                            resolve(results);
                        }
                    }
                );

                // resolve(result);
            } catch
                (err) {
                console.log("err", err);
                resolve({});
            }

        }
    );
}

exports.getApplicantById = async (req) => {
    return new Promise(async (resolve, reject) => {

            try {
                let sort = {};
                sort[req.sortBy] = {order: parseInt(req.order) === -1 ? "desc" : "asc"};
                var query = {};
                if (req.search) {
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
                                {"match": {"referredByUser": req.owner}}
                            ]
                        }
                    };
                } else {
                    query = {
                        "bool": {
                            "must": [
                                {"match_all": {}},
                                {"match_phrase": {"referredByUser": req.owner}}]
                        }
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