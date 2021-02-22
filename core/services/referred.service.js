var Applicants = require('../models/applicant');
var JobApplicant = require('../models/jobApplicant');
var ApplicantService = require('./applicant.service');
var User = require('../models/user');
var Role = require('../models/userRole');
var config = require('../config').config();
var emailService = require('../services/email.service');
var Activity = require('./activity.service');
var Jobs = require('../models/job');
var ApplicantResumes = require('../models/applicantResume');
var ApplicantComments = require('../models/applicantComment');
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

async function applyForJob(applicant, jobId, owner, old = null) {
    return new Promise(async (resolve, reject) => {
        try {
            let applicantJob = await JobApplicant.findOne({
                applicant: applicant._id,
                job: jobId,
                is_deleted: {$ne: true}
            });
            if (!applicantJob) {
                let modelJobApplicant = new JobApplicant();
                let modelJob = await Jobs.findById(jobId).populate('pipelines');
                if (modelJob) {
                    let jobPipeline = modelJob.pipelines ? modelJob.pipelines[0] : null;
                    modelJobApplicant.job = modelJob.id;
                    modelJobApplicant.pipeline = jobPipeline;
                    modelJobApplicant.applicant = applicant._id;
                    modelJobApplicant.is_deleted = false;
                    modelJobApplicant.created_at = new Date();
                    modelJobApplicant.created_by = owner.id;
                    modelJobApplicant.modified_at = new Date();
                    modelJobApplicant.modified_by = owner.id;
                    modelJobApplicant = await modelJobApplicant.save();
                    // Link with Job
                    if (modelJob.applicants == null) {
                        modelJob.applicants = [];
                    }
                    modelJob.applicants.push(applicant._id);
                    modelJob = await modelJob.save();
                    modelJobApplicant.applicant = applicant._id;
                    let description = "applicant apply for  " + modelJob.title;
                    if (jobPipeline.name) {
                        description = description + " and move to " + jobPipeline.name + " pipeline ";
                    }
                    Activity.addActivity({
                        applicant: applicant._id,
                        created_by: owner.id,
                        title: "Apply for job",
                        description: description
                    });
                    if (old) {
                        notifyHRForReUploadJob({
                            name: getName(applicant),
                            id: applicant._id,
                            jobName: modelJob.title
                        }, owner.email);
                    }
                }


            }

            resolve();


        } catch (err) {
            console.log('save applicant catch : ', err);
            resolve();
        }
    });
}


exports.save = async (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!(req.files && req.files.length > 0)) {
                return reject({message: "missing resume", status: 200})
            }

            if (!req.body.email || !req.body.firstName) {
                return reject({message: "missing email or name", status: 200})
            }

            const email = req.body.email.toLowerCase().trim();
            let modelApplicant = await Applicants.findOne({email: email});
            if (modelApplicant) {
                if (req.body.jobId) {
                    await applyForJob(modelApplicant, req.body.jobId, {
                        email: req.user.email,
                        id: req.user.id
                    }, true)
                }
                return reject({message: "candidate Already exits", status: 200})
            }
            modelApplicant = new Applicants();
            modelApplicant.created_by = req.user.id;
            modelApplicant.created_at = new Date();
            modelApplicant.modified_at = new Date();
            modelApplicant.email = email;
            modelApplicant.phones = req.body.phone || [];
            modelApplicant.source = req.body.source || "upload";
            modelApplicant.dob = req.body.dob ? new Date(req.body.dob) : "";
            modelApplicant.currentCtc = req.body.currentCtc || '';
            modelApplicant.expectedCtc = req.body.expectedCtc || '';
            modelApplicant.noticePeriod = req.body.noticePeriod || '';
            modelApplicant.noticePeriodNegotiable = req.body.noticePeriodNegotiable || '';
            modelApplicant.totalExperience = req.body.experience || '';
            modelApplicant.availability = req.body.availability || '';
            modelApplicant.referredBy = req.user.email;
            modelApplicant.firstName = req.body.firstName ? req.body.firstName : '';
            modelApplicant.middleName = req.body.middleName ? req.body.middleName : '';
            modelApplicant.lastName = req.body.lastName ? req.body.lastName : '';
            modelApplicant.firstName = modelApplicant.firstName || email;
            let modelResume = new ApplicantResumes();
            modelResume.created_by = req.user.id;
            modelResume.created_at = new Date();
            modelResume.resume = req.files[0].buffer.toString('base64');
            modelResume.fileName = req.body.resume && req.body.resume.file ? req.body.resume.file : req.files[0].originalname;
            modelResume.fileType = req.files[0].mimetype;
            modelResume.modified_by = req.user.id;
            modelResume.modified_at = new Date();
            modelResume = await modelResume.save();
            modelApplicant.resume = modelResume._id;
            modelApplicant = await modelApplicant.save();
            Activity.addActivity({
                applicant: modelApplicant._id,
                created_by: req.user.id,
                title: "Applicant created",
                description: "Applicant uploaded by the " + req.user.email
            });
            if (req.body.comment) {
                let comment = {
                    comment: req.body.comment,
                    applicant: modelApplicant._id,
                    is_deleted: false,
                    created_at: Date.now(),
                    created_by: req.user.id,
                    modified_at: Date.now(),
                    modified_by: req.user.id
                };
                await ApplicantComments.create(comment);
            }

            if (req.body.jobId) {
                await applyForJob(modelApplicant, req.body.jobId, {
                    email: req.user.email,
                    id: req.user.id
                })
            }
            resolve(modelApplicant);
        } catch (err) {
            console.log('save applicant catch : ', err);
            return reject({message: "something went wrong to process your request", status: 400})
        }
    });
}

function notifyHRForReUploadJob(candidate, owner) {
    return new Promise(async (resolve, reject) => {
        // Get all HR (role = 2

        let hrRole = await Role.findOne({name: "hr"});
        if (hrRole) {
            var hrTeam = await User.find({is_deleted: false, roles: {$elemMatch: {$eq: hrRole}}});
            if (hrTeam && hrTeam.length > 0) {
                // Get list of hr emails
                var hrEmails = "";
                hrTeam.forEach(hr => {
                    if (owner !== hr.email) {
                        hrEmails = hrEmails + hr.email + ","
                    }
                });

                var body = `
                <p>Dear HR,</p>
                <p>  ${owner} has re-uploaded candidate <b>${candidate.name}</b>  for job <b>${candidate.jobName}</b>.  </p>
                <p>Please click on below link to view details<p>
                <p>${config.website}/admin/applicants/${candidate.id}</p>
            `;
                var email = {
                    toEmail: hrEmails, // list of receivers
                    subject: "Applicant for the job", // Subject line
                    body: body,
                    title: "Applicant for the job"
                };
                if (hrEmails) {
                    emailService.sendEmail(email, (err, data) => {
                        if (err) reject(err);
                        else resolve(data);
                    });
                }
            }
        }


    });
}


function getName(applicant) {
    let name = '';
    if (applicant.firstName) {
        name = name + ' ' + applicant.firstName;
    }
    if (applicant.middleName) {
        name = name + ' ' + applicant.middleName;
    }
    if (applicant.lastName) {
        name = name + ' ' + applicant.lastName;
    }

    return name;
}


