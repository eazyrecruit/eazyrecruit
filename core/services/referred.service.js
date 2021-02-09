var Applicants = require('../models/applicant');
var JobApplicant = require('../models/jobApplicant');


exports.getJobsApplicant = async (data) => {
    try {
        const ApplicantQuery = {
            "is_deleted": {$ne: true},
            "referredBy": data.owner
        };
        if (data.search) {
            ApplicantQuery["$or"] = [
                {"firstName": {"$regex": data.search}},
                {"middleName": {"$regex": data.search}},
                {"lastName": {"$regex": data.search}},
                {"email": {"$regex": data.search}},
            ]
        }
        console.log("ApplicantQuery", ApplicantQuery);
        let count = await Applicants.find(ApplicantQuery).countDocuments();
        const applicants = [];
        let applicant = await Applicants.find(ApplicantQuery, {
            firstName: 1,
            middleName: 1,
            email: 1,
            phones: 1,
            _id: 1,
            modified_at: 1,
            created_at: 1
        }).sort({modified_at: -1}).skip(parseInt(data.offset)).limit(parseInt(data.limit));
        for (let index = 0; index < applicant.length; index++) {
            if (applicant[index] && applicant[index].hasOwnProperty("_doc")) {
                applicant[index] = applicant[index]._doc;
            }
            let jobApplicant = await JobApplicant.find({
                "is_deleted": {$ne: true},
                "applicant": applicant[index]._id
            }).populate("job", ["title"]).populate("pipeline", ["name"]);
            if (jobApplicant && jobApplicant.length) {
                for (let count = 0; count < jobApplicant.length; count++) {
                    applicant[index]["jobApplicant"] = {
                        pipeline: jobApplicant[count]["pipeline"]["name"],
                        job: jobApplicant[count]["job"]["title"]
                    }
                    applicants.push(applicant[index]);
                }
            } else {
                applicants.push(applicant[index]);
            }
        }
        return {applicants: applicants, total: count};
    } catch
        (error) {
        console.log("error--->", error);
        return {total: 0, applicants: []};
    }


}

async function processMongoosasticData(results) {
    try {
        const applicants = [];
        var count = 0;
        if (results && results.hits && results.hits.hits && results.hits.hits.length) {
            for (var iHit = 0; iHit < results.hits.hits.length; iHit++) {
                if (results.hits.hits[iHit] && results.hits.hits[iHit].hasOwnProperty("_doc")) {
                    results.hits.hits[iHit] = results.hits.hits[iHit]._doc;
                }
                let jobApplicant = await JobApplicant.find({
                    "is_deleted": {$ne: true},
                    "applicant": results.hits.hits[iHit]._id
                }).populate("job", ["title"]).populate("pipeline", ["name"]);
                if (jobApplicant && jobApplicant.length) {
                    for (let count = 0; count < jobApplicant.length; count++) {
                        const applicant = Object.assign({}, results.hits.hits[iHit]);
                        applicant["jobApplicant"] = {
                            pipeline: jobApplicant[count]["pipeline"]["name"],
                            job: jobApplicant[count]["job"]["title"]
                        };
                        applicants.push(applicant);
                    }
                } else {
                    applicants.push(results.hits.hits[iHit]);
                }

            }
            count = results.hits.total.value || results.hits.total;
        }
        return {applicants: applicants, total: count};
    } catch (error) {
        console.log("error--->", error);
        return {total: 0, applicants: []};
    }


}

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
                        size: parseInt(req.limit),
                        hydrate: true,
                        hydrateOptions: {select: "_id modified_at created_at firstName middleName email phones"},
                        from: parseInt(req.offset),
                        sort: [sort]
                    }, async (err, results) => {
                        if (err)
                            resolve({});
                        else {
                            console.log(results);
                            resolve(await processMongoosasticData(results));
                        }
                    }
                );
            } catch (err) {
                console.log("err", err);
                resolve({});
            }

        }
    )
        ;
}