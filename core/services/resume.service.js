var config = require('../config').config();
// var orm = require('orm');
// var Async = require("async");
// var mongoose = require('mongoose');
// var candidate_details = mongoose.model('candidate_details');
// var applicantSkillService = require('./applicantSkill.service');
// var applicantJobPostService = require('./applicantJobPosts.service');
// var Profiles = require('../models/userProfiles');
var Resume = require('../models/applicantResume');
var Applicants = require('../models/applicant');
// var models = require('../sequelize');
var fs = require('fs');
const libre = require('libreoffice-convert');
convertDocToPdf = async (base64_string, res) => {
    return new Promise(async (resolve, reject) => {
        const imgBuffer = Buffer.from(base64_string, 'base64');
        const extend = '.pdf';
        libre.convert(imgBuffer, extend, undefined, (err, done) => {
            if (err) {
                console.log(`Error converting file: ${err}`);
                return res.sendStatus(404);
            }
            res.writeHead(200, {
                'Cache-Control': 'max-age=3600, private',
                'Content-Length': done.length
            });

            return res.end(done);
        });


    });
};
exports.downloadResume = async (req, res, next) => {
    try {
        let resumeModel = await Resume.findById({_id: req.params.id});
        if (resumeModel) {
            const imgBuffer = Buffer.from(resumeModel.resume, 'base64');
            res.writeHead(200, {
                'Cache-Control': 'max-age=3600, private',
                'Content-Length': imgBuffer.length
            });
            return res.end(imgBuffer);

        } else {
            return res.sendStatus(404);
        }

    } catch (error) {
        console.log("accountService-->fileStream-->", error);
        return res.sendStatus(404);
    }
};
/**
 * we are sending file data in stream
 * @param resumeId
 * @param res
 */
exports.fileStream = async (resumeId, res) => {
    try {
        let resumeModel = await Resume.findById({_id: resumeId});
        if (resumeModel) {
            var fileExtension = resumeModel.fileName.split('.').pop();
            if (fileExtension === "pdf") {
                const imgBuffer = Buffer.from(resumeModel.resume, 'base64');
                res.writeHead(200, {
                    'Cache-Control': 'max-age=3600, private',
                    'Content-Length': imgBuffer.length
                });

                return res.end(imgBuffer);
            } else {
                return await convertDocToPdf(resumeModel.resume, res)
            }

        } else {
            return res.sendStatus(404);
        }

    } catch (error) {
        console.log("accountService-->fileStream-->", error);
        return res.sendStatus(404);
    }
};

exports.getResumeById = (resume_id) => {
    return Resume.findById(resume_id);
}

exports.updateByApplicantId = async (req) => {
    let applicant = await Applicants.findById(req.params.id);
    let modelResume = await Resume.findById(applicant.resume);
    if (modelResume == null) {
        modelResume = new Resume();
        modelResume.is_deleted = false;
        modelResume.created_by = req.user.id;
        modelResume.created_at = new Date();
    }
    modelResume.resume = req.files[0].buffer.toString('base64')
    modelResume.fileName = req.body.resume && req.body.resume.file ? req.body.resume.file : req.files[0].originalname;
    modelResume.fileType = req.files[0].mimetype;
    modelResume.modified_by = req.user.id;
    modelResume.modified_at = new Date();
    modelResume = await modelResume.save();
    applicant.resume = modelResume._id;
    await applicant.save();
    return modelResume;
}

exports.uploadResume = (req, next) => {
    let resume = new Resume();
    if (req.body.resume || req.files) {
        if (req.body.resume) {
            resume.resume = req.body.resume.data;
            resume.fileName = req.body.resume.fileName;
            resume.fileType = req.body.resume.fileType;
        } else {
            resume.resume = req.files[0].buffer.toString('base64');
            resume.fileName = req.files[0].originalname;
            resume.fileType = req.body.resume_fileType ? req.body.resume_fileType : req.files[0].mimetype;
        }
        resume.save((err, record) => {
            if (err) {
                next(err, null);
            } else {
                next(null, record);
            }
        });
    } else {
        next(null, null)
    }
};
exports.deleteFileFromLocal = (file_path) => {
    return new Promise((resolve, reject) => {
        fs.unlink(file_path, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve()
            }
        });
    });
}
