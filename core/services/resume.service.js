// var config = require('../config').config();
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
// var path = require('path');
const uuidv4 = require('uuid/v4');
var exec = require('child_process').exec;
var mammoth = require("mammoth");
// var WordExtractor = require("word-extractor");
// var UserBasic = require('../models/user_basicModel');


exports.getHtmlForReumeBase64 = async (base64_string, file_extension) => {
    return new Promise((resolve, reject) => {
        let datastring = "data:application/msword;base64," + base64_string;
        var matches = datastring.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};
        if (matches.length !== 3) {
            return new Error('Invalid input string');
        }
        response.type = matches[1];
        response.data = new Buffer(matches[2], 'base64');
        let imageBuffer = response;
        let uid = generateRandomString();
        let destination = './downloadable_files';


        if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination);
        }

        if (fs.existsSync(destination)) {
            destination = './downloadable_files/' + uid + "." + file_extension;
            let outputHtmlfile = './downloadable_files/' + uid + ".html";

            fs.writeFile(destination, imageBuffer.data, (err) => {
                if (err) {
                    reject(err);
                } else {
                    if (file_extension === "doc") {
                        generateHtmlResumeDoc(destination).then(() => {
                            fs.readFile(outputHtmlfile, 'utf8', (err, content) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    response = {
                                        html: content,
                                        destination: destination,
                                        html_file_path: outputHtmlfile
                                    }
                                    resolve(response);
                                }
                            });
                        })
                    } else {
                        mammoth.convertToHtml({ path: destination })
                            .then(function (result) {
                                var html = result.value; // The generated HTML
                                var messages = result.messages; // Any messages, such as warnings during conversion
                                resolve({
                                    html: html,
                                    destination: destination
                                })
                            });
                    }
                }
            });
        }
    });
}

exports.downloadResume = (req, res, next) => {
    Resume.findById(req.params.id, function (err, docs) {
        if (docs) {
            // next(null, docs);
            let buf = Buffer.from(docs.resume, 'base64');
            let dir = './downloadable_files';


            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }

            if (fs.existsSync(dir)) {
                let filename;
                if (String(docs.fileName).includes('.docx') ||
                    docs.fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                    filename = docs._id + uuidv4() + '.docx';
                } else if (String(docs.fileName).includes('.doc') ||
                    docs.fileType === 'application/msword') {
                    filename = docs._id + uuidv4() + '.doc';
                } else {
                    filename = docs._id + uuidv4() + '.pdf';
                }
                let filepath = dir + '/' + filename;
                fs.writeFile(filepath, buf, (err) => {
                    if (err) {
                        next(null, err);
                    } else {
                        next(null, filepath);
                    }
                });
            }
            // console.log('resume type', typeof());     
        } else {
            next(err, null);
        }
    });
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


generateHtmlResumeDoc = (path_to_resume) => {
    return new Promise((resolve, reject) => {
        let unoconv_file_path = global.rootdirectory + "\\unoconv\\unoconv.py"
        let cmdScript = "librapython " + unoconv_file_path + ' -f html ' + path_to_resume;
        //let cmdScript = '"' + config.libra_office +'"' + ' "' +config.unoconv +'"' + ' -f html ' + path_to_resume;
        exec(cmdScript, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve()
            }
        });
    });
}
const generateRandomString = () => {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 32; i++) {
        let number = Math.random();
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
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