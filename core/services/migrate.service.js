const express = require('express');
const responseService = require('./response.service');
const User = require('../models/user');
const Location = require('../models/location');
const Job = require('../models/job');
const Pipeline = require('../models/jobPipeline');

exports.restoreUser() = (data) => {
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

exports.restoreState = (data) => {
    let states = [];
    data.forEach(obj => {
        let location = new Location();
        location.country = "India";
        location.city = obj.city.city;
        location.state = obj.state;
        location.is_deleted = false;
        location.created_by = "5e6b047ddc8153001188bfcb";
        location.created_at = new Date();
        location.modified_by = "5e6b047ddc8153001188bfcb";
        location.modified_at = new Date();
        states.push(location);
    });
    let result = await Location.create(states);
}

exports.restoreJob = (data) => {
    let jobs = [];
    // get ids of pipeline
    let pipelines = pipeline(data.pipelines);
    data.forEach(obj => {
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
        job.is_deleted = false,
        job.created_by = "5e6b047ddc8153001188bfcb",
        job.created_at = new Date(),
        job.modified_by = "5e6b047ddc8153001188bfcb",
        job.modified_at = new Date()
        jobs.push(job);
    });
    let result = await Job.create(jobs);
}

let pipeline = (data) => {
    let pipelines = [];
    data.forEach(obj => {
        let pipeline = new Pipeline();
        pipeline.name = obj.name;
        pipeline.position = obj.position;
        pipeline.is_deleted = false;
        pipeline.created_by = "5e6b047ddc8153001188bfcb";
        pipeline.created_at = new Date();
        pipeline.modified_by = "5e6b047ddc8153001188bfcb";
        pipeline.modified_at = new Date();
        pipelines.push(pipeline);
    });
    let result = await Pipeline.create(pipelines);
}