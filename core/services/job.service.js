var Jobs = require('../models/job');
var JobPipelines = require('../models/jobPipeline');
var JobApplicants = require('../models/jobApplicant');
const uuidv4 = require('uuid/v4');
var histroyService = require('../services/history.service');

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
            for (var iSkill = 0; iSkill < req.body.skills.length; iSkill++) {
                modelJob.skills.push(req.body.skills[iSkill]._id);
            }
        }
        modelJob.expiryDate = req.body.expiryDate ? req.body.expiryDate : null;
        modelJob.is_published = req.body.published ? req.body.published : true;
        modelJob.metaImage = req.body.metaImage ? req.body.metaImage : null;
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

exports.getPublishedJobs = async () => {
    return await Jobs.find({}).populate("locations").populate("skills")
        .populate("tags").populate("categories");
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
            var jobApplicant = new JobApplicants();
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
            if(modelJob.applicants == null){
                modelJob.applicants = [];
            }
            modelJob.applicants.push(jobApplicant._id);
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
    let applicant = await JobApplicants.findOneAndUpdate({applicant: req.body.applicant}, {
        pipeline : req.body.pipeline,
        modefied_by : req.user.id,
        modefied_at : Date.now(),
        is_deleted : false
    }, {new : true});
    if (applicant) {
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
    if (req.params.id) {
        let applicant = await JobApplicants.findByIdAndUpdate(req.params.id, { is_deleted: true }, { new: true });
        if (applicant) {
            return applicant;
        } else {
            return { status: 400, message: "invalid id" };    
        }
    } else {
        return { status: 400, message: "id required" };
    }
}