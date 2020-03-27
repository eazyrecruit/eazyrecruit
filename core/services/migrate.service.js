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

exports.restoreUser = async (data) => {
    let users = [];
    data.forEach(obj => {
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
        user.user.emailVerified = true;
        user.google = "";
        user.tokens = [];
        user.picture = "";
        user.is_deleted = false;
        user.created_by = "5e6b047ddc8153001188bfcb";
        user.created_at = new Date();
        user.modified_by = "5e6b047ddc8153001188bfcb";
        user.modified_at = new Date();
        users.push(user);    
    });
    let result = await User.create(users);
    return result;  
}

exports.restoreState = async (data) => {
    let states = [];
    data.forEach(obj => {
        let location = new Location();
        location.country = "India";
        location.city = obj.city.city;
        location.state = obj.state;
        location.is_deleted = false;
        location.created_by = "5e6b047ddc8153001188bfcb";
        location.created_at = new Date(obj.created_at);
        location.modified_by = "5e6b047ddc8153001188bfcb";
        location.modified_at = new Date(obj.modified_by);
        states.push(location);
    });
    return await Location.create(states);
}

exports.restoreJob = async (data) => {
    let jobs = [];
    // get ids of pipeline
    data.forEach(obj => {
        let pipelines = await pipeline(data.pipelines);
        let job = new Job();
        job.title = obj.title;
        job.guid = obj.guid;
        job.active = true;
        job.description = obj.description,
        job.responsibilities = obj.responsibilities,
        job.ctc = obj.ctc,
        job.minExperience = Number,
        job.maxExperience = Number,
        job.mode = String,
        job.type = String,
        job.locations = [],
        job.skills = [],
        job.applicants = [],
        job.pipelines = [],
        job.expiryDate = Date,
        job.is_published = true,
        job.metaImage = "",
        job.metaImageAltText = "",
        job.metaTitle = obj.title,
        job.tags = [],
        job.is_deleted = obj.is_deleted,
        job.created_by = "5e6b047ddc8153001188bfcb",
        job.created_at = new Date(obj.created_at),
        job.modified_by = "5e6b047ddc8153001188bfcb",
        job.modified_at = new Date(obj.modified_at)
        jobs.push(job);
    });
    return await Job.create(jobs);
}

let pipeline = async (data) => {
    let pipelines = [];
    data.forEach(obj => {
        let pipeline = new Pipeline();
        pipeline.name = obj.name;
        pipeline.position = obj.position;
        pipeline.is_deleted = obj.is_deleted;
        pipeline.created_by = "5e6b047ddc8153001188bfcb";
        pipeline.created_at = new Date(obj.created_at);
        pipeline.modified_by = "5e6b047ddc8153001188bfcb";
        pipeline.modified_at = new Date(obj.modified_at);
        pipelines.push(pipeline);
    });
    let result = await Pipeline.create(pipelines);
}

exports.restoreApplicant = async (data) => {
    data.forEach(obj => {
        let applicant = new Applicant();

        // Get email from body
        var email = Array.isArray(req.body.email) ? req.body.email.length > 0
            ? req.body.email[0] : null : req.body.email;
        // Get if applicant already exists
        var modelApplicant = null;
        if (req.body._id) {
            modelApplicant = await Applicant.findById(req.body._id);
        } else if (email) {
            modelApplicant = await Applicant.findOne({ email: email });
        }
        // Create applicant if unable to find
        if (modelApplicant == null) {
            modelApplicant = new Applicant();
            modelApplicant.created_by = req.user.id;
            modelApplicant.created_at = new Date();
        }
        modelApplicant.email = email;
        modelApplicant.phones = modelApplicant.phone ? modelApplicant.phone : req.body.phone ? req.body.phone : [];
        modelApplicant.source = req.body.source ? req.body.source : '';
        modelApplicant.dob = req.body.dob ? new Date(req.body.dob) : '';
        modelApplicant.currentCtc = req.body.currentCtc || '';
        modelApplicant.expectedCtc = req.body.expectedCtc || '';
        modelApplicant.noticePeriod = req.body.noticePeriod || '';
        modelApplicant.noticePeriodNegotiable = req.body.noticePeriodNegotiable || '';
        modelApplicant.totalExperience = req.body.experience || '';
        modelApplicant.availability = req.body.availability || '';
        modelApplicant.referredBy = req.body.referredBy || null;
        if(req.body.firstName){
            modelApplicant.firstName = req.body.firstName ? req.body.firstName : '';
            modelApplicant.middleName = req.body.middleName ? req.body.middleName : '';
            modelApplicant.lastName = req.body.lastName ? req.body.lastName : '';
        }
        else if (req.body.name) {
            modelApplicant.firstName = modelApplicant.firstName || getFirstName(req.body.name);
            modelApplicant.middleName = modelApplicant.middleName || getMiddleName(req.body.name);
            modelApplicant.lastName = modelApplicant.lastName || getLastName(req.body.name);
        } else {
            // If nothing found
            modelApplicant.firstName = email;
        }

        // Create/Update resume 
        if (req.body.resume && req.body.resume.id && req.body.resume.id.length > 0) {
            modelApplicant.resume = req.body.resume.id;
        } else {
            if (req.files && req.files.length > 0) {
                modelResume = await ApplicantResumes.findById(modelApplicant.resume);
                if (modelResume == null) {
                    modelResume = new Resume();
                    modelResume.created_by = req.user.id;
                    modelResume.created_at = new Date();
                }
                modelResume.resume = req.files[0].buffer.toString('base64')
                modelResume.fileName = req.body.resume && req.body.resume.file ? req.body.resume.file : req.files[0].originalname;
                modelResume.fileType = req.files[0].mimetype;
                modelResume.modified_by = req.user.id;
                modelResume.modified_at = new Date();
                modelResume = await modelResume.save();
                modelApplicant.resume = modelResume._id;
            } else {
                modelApplicant.resume = null;
            }
        }

        // Create/Update skills
        if (req.body.skills) {
            let skills;
            if (Array.isArray(req.body.skills)) {
                skills = req.body.skills;
            } else {
                skills = JSON.parse(req.body.skills);
            }
            if (skills && skills.length > 0) {
                modelApplicant.skills = [];
                modelApplicant.skills.length = 0;
                for(var iSkill = 0; iSkill < skills.length; iSkill ++) {
                    modelSkills = await Skills.findOne({ _id: skills[iSkill].id });
                    if (modelSkills == null) {
                        modelSkills = new Skill();
                        modelSkills.name = skills[iSkill].name?skills[iSkill].name.trim():skills[iSkill].trim();
                        modelSkills.is_deleted = false;
                        modelSkills.created_by = req.user.id;
                        modelSkills.created_at = new Date();
                        modelSkills.modified_by = req.user.id;
                        modelSkills.modified_at = new Date();
                        modelSkills = await modelSkills.save();
                    }
                    modelApplicant.skills.push(modelSkills);
                }
            }
        }

        // Create/Update Address 
        var modelCurrentLocation = null;
        if (req.body.currentLocation) {
            var current = JSON.parse(req.body.currentLocation);
            if (current && current.length > 0) {
                modelCurrentLocation = await Locations.findOne({ _id: current[0].id })
                if (modelCurrentLocation == null) {
                    modelCurrentLocation = new Location();
                    modelCurrentLocation.country = current.country || '';
                    modelCurrentLocation.city = current.city || '';
                    modelCurrentLocation.state = current.state || '';
                    modelCurrentLocation.zip = current.zip || '';
                    modelCurrentLocation.created_by = req.user.id;
                    modelCurrentLocation.created_at = new Date();
                    modelCurrentLocation.modified_by = req.user.id;
                    modelCurrentLocation.modified_at = new Date();
                    modelCurrentLocation = await modelCurrentLocation.save();
                }
                modelApplicant.location = modelCurrentLocation;
            }
        } else {
            modelApplicant.location = null;
        }

        var modelpreferredLocation = null;
        if (req.body.preferredLocation) {
            var preferred = JSON.parse(req.body.preferredLocation);
            if (preferred && preferred.length > 0) {
                modelApplicant.preferredLocations = [];
                for (let iPreferred = 0; iPreferred < preferred.length; iPreferred++) {
                    modelpreferredLocation = await Locations.findOne({ _id: preferred[iPreferred].id })
                    if (modelpreferredLocation == null) {
                        modelpreferredLocation = new Locations();
                        modelpreferredLocation.country = preferred[iPreferred].country || '';
                        modelpreferredLocation.city = preferred[iPreferred].city || '';
                        modelpreferredLocation.state = preferred[iPreferred].state || '';
                        modelpreferredLocation.zip = preferred[iPreferred].zip || '';
                        modelpreferredLocation.created_by = req.user.id;
                        modelpreferredLocation.created_at = new Date();
                        modelpreferredLocation.modified_by = req.user.id;
                        modelpreferredLocation.modified_at = new Date();
                        modelpreferredLocation = await modelpreferredLocation.save();
                    }
                    modelApplicant.preferredLocations.push(modelpreferredLocation._id);
                }
            }
        }

        // Add Social Details
        if (req.body.socials && req.body.socials.length > 0) {
            for(var iSocial = 0; iSocial < req.body.socials.length; iSocial ++) {
                var modelSocial = await Socials.findOne({ name: Socials[iSocial].name });
                if (modelSocial == null) {
                    modelSocial = new Socials();
                    modelSocial.created_by = req.user.id;
                    modelSocial.created_at = new Date();
                    modelSocial.modified_by = req.user.id;
                    modelSocial.modified_at = new Date();
                    modelSocial.name = Socials[iSocial].name;
                    modelSocial = await modelSocial.save();
                }
                var applicantSocial = await ApplicantSocials.findOne({ social: modelSocial._id });
                if (applicantSocial == null) {
                    applicantSocial = new ApplicantSocial();
                    applicantSocial.social = modelSocial._id;
                    applicantSocial.profileUrl = Socials[iSocial].profileUrl;
                    applicantSocial.created_by = req.user.id;
                    applicantSocial.created_at = new Date();
                    applicantSocial.modified_by = req.user.id;
                    applicantSocial.modified_at = new Date();
                    applicantSocial = await applicantSocial.save();
                }
                modelApplicant.socials.push(applicantSocial._id);
            }
        }

        // Referral
        if (req.body.referralEmail) {
            var modelUser = await Users.findOne({ email: req.body.referralEmail });
            if (modelUser == null) {
                modelUser.email = req.body.referralEmail.trim();
                modelUser.created_by = req.user.id;
                modelUser.created_at = new Date();
                modelUser.modified_by = req.user.id;
                modelUser.modified_at = new Date();
                modelUser = await modelUser.save();
            }
            modelApplicant.referral = modelUser._id;
        }

        // Save profile in the end to ensure elastic searchis sycned
        modelApplicant.modified_by = req.user.id;
        modelApplicant.modified_at = new Date();
        modelApplicant = await modelApplicant.save();
        
        // if jobid and pipelinid available then add applicant to that job
        let jobPipeline;
        let modelJobApplicant = new JobApplicant();
        if (req.body.pipelineId) {
            let modelJob = await Jobs.findById(req.body.jobId).populate('pipeline');
            jobPipeline = await JobPipeline.findById({ _id: req.body.pipelineId, is_deleted: { $ne: true } });
            
            if (jobPipeline) {                        
                modelJobApplicant.pipeline = req.body.pipelineId;
                modelJobApplicant.applicant = modelApplicant._id;
                modelJobApplicant.is_deleted = false;
                modelJobApplicant.created_at = new Date();
                modelJobApplicant.created_by = req.user.id;
                modelJobApplicant.modified_at = new Date();
                modelJobApplicant.modified_by = req.user.id;
                modelJobApplicant = await modelJobApplicant.save();
                // Link with Job
                if (modelJob.applicants == null) {
                    modelJob.applicants = [];
                }
                modelJob.applicants.push(modelJobApplicant._id);
                modelJob = await modelJob.save();
                modelJobApplicant.applicant = modelApplicant;
            }
        }
    });
}
