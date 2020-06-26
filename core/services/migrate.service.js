const express = require('express');
const responseService = require('./response.service');
const User = require('../models/user');
const Location = require('../models/location');
const Job = require('../models/job');
const Pipeline = require('../models/jobPipeline');
const Applicant = require('../models/applicant');
const Resume = require('../models/applicantResume');
const Skill = require('../models/skills');
const JobApplicant = require('../models/jobApplicant');
const ApplicantSocial = require('../models/applicantSocial');
const Comment = require('../models/applicantComment');
const History = require('../models/history');

exports.restoreUser = async (data) => {
    let users = [];
    for (let i = 0; i < data.length; i++) {
        let obj = data[i];        
        let userResult = await User.findOne({ email: obj.email});
        if (userResult == null) { 
            let user = new User();
            user.email = obj.email;
            user.firstName = obj.user_detail.first_name;
            user.lastName = obj.user_detail.last_name;
            user.roles = [];
            user.phone = obj.user_detail.phone;
            user.password = obj.password;
            user.passwordResetToken = "";
            user.passwordResetExpires = "";
            user.emailVerificationToken = "";
            user.emailVerified = true;
            user.google = false;
            user.tokens = [];
            user.picture = "";
            user.is_deleted = false;
            user.created_by = data.user.id;
            user.created_at = new Date();
            user.modified_by = data.user.id;
            user.modified_at = new Date();
            users.push(user);
        }
    }
    let result = await User.create(users);
    return result;
}

exports.restoreState = async (data) => {
    let states = [];
    for (let i = 0; i < data.length; i++) {
        let obj = data[i];
        let location = new Location();
        location.country = "India";
        location.city = obj.city.city;
        location.state = obj.state;
        location.is_deleted = false;
        location.created_by = data.user.id;
        location.created_at = new Date();
        location.modified_by = data.user.id;
        location.modified_at = new Date();
        states.push(location);
    }
    return await Location.create(states);
}

exports.restoreJob = async (data) => {
    let jobs = [];
    // get ids of pipeline
    for (let i = 0; i < data.length; i++) {
        let obj = data[i];
        let pipelines = [];
        if (obj.pipelines && obj.pipelines.length) {
            pipelines = await pipeline(obj.pipelines);
        }
        let job = new Job();
        job.title = obj.title;
        job.guid = obj.guid;
        job.active = true;
        job.description = obj.description;
        job.responsibilities = obj.responsibilities;
        job.ctc = obj.ctc;
        job.locations = [];
        job.skills = [];
        job.applicants = [];
        job.pipelines = pipelines;
        job.is_published = true;
        job.metaImage = null;
        job.metaImageAltText = "";
        job.metaTitle = obj.title;
        job.tags = [];
        job.is_deleted = obj.is_deleted;
        job.created_by = data.user.id;
        job.created_at = new Date(obj.created_at);
        job.modified_by = data.user.id;
        job.modified_at = new Date(obj.modified_at);
        jobs.push(job);
    }
    return await Job.create(jobs);
}

let pipeline = async (data, id) => {
    let pipelines = [];
    for (let i = 0; i < data.length; i++) {
        let obj = data[i];
        let pipeline = new Pipeline();
        pipeline.name = obj.name;
        pipeline.position = obj.position;
        pipeline.is_deleted = obj.is_deleted;
        pipeline.created_by = id;
        pipeline.created_at = new Date(obj.created_at);
        pipeline.modified_by = id;
        pipeline.modified_at = new Date(obj.modified_at);
        pipelines.push(pipeline);
    }
    let result = await Pipeline.create(pipelines);
    let pipelineIds = [];
    for (let i = 0; i < result.length; i++) {
        pipelineIds.push(result[i]._id);
    }
    return pipelineIds;
}

exports.restoreApplicant = async (data) => {
    let applicantsArray = [];
    // let skills = await Skill.find({});
    for (let i = 0; i < data.length; i++) {
        console.log("applicant i : ", i);
        let obj = data[i];
        let modelApplicant = await Applicant.findOne({ email: obj.personal.email });
        if (modelApplicant == null) {
            modelApplicant = new Applicant();
        }
        modelApplicant.created_by = data.user.id;
        modelApplicant.created_at = new Date(obj.created_at);
        modelApplicant.modified_by = data.user.id;
        modelApplicant.modified_at = new Date(obj.modified_at);
        modelApplicant.email = obj.personal.email;
        modelApplicant.phones = [obj.personal.mobile_number];
        modelApplicant.dob = obj.personal.dob ? new Date(obj.personal.dob) : '';
        modelApplicant.currentCtc = obj.experiences[0] ? obj.experiences[0].current_Ctc : 0;
        modelApplicant.expectedCtc = obj.experiences[0] ? obj.experiences[0].expected_Ctc : 0;

        modelApplicant.totalExperience = obj.experiences[0] ? obj.experiences[0].duration : '';
        if (obj.personal.first_name) {
            modelApplicant.firstName = obj.personal.first_name ? obj.personal.first_name : '';
            modelApplicant.middleName = obj.personal.middle_name ? obj.personal.middle_name : '';
            modelApplicant.lastName = obj.personal.last_name ? obj.personal.last_name : '';
        } else {
            // If nothing found
            modelApplicant.firstName = obj.personal.email;
        }

        modelApplicant.resume = obj.resume

        // Create/Update skills
        if (obj.skills && obj.skills.skill.length > 0) {
            modelApplicant.skills = [];
            modelApplicant.skills.length = 0;
            for(var iSkill = 0; iSkill < obj.skills.skill.length; iSkill ++) {
                console.log('skills i : ', iSkill);
                // let [skill, array] = await findOrCreate(skills, obj.skills.skill[iSkill]);
                // skills = array;
                let modelSkills = await Skill.findOne({ name: obj.skills.skill[iSkill] });
                if (modelSkills == null) {
                    modelSkills = new Skill();
                    modelSkills.name = obj.skills.skill[iSkill];
                }
                modelSkills.is_deleted = false;
                modelSkills.created_by = data.user.id;
                modelSkills.created_at = new Date();
                modelSkills.modified_by = data.user.id;
                modelSkills.modified_at = new Date();
                modelSkills = await modelSkills.save();
                modelApplicant.skills.push(modelSkills);
            }
        } else {
            modelApplicant.skills = [];
        }

        // Create/Update Address 
        if (obj.addresses && obj.addresses.length && obj.addresses[0].hasOwnProperty('state')) {
            let modelCurrentLocation = await Location.findOne({ state: obj.addresses[0].state })
            if (modelCurrentLocation) {
                modelApplicant.location = modelCurrentLocation._id;
            } else {
                modelApplicant.location = null;
            }
        } else {
            modelApplicant.location = null;
        }

        modelApplicant = await modelApplicant.save();
        applicantsArray.push(modelApplicant);
    }
    return applicantsArray;
}

async function findOrCreate(array, name) {
    return new Promise(async (resolve, reject) => {
        try {        
            let skill = array.find(obj => obj.name === name);
            if (!skill) {
                skill = new Skill();
                skill.name = name;
                skill.is_deleted = false;
                skill.created_by = data.user.id;
                skill.created_at = new Date();
                skill.modified_by = data.user.id;
                skill.modified_at = new Date();
                skill = await skill.save();
                array.push(skill);
            }
            resolve({ skill: skill, array: array });
        } catch (error) {
            reject(error);
        }
    });
}

exports.restoreResume = async (data) => {
    let array = [];
    for (let i = 0; i < data.length; i++) {
        let obj = data[i];
        let applicant = null;
        if (obj.resume && obj.resume.fileName) {
            let modelResume = new Resume();
                modelResume.created_by = data.user.id;
                modelResume.created_at = new Date();
                modelResume.resume = obj.resume.resume,
                modelResume.fileName = obj.resume.fileName;
                modelResume.fileType = obj.resume.fileType;
                modelResume.modified_by = data.user.id;
                modelResume.modified_at = new Date();
                modelResume = await modelResume.save();
    
            if (obj && obj.personal && obj.personal.email) {
                applicant = await Applicant.findOne({ email: obj.personal.email });
                applicant.resume = modelResume.id;
                await applicant.save();
            }
            array.push(applicant);
        } else {
            array.push({ message: `resume not available in ${obj.personal.email}`})
        }
    }
    return array;
}

exports.restoreJobApplicant = async (data) => {
    let result = [];
    for (let i = 0; i < data.length; i++) {
        let obj = data[i];
        let job = await Job.findOne({ guid: obj.job_post.guid  }).populate('pipelines');
        let applicant = await Applicant.findOne({ email: obj.applicant.mongo_id });
        let jobPipeline;
        if (job && job.pipelines && job.pipelines.length) {
            for (let i = 0; i < job.pipelines.length; i++) {
                if (job.pipelines[i].name === obj.pipeline.name) {
                    jobPipeline = job.pipelines[i].id;
                    break;
                }  
            }
        }
        
        if (job && jobPipeline && applicant) {
            let modelJobApplicant = new JobApplicant();
            modelJobApplicant.pipeline = jobPipeline;
            modelJobApplicant.applicant = applicant._id;
            modelJobApplicant.job = job._id;
            modelJobApplicant.is_deleted = false;
            modelJobApplicant.created_at = new Date();
            modelJobApplicant.created_by = data.user.id;
            modelJobApplicant.modified_at = new Date();
            modelJobApplicant.modified_by = data.user.id;
            modelJobApplicant = await modelJobApplicant.save();
            // Link with Job
            if (job.applicants == null) {
                job.applicants = [];
            }
            job.applicants.push(modelJobApplicant._id);
            job = await job.save();
            modelJobApplicant.applicant = applicant;
            result.push(modelJobApplicant);
        }
    }
    return result;
}

exports.restoreComments = async (data) => {
    let comments = [];
    for (let i = 0; i < data.length; i++) {
        let obj = data[i];
            let job;
            if (obj.job_post_applicant && obj.job_post_applicant.job_post && obj.job_post_applicant.job_post.guid) {
                job = await Job.findOne({ guid: obj.job_post_applicant.job_post.guid  });
            }
            let applicant = await Applicant.findOne({ email: obj.job_post_applicant.applicant.mongo_id });
            let user = await User.findOne({ email: obj.user.email });
    
            let comment = new Comment();
            comment.comment = obj.comment,
            comment.applicant = applicant.id,
            comment.job = job ? job.id : null,
            comment.is_deleted = obj.is_deleted,
            comment.created_at = Date.now(obj.created_at),
            comment.created_by = user.id,
            comment.modified_at = Date.now(obj.modified_by),
            comment.modified_by = user.id
            await comment.save(); 
            comments.push(comment);
    }
    return comments;
}

exports.restoreHistory = async (data) => {
    let histories = [];
    for (let i = 0; i < data.length; i++) {
        let obj = data[i];
        let job;
        let jobPipeline;
        if (obj.job_post && obj.job_post.guid) {
            job = await Job.findOne({ guid: obj.job_post.guid  }).populate('pipelines');
            if (job && job.pipelines && job.pipelines.length) {
                for (let i = 0; i < job.pipelines.length; i++) {
                    if (job.pipelines[i].name === obj.pipeline.name) {
                        jobPipeline = job.pipelines[i].id;
                        break;
                    }  
                }
            }
        }
        let applicant = await Applicant.findOne({ email: obj.applicant.mongo_id });
        let user = await User.findOne({ email: obj.user.email });

        let history = new History();
        history.applicant = applicant.id,
        history.pipeline = jobPipeline,
        history.job = job ? job.id : null,
        history.is_deleted = obj.is_deleted,
        history.created_at = Date.now(obj.created_at),
        history.created_by = user.id,
        history.modified_at = Date.now(obj.modified_at),
        history.modified_by = user.id
        await history.save(); 
        histories.push(history);
    }
    return histories;
}

exports.emailByJob = async (id) => {
    return await Job.findOne({ _id: id  }).populate({ path: 'applicants', model: JobApplicant, populate: { path: 'applicant', model: Applicant } });
}
