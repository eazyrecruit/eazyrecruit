var Jobs = require('../models/job');
var JobPipelines = require('../models/jobPipeline');
var JobApplicants = require('../models/jobApplicant');
var JobMetaImage = require('../models/jobMetaImage');
var Interview = require('../models/interview');
const uuidv4 = require('uuid/v4');
var histroyService = require('../services/history.service');
var utilService = require('../services/util.service');
var esService = require('../services/es.service');

exports.save = async (req) => {
    if (req.body) {
        var modelJob = await Jobs.findById(req.body._id);
        if (modelJob == null) {
            modelJob = new Jobs();
            modelJob.created_by = req.user.id;
            modelJob.created_at = new Date();

            let name = ['New', 'Pending', 'Hold', 'Selected', 'Rejected'];
            req.body['jobId'] = modelJob._id;
            req.body['pipeline'] = [];
            for (let i = 0; i < name.length; i++) {
                var jobPipeline = new JobPipelines();
                jobPipeline.name = name[i];
                jobPipeline.position = i + 1;
                jobPipeline.created_by = req.user.id;
                jobPipeline.created_at = new Date();
                jobPipeline.modefied_by = req.user.id;
                jobPipeline.modefied_at = new Date();
                jobPipeline.is_deleted = false;
                req.body.pipeline.push(jobPipeline);
                await jobPipeline.save();
            }
        }

        modelJob.title = req.body.title;
        modelJob.guid = req.body.guid ? req.body.guid : uuidv4();
        modelJob.active = req.body.active ? req.body.active : true;
        modelJob.description = req.body.description ? req.body.description : null;
        modelJob.responsibilities = req.body.responsibilities ? req.body.responsibilities : null;
        modelJob.ctc = req.body.ctc ? req.body.ctc : null;
        modelJob.minExperience = req.body.minExperience ? req.body.minExperience : null;
        modelJob.maxExperience = req.body.maxExperience ? req.body.maxExperience : null;
        modelJob.type = req.body.type ? req.body.type : null;
        modelJob.mode = req.body.mode ? req.body.mode : null;
        if (req.body.locations) {
            modelJob.locations = [];
            req.body.locations = JSON.parse(req.body.locations);
            for (var iLoc = 0; iLoc < req.body.locations.length; iLoc++) {
                modelJob.locations.push(req.body.locations[iLoc]._id);
            }
        }
        if (req.body.pipeline) {
            for (var iPipeline = 0; iPipeline < req.body.pipeline.length; iPipeline++) {
                modelJob.pipelines.push(req.body.pipeline[iPipeline]._id);
            }
        }
        if (req.body.skills) {
            modelJob.skills = [];
            req.body.skills = JSON.parse(req.body.skills);
            for (var iSkill = 0; iSkill < req.body.skills.length; iSkill++) {
                modelJob.skills.push(req.body.skills[iSkill]._id);
            }
        }
        modelJob.expiryDate = req.body.expiryDate ? req.body.expiryDate : null;
        modelJob.is_published = req.body.published ? req.body.published : true;
        
        // we are storing image with name and we are using guid as name
        if (req.files && req.files.length) {
            modelJob.metaImage = await utilService.readWriteFile(req, modelJob.guid);
        } else {
            modelJob.metaImage = req.body.metaImage;
        }

        modelJob.metaImageAltText = req.body.metaImageAltText ? req.body.metaImageAltText : null;
        modelJob.metaTitle = req.body.metaTitle ? req.body.metaTitle : null;
        if (req.body.tags) {
            req.body.tags.forEach(tag => {
                modelJob.tags.push(tag._id);
            });
        }
        if (req.body.categories) {
            req.body.categories.forEach(category => {
                modelJob.categories.push(category._id);
            });
        }
        modelJob.modified_by = req.user.id;
        modelJob.modified_at = new Date();
        modelJob = await modelJob.save();

        return modelJob;
    }
}

exports.getPublishedJobs = async (query, limit, offset) => {
    let count = 0;
    let jobs;
    if (query.hasOwnProperty('title')) {
        count = await Jobs.find(query).count();
        jobs = await Jobs.find(query).populate("locations").populate("skills")
        .populate("tags").populate("categories").sort({ created_at: 'desc' });
        
    } else {
        count = await Jobs.find(query).count()
        jobs = await Jobs.find(query).populate("locations").populate("skills")
        .populate("tags").populate("categories").sort({ created_at: 'desc' }).limit(limit).skip(offset);
    }
    return { count, jobs };
};

exports.getByGuid = async (guid) => {
    return await Jobs.findOne({ 'guid': guid }).populate("locations").populate("skills")
        .populate("tags").populate("categories");
};

exports.getById = async (_id) => {
    return await Jobs.findById(_id).populate("locations").populate("skills")
        .populate("tags").populate("categories");
};

exports.getWithApplicantsAndPipeline = async (req) => {
    return await Jobs.findById(req.params.id)
        .populate({path: 'pipelines', match: { is_deleted: { $ne: true} },
            populate: {
              path: 'pipelines',
              model: 'JobPipelines'
            } 
        })
        .populate({path: 'applicants', match: { is_deleted: { $ne: true} },
            populate: {
              path: 'applicant',
              model: 'Applicants', 
              match: { is_deleted: { $ne: true} },
                populate: {
                  path: 'skills',
                  model: 'Skills'
                }
            }
        });
};

exports.searchWithApplicantsAndPipeline = async (req) => {
    return await Jobs.findById(req.query.jobId).populate("pipelines")
    .populate({
        path: 'applicants', 
        match: { 
            is_deleted: { $ne: true}
        },
        populate: {
            path: 'applicant',
            model: 'Applicants',
            match: { 
                is_deleted: { $ne: true},
                $or: [
                    {firstName: new RegExp('^.*' + req.query.search + '.*$', 'i')},
                    {middleName: new RegExp('^.*' + req.query.search + '.*$', 'i')},
                    {lastName: new RegExp('^.*' + req.query.search + '.*$', 'i')},
                    {email: new RegExp('^.*' + req.query.search + '.*$', 'i')},
                ] 
            }
        }
    });
};

exports.delete = async (_id) => {
    var modelJob = Jobs.findById(req.body._id);
    if (modelJob) {
        modelJob.is_deleted = true;
        modelJob.modified_by = req.user.id;
        modelJob.modified_at = new Date();
        return await modelJob.save();
    }
    throw 'invalid id';
};

let addPipeline = async (req) => {
    var modelJob = await Jobs.findById(req.body.jobId);
    if (modelJob) {
        // Create Job Pipeline
        if (req.body.pipeline.length > 0) {
            try {
                let jobPipeline = await JobPipelines.create(req.body.pipeline);
                for (let i = 0; i < jobPipeline.length; i++) {
                    console.log('jobPipeline', jobPipeline[i]._id);
                    if (modelJob.pipelines == null) {
                        modelJob.pipelines = [];
                    }
                    modelJob.pipelines.push(jobPipeline[i]._id);
                }
            } catch(exception) {
                console.log(exception);
            }
            
            // Link with Job
            
            // if (modelJob.pipelines == null) {
            //     modelJob.pipelines = [];
            // }
            // modelJob.pipelines.push(jobPipeline._id);
        } else {
            var jobPipeline = new JobPipelines();
            jobPipeline.name = req.body.pipeline.name;
            jobPipeline.position = req.body.pipeline.position;
            jobPipeline.created_by = req.user.id;
            jobPipeline.created_at = new Date();
            jobPipeline.modefied_by = req.user.id;
            jobPipeline.modefied_at = new Date();
            jobPipeline = await jobPipeline.save();
            // Link with Job
            if (modelJob.pipelines == null) {
                modelJob.pipelines = [];
            }
            modelJob.pipelines.push(jobPipeline._id);
        }

        modelJob = await modelJob.save();
        return jobPipeline;
    }
}

exports.addPipeline = addPipeline;

exports.addApplicant = async (req) => {
    var modelJob = await Jobs.findById(req.body.jobId);
    if (modelJob) {
        let applicant = await JobApplicants.findOne({ applicant: req.body.applicantId, job: req.body.jobId, is_deleted: { $ne: true } });
        if (!applicant) {
            // Create Job Applicant
            let jobApplicant = new JobApplicants();
            jobApplicant.applicant = req.body.applicantId;
            jobApplicant.pipeline = req.body.pipelineId;
            jobApplicant.job = req.body.jobId;
            jobApplicant.created_by = req.user.id;
            jobApplicant.created_at = Date.now();
            jobApplicant.modefied_by = req.user.id;
            jobApplicant.modefied_at = Date.now();
            jobApplicant.is_deleted = false;
            jobApplicant = await jobApplicant.save();
            // Link with Job
            if(modelJob.applicants == null) {
                modelJob.applicants = [];
            }
            modelJob.applicants.push(jobApplicant._id);
            if (!modelJob.hasOwnProperty("metaImage")) {
                modelJob.metaImage = null;
            }
            modelJob = await modelJob.save();
            await histroyService.create({ 
                applicant: req.body.applicantId, 
                pipeline: req.body.pipelineId,
                job: req.body.jobId,
                createdBy: req.user.id,
                modifiedBy: req.user.id,
            });
            return jobApplicant;
        } else {
            return { status: 403, message: "already exist" };
        }
    }
}

exports.editApplicant = async (req) => {

    let applicant = await JobApplicants.findOne({ _id: req.body.id, applicant: req.body.applicant, is_deleted: false}); 
    if (applicant) {
        applicant.pipeline = req.body.pipeline,
        applicant.modefied_by = req.user.id,
        applicant.modefied_at = Date.now(),
        applicant.is_deleted = false
        await applicant.save();

        await histroyService.create({ 
            applicant: req.body.applicant, 
            pipeline: req.body.pipeline,
            job: req.body.job,
            createdBy: req.user.id,
            modifiedBy: req.user.id,
        });
        return applicant;
    } else {
        return { status: 400, message: "invalid id" };    
    }
}

exports.removeApplicant = async (req) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (req.params.id) {
                let jobApplicant = await JobApplicants.findByIdAndUpdate(req.params.id, { is_deleted: true }, { new: true });
                if (jobApplicant) {
                    let job = await Jobs.findByIdAndUpdate(jobApplicant.job, { $pull: { applicants: req.params.id }}, { new: true });
                    let elJob = await esService.update(job.id, job);
                    let interview = await Interview.findOne({ jobId: jobApplicant.job, jobApplicant: jobApplicant.applicant });
                    if (interview) {
                        try {
                            interview.is_deleted =  true;
                            interview.modified_at = new Date();
                            interview.modified_by = req.user.id;
                            interview.save((err, data) => {
                                if (err) {
                                    reject({ status: 207, message: "applicant removed successfully, interview remove error" });
                                } else {
                                    console.log(data);
                                    resolve(jobApplicant);
                                }
                            });
                        } catch (error) {
                            console.log('remove interview : ', error);
                            reject({ status: 207, message: "applicant removed successfully, interview remove error" });
                        }
                    } else {
                        resolve(jobApplicant);
                    }
                } else {
                    reject({ status: 400, message: "invalid id" });    
                }
            } else {
                reject({ status: 400, message: "id required" });
            }            
        } catch (error) {
            console.log('remove applicanr error : ', error);
            reject({ status: 500, message: "internal server error" });
        }
    });
}
