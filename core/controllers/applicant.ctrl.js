var express = require('express');
var router = express.Router();
var applicantService = require("../services/applicant.service");
var responseService = require('../services/response.service');
var Logs = require('../models/logs');
var multer = require('multer');
var validationService = require('../services/validation.service');
var esService = require('../services/es.service');
var skillService = require('../services/skill.service');
var locationService = require('../services/location.service');
var fs = require("fs");
let mammoth = require("mammoth");
var redisClient = require('../services/redis.service');
var logTypes = require('../helpers/logType');
var resumeService = require('../services/resume.service');

router.post("/search", async (req, res) => {
    try {
        var results = await esService.searchApplicants(req);
        if (results.hits && results.hits.total.value > 0) {
            var applicants = [];
            for (var iHit = 0; iHit < results.hits.hits.length; iHit++) {
                results.hits.hits[iHit]._source._id = results.hits.hits[iHit]._id;
                results.hits.hits[iHit]._source.skills = await skillService.getAllByIds(results.hits.hits[iHit]._source.skills);
                results.hits.hits[iHit]._source.location = await locationService.getAllByIds(results.hits.hits[iHit]._source.location);
                results.hits.hits[iHit]._source.preferredLocations = await locationService.getAllByIds(results.hits.hits[iHit]._source.preferredLocations);
                applicants.push(results.hits.hits[iHit]._source);
            }
            responseService.response(req, null, 'Applicants GET', { applicants: applicants, total: results.hits.total.value }, res);
        } else {
            responseService.response(req, null, 'Applicants GET', null, res);
        }
    } catch (err) {
        responseService.response(req, err, logTypes.debug, null, res);
    }
});

router.get("/:id", async (req, res) => {
    try {
        var applicant = await applicantService.getById(req.params.id);
        responseService.response(req, null, logTypes.debug, applicant, res);

    } catch (err) {
        responseService.response(req, err, logTypes.debug, null, res);
    }
});

var applicantResumeUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1000 * 1000 * 12 } });
router.post("/", applicantResumeUpload.any(), async (req, res) => {
    try {
        var applicant = await applicantService.save(req);
        responseService.response(req, null, logTypes.debug, applicant, res);
    } catch (err) {
        responseService.response(req, err, logTypes.debug, null, res);
    }
});

var applicantResumeUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1000 * 1000 * 12 } });
router.put("/", applicantResumeUpload.any(), async (req, res) => {
    try {
        var applicant = await applicantService.saveAndUpdate(req);
        responseService.response(req, null, logTypes.debug, applicant, res);
    } catch (err) {
        responseService.response(req, err, logTypes.debug, null, res);
    }
});

router.delete("/:id", applicantResumeUpload.any(), async (req, res) => {
    try {
        var applicant = await applicantService.delete(req);
        responseService.response(req, null, logTypes.debug, applicant, res);
    } catch (err) {
        responseService.response(req, err, logTypes.debug, null, res);
    }
});


// router.get("/resync", async (req, res) => {
//     try {
//        var result = await candidateService.syncElasticSearch();
//        responseService.response(req, null, 'resync', result, res);
//     } catch (ex) {
//        responseService.response(req, ex, 'resync', null, res);
//     }
//  });

//  router.get("/reparse", async (req, res) => {
//     try {
//        var reparseResp = await redisClient.reparseDb();
//        responseService.response(req, null, 'reparse', reparseResp, res);
//     } catch (ex) {
//        responseService.response(req, ex, 'reparse', null, res);
//     }
//  });

//  var uploadService = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1000 * 1000 * 12 } });
// router.post('/received/:source?', uploadService.any(), async (req, res) => {
//    try {
//       var candidate = await candidateService.saveAndUpdateCandidate(req, res);
//       responseService.response(req, null, '1', candidate, res);
//    } catch (err) {
//       responseService.response(req, err, '1', null, res);
//    }
// });





var uploadService = multer({ storage: multer.memoryStorage(), limits: { fileSize: 1000 * 1000 * 12 } });
router.post("/upload", uploadService.any(), (req, res) => {
    applicantService.uploadResume(req, (errorResume, dataResume) => {
        if (errorResume) responseService.response(req, errorResume, 'Upload resume', null, res);
        else {
            redisClient.parse(dataResume._id).then(data => {
                responseService.response(req, null, 'Update Resume', dataResume, res);
            }).catch(err => {
                responseService.response(req, err, 'Update Resume', null, res);
            });
        }
    });
});

router.get("/candidates", (req, res) => {
    applicantService.getCandidates(req, (err, applicants) => {
        if (!err) {
            applicantService.countApplicant(req, (err, data) => {
                var result = {};
                result.totalRecords = data;
                result.applicant = applicants;
                responseService.response(req, err, 'Get All Data', result, res);
            })
        } else {
            responseService.response(req, err, 'Get All Data', null, res);
        }
    });
});

router.get("/", (req, res) => {
    applicantService.getApplicants(req, (err, applicants) => {
        responseService.response(req, err, 'Get All Data', applicants, res);
    });
});

router.get("/:id", (req, res) => {
    applicantService.getApplicantProfile(req, (err, applicant) => {
        responseService.response(req, err, 'Get Specific Record', applicant, res);
    });
});

router.post("/", (req, res) => {
    applicantService.getApplicants(req, (err, applicant) => {
        if (!err) {
            applicantService.countApplicant(req, (err, data) => {
                var result = {};
                result.totalRecords = data;
                result.applicant = applicant;
                responseService.response(req, err, 'Get Applicant Record', result, res);
            })
        } else {
            responseService.response(req, err, 'Get Applicant Record', null, res);
        }
    });
});

router.get("/getdetails/:id", (req, res) => {
    applicantService.getApplicantById(req, (err, applicant) => {
        responseService.response(req, err, 'Get Specific Record', applicant, res);
    })
});

router.get("/download/:id", (req, res) => {
    resumeService.downloadResume(req, res, (err, filepath) => {
        if (filepath) {
            resolve = require('path').resolve
            filepath = resolve('./' + filepath)
            var options = {
                headers: {
                    'x-timestamp': Date.now(),
                    'x-sent': true
                }
            };
            res.sendFile(filepath, options, (error) => {
                if (error) {
                    var logsInstance = new Logs();
                    logsInstance.log_type = 'Delete File';
                    logsInstance.user_id = req.user.id;
                    logsInstance.log_data = error;
                    logsInstance.is_deleted = 0;
                    logsInstance.save();
                }
                applicantService.removeFiles(filepath, (error, success) => {
                    if (error) {
                        var logsInstance = new Logs();
                        logsInstance.log_type = 'Delete File';
                        logsInstance.user_id = req.user.id;
                        logsInstance.log_data = error;
                        logsInstance.is_deleted = 0;
                        logsInstance.save();
                    }
                });
            });

        } else {
            responseService.response(req, err, 'Download Resume', filepath, res);
        }
    });
});

// router.post("/upload", uploadService.any(),  (req, res) => {
//     accountService.uploadResume(req, function (err, users) {
//         responseService.response(req, err,2 ,users, res);
//       })
// });

router.post("/comment", async (req, res) => {
    try {
        var comment = await applicantService.addComment(req);
        responseService.response(req, null, 1, comment, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

router.get("/comment/:id", async (req, res) => {
    try {
        var comments = await applicantService.getComments(req);
        responseService.response(req, null, 1, comments, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

router.put("/comment", async (req, res) => {
    try {
        var comment = await applicantService.updateCommentsById(req);
        responseService.response(req, null, 1, comment, res);
    } catch(err){
        responseService.response(req, err, 1, false, res);
    }
});

// this api is no longer use
// router.get("/jobApplied", (req, res) => {
//     applicantService.getAppliedJob(req, (err, data) => {
//         responseService.response(req, err, 'Jobs Applied by Applicant', data, res);
//     });
// });

router.get("/getrejection", (req, res) => {
    applicantService.getrejection(req, (err, data) => {
        responseService.response(req, err, 'Applicant Reject', data, res);
    });
});

router.post("/reject", (req, res) => {
    applicantService.reject(req, (err, data) => {
        responseService.response(req, err, "Applicant Reject", data, res);
    });
});


// this api is no longer use
// router.get("/id/:mongoId", async (req, res) => {
//     try {
//         var applicant = await applicantService.getByMongoid(req.params.mongoId);
//         responseService.response(req, null, "Applicant", applicant, res);
//     } catch (err) {
//         responseService.response(req, err, "Applicant", null, res);
//     }
// });

// this api is no longer use 
router.get("/info/:id",
    async (req, res, next) => {
        try {
            //fetch applicant's basic details viz. 
            //personal, resume, experiences, skills and location
            let applicantBasicInformation = await candidateService.getApplicatInfoById(req.params.id);
            //get all the jobs, applicant applied for
            let appliedJobs = await applicantService.getAppliedJobByMongoid(req.params.id);
            //fetch all comments related to the applicant
            let jobAndComments
            if (appliedJobs) {
                jobAndComments = await applicantService.getAllComments(appliedJobs.job_post_applicants);
            }
            response = {
                addresses: applicantBasicInformation.addresses,
                experiences: applicantBasicInformation.experiences,
                personal: applicantBasicInformation.personal,
                skills: applicantBasicInformation.skills,
                appliedJobs: jobAndComments,
                resume_id: applicantBasicInformation.resume ? applicantBasicInformation.resume._id.toString() : null,
                // comments: comments
            }
            responseService.response(req, null, "Applicant complete information", response, res);
        } catch (err) {
            responseService.response(req, err, "Applicant complete information", null, res);

        }

    }
)

router.get("/resume", (req, res, next) => {
    let datastring = "data:application/msword;base64," + req.body.docbase64;
    var matches = datastring.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
        response = {};

    if (matches.length !== 3) {
        return new Error('Invalid input string');
    }

    response.type = matches[1];
    response.data = new Buffer(matches[2], 'base64');
    let imageBuffer = response;
    let destination = __dirname + '\\' + 'testinfolder\\' + 'test1234.docx';


    fs.writeFile(destination, imageBuffer.data, (err) => {
        if (err) {
            console.log("let see what happens");
        } else {
            //convert file to equivalent html
            // docx2html(destination).then((html) => {
            //     html.toString()
            // })
            mammoth.convertToHtml({ path: destination }, "p[style-name='Section Title'] => h1:fresh")
                .then(function (result) {
                    var html = result.value; // The generated HTML
                    var messages = result.messages; // Any messages, such as warnings during conversion
                })
                .done();
        }
    });
});

router.get("/job/:applicantId",  async (req, res) => {
    try {
        let result = await applicantService.getjobsByApplicantId(req.params.applicantId);
        responseService.response(req, null, 'get applicant applied job', result, res);
    } catch(error) {
        responseService.response(req, error, 'get applicant applied job', null, res);
    }
});

// getCommentsByJob
router.get("/comment/:applicant/:job",  async (req, res) => {
    try {
        let result = await applicantService.getCommentsByJob(req.params.applicant, req.params.job);
        responseService.response(req, null, 'get applicant applied job', result, res);
    } catch(error) {
        responseService.response(req, error, 'get applicant applied job', null, res);
    }
});

router.delete("/jobpost/applicant/remove", (req, res) => {
    applicantService.removeFromJobPost(req, (error, data) => {
        responseService.response(req, error, 'remove applicant from job', data, res);
    });
});

router.get("/history/:id", async (req, res) => {
    try {
        let result = await applicantService.getApplicantHistory(req.params.id);
        responseService.response(req, null, 'get applicant history', result, res);
    } catch (error) {
        responseService.response(req, error, 'get applicant history', null, res);
    }
});

module.exports.applicant = router;