var mongoose = require('mongoose');
var mexp = require('mongoosastic');
var config = require('../config').config();
var Schema = mongoose.Schema, ObjectId = Schema.ObjectId;

var applicantSchema = new Schema({
    firstName: { type: String },
    middleName: { type: String },
    lastName: { type: String },
    dob: Date,
    email: {
        type: String,
        unique: true
    },
    phones: Array,
    currentCtc: Number,
    expectedCtc: Number,
    noticePeriod: String,
    noticePeriodNegotiable: String,
    totalExperience: Number,
    availability: String,
    socials: [{
        type: Schema.Types.ObjectId,
        ref: 'ApplicantSocials',
        es_type: 'nested',
        es_include_in_parent: true
    }],
    location: {
        type: Schema.Types.ObjectId,
        ref: 'Locations',
        es_type: 'nested',
        es_include_in_parent: true
    },
    educations: [{
        type: Schema.Types.ObjectId,
        ref: 'ApplicantEducations',
        es_type: 'nested',
        es_include_in_parent: true
    }],
    skills: [{
        type: Schema.Types.ObjectId,
        ref: 'Skills',
        es_type: 'nested',
        es_include_in_parent: true
    }],
    preferredLocations: [{
        type: Schema.Types.ObjectId,
        ref: 'Locations',
        es_type: 'nested',
        es_include_in_parent: true
    }],
    industry: {
        type: Schema.Types.ObjectId,
        ref: 'Industries',
        es_type: 'nested',
        es_include_in_parent: true
    },
    resume: {
        type: Schema.Types.ObjectId,
        ref: 'ApplicantResumes'
    },
    referredBy: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    source: String,
    is_deleted: Boolean,
    created_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    created_at: Date,
    modified_by: {
        type: Schema.Types.ObjectId,
        ref: 'Users'
    },
    modified_at: Date
}, { versionKey: false });

applicantSchema.plugin(mexp, {
    hosts: [
        config.elasticSearch.host
    ],
    populate: [
        { path: 'skills', select: 'name' },
        { path: 'socials', select: 'profileUrl social.name' },
        { path: 'location', select: 'zip city state country' },
        { path: 'preferredLocations', select: 'zip city state country' },
        { path: 'industry', select: 'name' },
    ],
    bulk: {
        size: 10, // preferred number of docs to bulk index
        delay: 100 //milliseconds to wait for enough docs to meet size constraint
    }
});

var Applicants = mongoose.model('Applicants', applicantSchema);
var stream = Applicants.synchronize();
var count = 0;
stream.on('data', function (err, doc) {
    count++;
});
stream.on('sync closed', function () {
    console.log('indexed ' + count + ' documents!');
});
stream.on('sync error', function (err) {
    console.log(err);
});
module.exports = Applicants;